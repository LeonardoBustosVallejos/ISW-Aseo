import Cliente from "../entity/cliente.entity.js";
import Contacto from "../entity/contacto.entity.js";
import Trabajador from "../entity/trabajador.entity.js";
import { AppDataSource } from "../config/configDb.js";
import { ILike, In } from "typeorm";
import { createErrorMessage } from "../cleaners/extras.js";
import User from "../entity/user.entity.js";
import { asignarPersonalService, asignarSupervisorJerarquicoService, asignarSupervisorService, getAsignadosService, getUserService } from "./user.service.js";

import Sede from "../entity/sede.entity.js";
import { getRolByNameService } from "./rol.service.js";
import { getORTrabajadorService } from "./trabajador.service.js";
import { createAnexosYDocumentos, createContratoAnexoService, createContratoComercialService, getAnexoComercialService, getContratoComercialService, getVistaContratosService } from "./contrato.service.js";
import { createMultipleDocumentosService } from "./archivo.service.js";
import TrabajadoresAsignados from "../entity/trabajadoresAsignados.entity.js";
import { calcularPersonalTotal, obtenerLimitePersonalContrato } from "../helpers/personal.helper.js";
import contratoComercialSchema from "../entity/contratos/contratoComercial.entity.js";
import ContratoAnexoSchema from "../entity/contratos/contratoAnexo.entity.js";
/**
 * get...s() lista de todos
 * get...By(params) estricta para un único elemento con findOne AND
 * get...(params) estricta para un único elemento con findOne OR
 * find...sBy(params) flexible para listas con find OR
 * where = {} AND
 * where = [] OR
 */

/**
 * funcion que aplica el uso de ILike() para determinar si un string contiene un substring
 * se utiliza en funciones de busqueda
 * @param dato substring que se quiere saber su existencia 
 * @returns 
 */
const contiene = (dato) => { return ILike(`%${dato}%`) }


//Funciones CRUD relacionadas a Contactos
/**
 * 
 * @returns todos los contactos
 */
export async function getContactosService(manager = null) {
    try {
        const contactoRepository = manager ?
            manager.getRepository(Contacto) : AppDataSource.getRepository(Contacto);

        const contactos = await contactoRepository.find({
            relations: ["sede", "sede.cliente"],
        });
        if (!contactos || contactos.length === 0) {
            return [null, createErrorMessage("contactos", "No hay contactos")]
        }
        return [contactos, null];

    } catch (error) {
        if (Array.isArray(error)) {
            if (manager) throw error
            console.error("Error al obtener contactos", error[1]);
            return error
        }
        console.error("Error al obtener contactos:", error);
        if (manager) throw error
        return [null, "Error interno del servidor"]
    }
}

/**
 * Búsqueda estricta AND, comparaciones exactas
 * @param data datos correspondientes a los campos de un contacto 
 * @returns un único contacto que coincida con TODOS los campos dados
 */
export async function getContactoByService(query, manager = null) {
    try {

        const { contacto_id, contacto_rut, nombreContacto, email, phone } = query

        const contactoRepository = manager ?
            manager.getRepository(Contacto) : AppDataSource.getRepository(Contacto);

        const where = {}    //AND

        if (contacto_id) where.contacto_id = contacto_id
        if (contacto_rut) where.contacto_rut = contacto_rut
        if (nombreContacto) where.nombreContacto = nombreContacto
        if (email) where.email = email
        if (phone) where.phone = phone

        if (Object.keys(where).length === 0) {
            return [null, "Debe enviar al menos un criterio de busqueda"]
        }

        const contacto = await contactoRepository.findOne({
            relations: ["sede", "sede.cliente"],
            where
        });
        if (!contacto) {
            return [null, createErrorMessage("contacto", "Contacto no encontrado")]
        }
        return [contacto, null]

    } catch (error) {
        if (Array.isArray(error)) {
            if (manager) throw error
            console.error("Error al obtener un contacto", error[1]);
            return error
        }
        console.error("Error al obtener un contacto:", error);
        if (manager) throw error
        return [null, "Error interno del servidor"]
    }
}


/**
 * Crea un nuevo contacto asociado a una sede y cliente, el contacto no puede tener un email o teléfono que ya esté registrado en trabajadores, usuarios o contactos, ni un rut que ya esté registrado en trabajadores, usuarios o clientes.
 * @param  contacto datos del contacto a registrar
 * @param  sede_id ID de la sede de quien se es contacto
 * @returns contacto creado o mensaje de error si no se pudo crear por validación o error interno
 */
export async function createContactoService(contacto, sede_id, index = 1, manager = null) {
    try {
        const contactoRepository = manager ?
            manager.getRepository(Contacto) : AppDataSource.getRepository(Contacto);
        //verificar que la sede exista
        const [existingSede, err] = await getSedeByService({ sede_id: sede_id }, manager)
        if (err) {
            if (manager) throw [null, err]
            return [null, err]
        }

        //obtener el cliente de la sede
        const [existingCliente, errCliente] = await getClienteByService({ cliente_id: existingSede.cliente.cliente_id }, manager)
        if (errCliente) {
            if (manager) throw [null, errCliente]
            return [null, errCliente]
        }

        const { email, phone, contacto_rut, nombreContacto, tipoContacto } = contacto
        if (!tipoContacto) {
            if (manager) throw [null, createErrorMessage(`Contacto ${index} - Tipo`, "Seleccione un tipo de contacto")]
            return [null, createErrorMessage(`Contacto ${index} - Tipo`, "Seleccione un tipo de contacto")]
        }

        //verificar que el email del contacto no esté registrado en contactos, trabajadores o usuarios
        const [registerEmail, errEmail] = await getContactoByService({ email: email }, manager)
        const [registerTrabajadorEmail, errEmailTrabajador] = await getORTrabajadorService({ email: email }, manager)
        const [registerUserEmail, errEmailUser] = await getUserService({ email: email }, manager)
        if ((registerEmail && registerEmail.sede.cliente.rutCliente !== existingCliente.rutCliente) || registerTrabajadorEmail || registerUserEmail) {
            if (manager) throw [null, createErrorMessage(`Contacto ${index} - email`, "Correo electrónico ya en uso")]
            return [null, createErrorMessage(`Contacto ${index} - email`, "Correo electrónico ya en uso")];
        }

        //si el contacto tiene teléfono, verificar que no esté registrado en contactos, trabajadores o usuarios
        if (phone) {
            const [registerPhone, errPhone] = await getContactoByService({ phone: phone }, manager)
            const [registerUserPhone, errUserPhone] = await getUserService({ phone: phone }, manager)
            if (registerPhone || registerUserPhone) {
                if (manager) throw [null, createErrorMessage("phone", "Teléfono ya asociado a una cuenta")]
                return [null, createErrorMessage("phone", "Teléfono ya asociado a una cuenta")]
            };
        }

        //verificar que el rut no sea un de trabajador, cliente o usuario
        const [clienteRut, errClienteRut] = await getClienteByService({ rutCliente: contacto_rut }, manager)
        const [existingUserRut, errUserRut] = await getUserService({ rut: contacto_rut }, manager)
        const [existingTranajadorRut, errTrabajadorRut] = await getORTrabajadorService({ rut: contacto_rut }, manager)
        if (existingTranajadorRut || clienteRut || existingUserRut) {
            if (manager) throw [null, createErrorMessage(`Contacto ${index} - rut`, "Rut ya en uso")]
            return [null, createErrorMessage(`Contacto ${index} - rut`, "Rut ya en uso")]
        }
        //verificar que si el rut ya está en contactos, entonces que la sede tambien sea la misma
        const [existingRut, errRut] = await getContactoByService({ contacto_rut: contacto_rut })
        if (existingRut && existingRut.sede.sede_id !== sede_id) {
            if (manager) throw [null, createErrorMessage(`Contacto ${index} -sede`, "Rut ya asignado a otra sede")]
            return [null, createErrorMessage(`Contacto ${index} -sede`, "Rut ya asignado a otra sede")]
        }
        //preparar datos para crear el contacto
        const nuevoContacto = contactoRepository.create({
            nombreContacto: nombreContacto,
            contacto_rut: contacto_rut,
            email: email,
            phone: phone,
            tipoContacto: tipoContacto,
            sede: existingSede,
            cliente: existingCliente
        });
        await contactoRepository.save(nuevoContacto)

        return [nuevoContacto, null]

    } catch (error) {
        if (Array.isArray(error)) {
            if (manager) throw error
            console.error("Error al registrar un contacto", error[1]);
            return error
        }
        console.error("Error al registrar un contacto", error);
        if (manager) throw error
        return [null, "Error interno del servidor"]
    }
}
export async function deleteContactoService(contacto_id, manager = null) {
    try {
        const contactoRepository = manager ?
            manager.getRepository(Contacto) : AppDataSource.getRepository(Contacto);

        const [existingContacto, err1] = await getContactoByService({ contacto_id: contacto_id }, manager)

        if (err1) {
            if (manager) throw [null, createErrorMessage("contacto_id", "No existe el contacto buscado")]
            return [null, createErrorMessage("contacto_id", "No existe el contacto buscado")]
        }

        //comprobar cuantos contactos tiene la sede que tiene éste contacto
        const contactosCount = await contactoRepository.count({
            where: { sede: { sede_id: existingContacto.sede.sede_id } }
        });

        //verificar que la sede no se quede sin contactos
        if (contactosCount <= 1) {
            if (manager) throw [null, createErrorMessage("contacto", "La sede debe tener al menos un contacto")];
            return [null, createErrorMessage("contacto", "La sede debe tener al menos un contacto")];
        }
        const deletedContacto = await contactoRepository.remove(existingContacto)
        const contactosRestantes = await contactoRepository.find({
            where: { sede: { sede_id: existingContacto.sede.sede_id } }
        })
        //Si queda un único contacto o si no hay de tipo PRINCIPAL entonces el siguiente de la lista pasa a serlo
        if (contactosRestantes.length < 2 || !contactosRestantes.some(c => c.tipoContacto === "PRINCIPAL")) {
            contactosRestantes[0].tipoContacto = "PRINCIPAL"
            contactosRestantes[0].updatedAt = new Date()
            await contactoRepository.save(contactosRestantes[0])
        }

        return [deletedContacto, null]

    } catch (error) {
        if (Array.isArray(error)) {
            if (manager) throw error
            console.error("Error al eliminar un contacto", error[1]);
            return error
        }
        console.error("Error al eliminar un contacto:", error);
        if (manager) throw error
        return [null, "Error interno del servidor"]
    }
}
export async function updateContactoService(contacto_id, data, index = 1, manager = null) {
    try {
        const execute = async (transactionManager) => {


            if (data.nombreContacto === "") {
                throw [null, createErrorMessage(`Nombre contacto ${index}`, "Nombre requerido")];

            }
            if (data.email === "") {
                throw [null, createErrorMessage(`Correo contacto ${index}`, "Correo requerido")];

            }
            if (data.contacto_rut === "") {
                throw [null, createErrorMessage(`Rut contacto ${index}`, "Rut requerido")];

            }
            const { nombreContacto, email, phone } = data
            const contactoRepository = manager ? manager.getRepository(Contacto)
                : AppDataSource.getRepository(Contacto);

            //verificar que exista el contacto
            const [currentContacto, errContacto] = await getContactoByService({ contacto_id: contacto_id }, manager)
            if (errContacto) {
                throw [null, errContacto]

            }

            /**
            //validar rut del contacto
            if (contacto_rut && contacto_rut !== currentContacto.contacto_rut) {
                //si se entrega un rut y es distinto al actual
                const [rutUser, errUser] = await getUserService({ rut: contacto_rut }, manager)
                const existingTranajador = await getORTrabajadorService({ rut: contacto_rut }, manager)
                if (rutUser || existingTranajador) {
                    return [null, createErrorMessage("rut", "Rut ya en uso")];
                }
                //si esta en contactos pero es de otro contacto o es contacto de otro cliente
                const [existingRutContacto, errRutContacto] = await getContactoByService({ contacto_rut: contacto_rut }, manager)
                if (existingRutContacto && (existingRutContacto.contacto_id !== contacto_id || existingRutContacto.cliente.cliente_id !== currentContacto.cliente.cliente_id)) {
                    return [null, createErrorMessage("rut", "Rut ya en uso")];
                }
            }
                */
            //validar email duplicado
            if (email && email !== currentContacto.email) {
                const [existingEmail, errEmailContacto] = await getContactoByService({ email: email }, manager)
                const [existingEmailUser, errEmailUser] = await getUserService({ email: email }, manager);
                //Si el email existe pero no es de la misma persona, dar error
                if ((existingEmail && existingEmail.contacto_id !== contacto_id) || existingEmailUser) {
                    throw [null, createErrorMessage(`Email contacto ${index}`, "Correo ya en uso")];

                }
            }

            //validar telefono duplicado
            if (phone && phone !== currentContacto.phone) {
                const [existingPhone, errPhoneContacto] = await getContactoByService({ phone: phone }, manager)
                const [phoneUser, errUser] = await getUserService({ phone: phone }, manager)
                if ((existingPhone && existingPhone.contacto_rut !== currentContacto.contacto_rut) ||
                    (phoneUser && phoneUser.rut !== currentContacto.contacto_rut)) {
                    throw [null, createErrorMessage(`Teléfono contacto ${index}`, "Teléfono ya en uso")];

                }
            }

            //actualizar campos
            await contactoRepository.update({ contacto_id }, { nombreContacto: nombreContacto, email: email, phone: phone, updatedAt: new Date() });

            //obtener contacto actualizado
            const [contactoActualizado, errContactoActualizado] = await getContactoByService({ contacto_id }, manager)
            if (errContactoActualizado) {
                throw [null, createErrorMessage(`Contacto ${index}`, "No se encontró el contacto después de actualizar")]

            }
            return [contactoActualizado, null];
        }
        if (manager) return await execute(manager)
        return await AppDataSource.transaction(execute)
    } catch (error) {
        if (Array.isArray(error)) {
            if (manager) throw error
            console.error("Error al actualizar un contacto", error[1]);
            return error
        }
        console.error(`Error al actualizar contacto ${index}:`, error);
        throw error
    }
}

//funciones CRUD relacionadas a las sedes
export async function getSedesService(manager = null) {
    try {
        const sedeRepository = manager ?
            manager.getRepository(Sede) : AppDataSource.getRepository(Sede);

        const sedes = await sedeRepository.find({
            relations: ["cliente", "contactos"]
        });

        if (!sedes.length) {
            return [null, createErrorMessage("sedes", "No hay sedes")]
        }

        return [sedes, null];

    } catch (error) {
        if (Array.isArray(error)) {
            if (manager) throw error
            console.error("Error al obtener sedes", error[1]);
            return error
        }
        console.error("Error al obtener sedes:", error);
        if (manager) throw error
        return [null, "Error interno del servidor"]
    }
}

export async function listarSedesService(cliente_id = null, manager = null) {
    try {
        const sedeRepository = manager ? manager.getRepository(Sede) :
            AppDataSource.getRepository(Sede);

        const clienteRepository = manager ? manager.getRepository(Cliente) :
            AppDataSource.getRepository(Cliente);

        let clienteFound = null, errorCliente = null

        const sedes = await sedeRepository.find({
            relations: ["cliente", "cliente.contrato"],
        })


    } catch (error) {
        if (Array.isArray(error)) {
            if (manager) throw error
            console.error("Error al obtener sedes", error[1]);
            return error
        }
        console.error("Error al obtener sede:", error);
        if (manager) throw error
        return [null, "Error interno del servidor"]
    }
}

/**
 * Busqueda estricta AND, comparaciones exactas enlazada con cliente y contactos
 * @param {} query 
 * @returns 
 */
export async function getSedeByService(query, manager = null) {
    try {
        const { sede_id, direccion, cliente_id, rutSecundario } = query;

        const sedeRepository = manager ? manager.getRepository(Sede) :
            AppDataSource.getRepository(Sede);

        const where = {};

        if (sede_id) where.sede_id = sede_id;
        if (direccion) where.direccion = direccion;
        if (cliente_id) where.cliente = { cliente_id: cliente_id };
        if (rutSecundario) where.rutSecundario = rutSecundario;

        if (Object.keys(where).length === 0) {
            return [null, "Debe enviar al menos un criterio de busqueda"]
        }

        const sede = await sedeRepository.findOne({
            relations: ["cliente", "contactos", "cliente.clientePadre"],
            where
        });

        if (!sede) {
            return [null, "Sede no encontrada"];
        }

        return [sede, null];

    } catch (error) {
        if (Array.isArray(error)) {
            if (manager) throw error
            console.error("Error al obtener sedes", error[1]);
            return error
        }
        console.error("Error al obtener sede:", error);
        if (manager) throw error
        return [null, "Error interno del servidor"]
    }
}



async function createSede(sede, cliente_id, manager = null) {
    try {
        const sedeRepository = manager.getRepository(Sede)

        const { nombre_sede, direccion, personalSolicitado, rutSecundario } = sede
        //verificar que el cliente exista
        const [cliente, err] = await getClienteByService({ cliente_id: cliente_id }, manager)
        if (err) {
            if (manager) throw [null, createErrorMessage("cliente", "Cliente no existe")];
            return [null, createErrorMessage("cliente", "Cliente no existe")];
        }
        if (rutSecundario) {
            //si el rut ya está registrado a otro cliente
            const [existingRut, errRut] = await getSedeByService({ rutSecundario: rutSecundario }, manager)
            if (existingRut && existingRut.cliente.cliente_id !== cliente_id) {
                if (manager) throw [null, createErrorMessage("rutSecundario", "Rut secundario no valido")];
                return [null, createErrorMessage("rutSecundario", "Rut secundario no valido")];
            }
        }

        //verificar exclusividad del rut con personas
        const [existingUser, errUser] = await getUserService({ rut: rutSecundario }, manager)
        const [existingTrabajador, errTrabajador] = await getORTrabajadorService({ rut: rutSecundario }, manager)
        let existingContactoRut = null, errContactoRut = null
        if (rutSecundario) {
            [existingContactoRut, errContactoRut] = await getContactoByService({ contacto_rut: rutSecundario }, manager)
        }
        if (existingUser || existingTrabajador || existingContactoRut) {
            if (manager) throw [null, createErrorMessage("rutSecundario", "Rut secundario ya en uso")];
            return [null, createErrorMessage("rutSecundario", "Rut secundario ya en uso")];
        }
        const nuevaSede = sedeRepository.create({
            nombre_sede: nombre_sede,
            direccion: direccion,
            personalSolicitado: personalSolicitado,
            rutSecundario: rutSecundario || null,
            cliente: cliente_id,
        });

        const sedeCreada = await sedeRepository.save(nuevaSede);

        return [sedeCreada, null];

    } catch (error) {
        if (Array.isArray(error)) {
            if (manager) throw error
            console.error("Error al crear sede", error[1]);
            return error
        }
        console.error("Error al crear sede:", error);
        if (manager) throw error
        return [null, "Error interno del servidor"]
    }
}

export async function updateSedeService(sede_id, data, manager = null) {
    try {
        const execute = async (transactionManager) => {


            const sedeRepository = transactionManager.getRepository(Sede);

            const { nombre_sede, direccion, personalSolicitado, rutSecundario } = data


            //verificar que la sede exista
            const [sedeFound, errSede] = await getSedeByService({ sede_id: sede_id }, transactionManager)
            if (errSede) {
                throw [null, errSede]
            }

            if (rutSecundario && rutSecundario !== sedeFound.rutSecundario) {
                //si el rut ya está registrado una sede de otro cliente
                const [existingRut, errRut] = await getSedeByService({ rutSecundario: rutSecundario }, transactionManager)
                if (
                    existingRut &&
                    existingRut.sede_id !== sede_id &&
                    existingRut.cliente.cliente_id !== sedeFound.cliente.cliente_id
                ) {
                    throw [null, createErrorMessage("rutSecundario", "Rut secundario no válido")];

                }
            }

            const [existingUser, errUser] = await getUserService({ rut: rutSecundario }, transactionManager)
            const [existingTrabajador, errTrabajador] = await getORTrabajadorService({ rut: rutSecundario }, transactionManager)
            let existingContactoRut = null, errContactoRut = null
            if (rutSecundario) {
                [existingContactoRut, errContactoRut] = await getContactoByService({ contacto_rut: rutSecundario }, transactionManager)
            }
            if (existingUser || existingTrabajador || existingContactoRut) {
                throw [null, createErrorMessage("rutSecundario", "Rut secundario ya en uso")];

            }


            //actualizar la sede
            await sedeRepository.update({ sede_id },
                {
                    nombre_sede: nombre_sede,
                    direccion: direccion,
                    personalSolicitado: personalSolicitado,
                    rutSecundario: rutSecundario || null,
                    updatedAt: new Date(),
                });
            let contactosActualizados = []

            if (data.contactos) {
                let i = 1
                for (const contacto of data.contactos) {
                    const [contactoUpdated, errContacto] = await updateContactoService(contacto.contacto_id, contacto, i, transactionManager)
                    if (errContacto) throw [null, errContacto]

                    contactosActualizados.push(contactoUpdated)
                    i++
                }
            }
            // Obtener la sede actualizada
            const [updatedSede, errUpdated] = await getSedeByService({ sede_id: sede_id }, transactionManager);
            if (errUpdated) {
                throw [null, "Sede no encontrada después de actualizar"];
            }
            return [{ updatedSede, contactosActualizados }, null];
        }
        if (manager) return await execute(manager)
        return await AppDataSource.transaction(execute)
    } catch (error) {
        if (Array.isArray(error)) {
            if (manager) throw error
            console.error("Error al actualizar sede", error[1]);
            return error
        }
        console.error("Error al actualizar sede:", error);
        throw error
    }
}

export async function deleteSedeService(sede_id, manager = null) {
    try {
        const sedeRepository = manager ?
            manager.getRepository(Sede) : AppDataSource.getRepository(Sede);

        const sede = await sedeRepository.findOne({
            where: { sede_id },
            relations: ["contactos"]
        });

        if (!sede) {
            if (manager) throw [null, "Sede no encontrada"];
            return [null, "Sede no encontrada"];
        }

        if (sede.contactos && sede.contactos.length > 0) {
            if (manager) throw [null, "No se puede eliminar una sede con contactos"];
            return [null, "No se puede eliminar una sede con contactos"];
        }

        await sedeRepository.remove(sede);

        return [sede, null];

    } catch (error) {
        if (Array.isArray(error)) {
            if (manager) throw error
            console.error("Error al eliminar sedes", error[1]);
            return error
        }
        console.error("Error al eliminar sede:", error);
        if (manager) throw error
        return [null, "Error interno del servidor"]
    }
}
//funciones CRUD relacionadas a los clientes

/**
 * Muestra todos los clientes, se prioriza los tipo EMPRESA, ya que las filiales están anidadas en estas
 * @returns todos los clientes o mensage de error
 */
export async function getClientesService(manager = null) {
    try {
        const clienteRepository = manager ?
            manager.getRepository(Cliente) : AppDataSource.getRepository(Cliente)

        const clientes = await clienteRepository.find({ relations: ["filiales", "sede"], where: { tipoCliente: "EMPRESA" } })

        if (!clientes || clientes.length === 0) {
            return [null, createErrorMessage("clientes", "No hay clientes")];
        }
        return [clientes, null]
    } catch (error) {
        if (Array.isArray(error)) {
            if (manager) throw error
            console.error("Error al obtener clientes", error[1]);
            return error
        }
        console.error("Error al obtener clientes:", error);
        if (manager) throw error
        return [null, "Error interno del servidor"]
    }
}

export async function listarClientesService(manager = null) {
    try {
        const clienteRepository = manager ? manager.getRepository(Cliente) :
            AppDataSource.getRepository(Cliente)

        const lista = await clienteRepository.find({
            relations: ["sede", "sede.contactos", "contrato"],
            where: {
                sede: {
                    tipoSede: "PRINCIPAL",
                    contactos: { tipoContacto: "PRINCIPAL" }
                }
            }
        })

        if (!lista || lista.length === 0) {
            return [null, "No hay clientes"];
        }
        const clientesConTotales = []

        for (const cliente of lista) {
            const { solicitados, asignados } = await getTotalesCliente(cliente.cliente_id, manager)
            let estadoActual = 'TERMINADO'
            if (cliente.contrato.some(contrato => contrato.estado === 'VIGENTE')) {
                estadoActual = 'VIGENTE'
            } else if (cliente.contrato.some(contrato => contrato.estado === 'SUSPENDIDO')) {
                estadoActual = 'SUSPENDIDO'
            } else if (cliente.contrato.some(contrato => contrato.estado === 'ESPERA')) {
                estadoActual = 'ESPERA'
            }

            clientesConTotales.push({
                cliente_id: cliente.cliente_id,
                nombreCliente: cliente.nombreCliente,
                rutCliente: cliente.rutCliente,
                tipoCliente: cliente.tipoCliente,
                contrato: estadoActual,
                direccionPrincipal: cliente.sede[0].direccion,
                nombreContacto: cliente.sede[0].contactos[0].nombreContacto,
                email: cliente.sede[0].contactos[0].email,
                phone: cliente.sede[0].contactos[0].phone,
                solicitados, asignados
            })
        }


        return [
            { lista: clientesConTotales },
            null
        ];
    } catch (error) {
        if (Array.isArray(error)) {
            if (manager) throw error
            console.error("Error al obtener clientes", error[1]);
            return error
        }
        console.error("Error al obtener clientes:", error);
        if (manager) throw error
        return [null, "Error interno del servidor"]
    }
}



/**
 * Obtiene el total de personal asignado y de personal solicitado
 * @param {*} cliente_id 
 * @param {*} manager 
 * @returns 
 */
export async function getTotalesCliente(cliente_id, manager) {
    try {
        const clienteRepository = manager ? manager.getRepository(Cliente) :
            AppDataSource.getRepository(Cliente);

        if (!cliente_id) return [0, 0]

        const padre = await clienteRepository.findOne({
            where: { cliente_id },
            relations: ["sede"]
        })
        if (!padre) return [0, 0]
        let [solicitados, asignados] = [0, 0]

        solicitados += sumarSolicitados(padre)
        asignados += sumarAsignados(padre)

        const filiales = await clienteRepository.find({
            where: { clientePadre: { cliente_id } }
        });
        for (const filial of filiales) {

            const totalFiliales = await getTotalesCliente(filial.cliente_id, manager);
            solicitados += totalFiliales.solicitados
            asignados += totalFiliales.asignados
        }
        return { solicitados, asignados }

    } catch (error) {
        console.error("Error calculando asignados:", error);
        if (manager) throw error;
        return [0, 0];
    }
}



function sumarSolicitados(cliente) {
    let total = 0
    for (const sede of cliente.sede || []) {
        total += sede.personalSolicitado
    }
    for (const filial of cliente.filiales || []) {
        total += sumarSolicitados(filial)
    }
    return total
}
function sumarAsignados(cliente) {
    let total = 0
    for (const sede of cliente.sede || []) {
        total += sede.personalAsignado
    }
    for (const filial of cliente.filiales || []) {
        total += sumarAsignados(filial)
    }
    return total
}


/**
 * Búsqueda estricta AND, comparaciones exactas
 * @param query datos correspondientes a los campos de un contacto, excluye conexiones
 * @returns un único cliente que coincida con TODOS los campos dados
 */
export async function getClienteByService(data, manager = null) {
    try {
        const clienteRepository = manager ? manager.getRepository(Cliente) :
            AppDataSource.getRepository(Cliente)
        const { cliente_id, nombreCliente, rutCliente, tipoCliente } = data

        const where = {}    //AND
        if (cliente_id) where.cliente_id = cliente_id
        if (nombreCliente) where.nombreCliente = nombreCliente
        if (rutCliente) where.rutCliente = rutCliente
        if (tipoCliente) where.tipoCliente = tipoCliente

        if (Object.keys(where).length === 0) {
            return [null, "Debe enviar al menos un criterio de busqueda"]
        }

        const cliente = await clienteRepository.findOne({ relations: ["sede"], where })

        if (!cliente) {
            return [null, createErrorMessage("cliente", "Cliente no encontrado")]
        }
        return [cliente, null]

    } catch (error) {
        if (Array.isArray(error)) {
            if (manager) throw error
            console.error("Error al obtene el cliente", error[1]);
            return error
        }
        console.error("Error al obtener el cliente:", error);
        if (manager) throw error
        return [null, "Error interno del servidor"]
    }
}


export async function deleteClienteService(cliente_id, manager = null) {
    try {
        const [clienteFound, err] = await getClienteByService({ cliente_id: cliente_id }, manager)

        if (err) {
            if (manager) throw [null, err]
            return [null, err]
        }
        const clienteRepository = manager ?
            manager.getRepository(Cliente) : AppDataSource.getRepository(Cliente);

        const clienteDeleted = await clienteRepository.remove(clienteFound)

        return [clienteDeleted, null]

    } catch (error) {
        if (Array.isArray(error)) {
            if (manager) throw error
            console.error("Error al eliminar un cliente", error[1]);
            return error
        }
        console.error("Error al eliminar un cliente:", error);
        if (manager) throw error
        return [null, "Error interno del servidor"]
    }
}

export async function updateClienteService(cliente_id, data, manager = null) {
    try {
        const { nombreCliente, tipoCliente } = data
        const rutCliente = data.rutCliente
        if (nombreCliente === "") {
            if (manager) throw [null, createErrorMessage("nombreCliente", "Datos inválidos")];
            return [null, createErrorMessage("nombreCliente", "Datos inválidos")];
        } if (rutCliente === "") {
            if (manager) throw [null, createErrorMessage("rutCliente", "Datos inválidos")];
            return [null, createErrorMessage("rutCliente", "Datos inválidos")];
        } if (tipoCliente === "") {
            if (manager) throw [null, createErrorMessage("tipoCliente", "Datos inválidos")];
            return [null, createErrorMessage("tipoCliente", "Datos inválidos")];
        }
        const clienteRepository = manager ?
            manager.getRepository(Cliente) : AppDataSource.getRepository(Cliente);

        const [cliente, errCliente] = await getClienteByService({ cliente_id }, manager)

        if (errCliente) {
            if (manager) throw [null, createErrorMessage("cliente", "No encontrado")];
            return [null, createErrorMessage("cliente", "No encontrado")];
        }
        //si se entrega un rut, es distinto al actual y está en uso
        if (rutCliente && rutCliente !== cliente.rutCliente) {
            const existente = await clienteRepository.findOne({
                where: { rutCliente: rutCliente }
            });

            if (existente) {
                if (manager) throw [null, createErrorMessage("rut", "Rut ya en uso")];
                return [null, createErrorMessage("rut", "Rut ya en uso")];
            }
        }

        await clienteRepository.update({ cliente_id }, { nombreCliente: nombreCliente, rutCliente: rutCliente, tipoCliente: tipoCliente, updatedAt: new Date() });
        const [updatedCliente, errUpdate] = await getClienteByService({ cliente_id }, manager)
        if (errUpdate) {
            if (manager) throw [null, "Cliente no encontrado después de actualizar: " + errUpdate]
            return [null, "Cliente no encontrado después de actualizar: " + errUpdate]
        }
        return [updatedCliente, null];

    } catch (error) {
        if (Array.isArray(error)) {
            if (manager) throw error
            console.error("Error al actualizar cliente", error[1]);
            return error
        }
        console.error("Error al actualizar cliente:", error);
        if (manager) throw error
        return [null, "Error interno del servidor"]
    }
}

/**
 * Crea un cliente sin sede ni contacto, se utiliza para validar y crear clientes.
 * 
 * @param {*} cliente datos del cliente a crear. nombreCliente y rutCliente
 * @param {*} clientePadre_id ID del cliente padre, si se entrega el cliente a crear es filial, sino el ID es nulo
 * @returns 
 */
async function createCliente(cliente, clientePadre_id = null, relaciones = {}, manager = null) {
    try {
        const contratoRepository = manager ? manager.getRepository(contratoComercialSchema)
            : AppDataSource.getRepository(ContratoAnexoSchema)

        const anexoRepository = manager ? manager.getRepository(ContratoAnexoSchema)
            : AppDataSource.getRepository(ContratoAnexoSchema)

        const sedeRepository = manager ? manager.getRepository(Sede)
            : AppDataSource.getRepository(Sede)

        const { nombreCliente } = cliente
        let rutCliente = cliente.rutCliente
        let verificado = false
        const {
            contratos = [],
            anexos = []
        } = relaciones;
        if (!cliente.nombreCliente) {
            if (manager) throw [null, createErrorMessage(clientePadre_id ? "nombreFilial" : "nombreCliente", "Datos incompletos")]
            return [null, createErrorMessage(clientePadre_id ? "nombreFilial" : "nombreCliente", "Datos incompletos")]
        }
        let rutNuevo = rutCliente, [padre, errPadre] = [null, null]
        const clienteRepository = manager ? manager.getRepository(Cliente) :
            AppDataSource.getRepository(Cliente);

        //si es filial, que exista el padre
        if (clientePadre_id) {
            [padre, errPadre] = await getClienteByService({ cliente_id: clientePadre_id }, manager)
            //si se va a afiliar y no existe quien
            if (errPadre) throw [null, errPadre]
        }
        //si no hay rut
        if (!rutNuevo) {
            //y es filial
            if (padre) {
                //se toma el rut del padre
                rutNuevo = padre.rutCliente
                verificado = true                       //se marca como verificado
            } else {
                //y no es filial(es tope/raiz)
                throw [null, createErrorMessage(clientePadre_id ? "rutFilial" : "rutCliente", "Datos incompletos")]
            }
        }

        //si es tope/raiz 
        if (!clientePadre_id) {
            const activo = await clienteRepository.findOne({
                relations: ["contrato"],
                where: {
                    rutCliente: rutNuevo,
                    tipoCliente: "EMPRESA",
                    contrato: { estado: In(["VIGENTE", "ESPERA"]) }
                }
            })
            //solo se puede registrar de nuevo si no tiene contrato en espera o vigente
            if (activo) {
                throw [null, createErrorMessage("cliente", "El cliente a registrar ya tiene un contrato activo")]
            }
        }

        //si no pasó por la verificacion anterior o ya viene un rut diferente al del padre, aun puede ser raiz/tope SIN CONTRATO
        if (!verificado || (padre && padre.rutCliente !== rutNuevo)) {
            //validar el rut con los de personas
            const [existingRutUser, errRutUser] = await getUserService({ rut: rutCliente }, manager);
            const [existingRutContacto, errRutContacto] = await getContactoByService({ contacto_rut: rutCliente }, manager)
            if (existingRutUser || existingRutContacto) {
                if (manager) throw [null, createErrorMessage(clientePadre_id ? "rutFilial" : "rutCliente", "Rut en uso")];
                return [null, createErrorMessage(clientePadre_id ? "rutFilial" : "rutCliente", "Rut en uso")];
            }

            //validar rut entre empresas cliente

            //obtener a todos los que puedan tener el mismo rut
            const clientesConRut = await clienteRepository.find({
                where: { rutCliente: rutNuevo },
                relations: ["contrato"]
            });
            //si es tope en jerarquia/raiz y el rut ya existe 1 0 1
            if ((!clientePadre_id) && clientesConRut.length > 0) throw [null, createErrorMessage("rutCliente", "Rut ya en uso")]
        }

        let contratosEntities = []
        let anexosEntities = []

        if (contratos?.length > 0) {
            contratosEntities = await contratoRepository.find({
                where: { id_contrato_comercial: In(contratos) }
            })
        }

        if (anexos?.length > 0) {
            anexosEntities = await anexoRepository.find({
                where: { id_anexo: In(anexos) }
            })
        }

        //preparar los datos para crear el nuevo cliente
        const nuevoCliente = clienteRepository.create({
            nombreCliente: nombreCliente,
            rutCliente: rutNuevo,
            tipoCliente: clientePadre_id ? "FILIAL" : "EMPRESA",
            clientePadre: clientePadre_id, //nulo si el cliente padre no fue entregado

            contratos: contratosEntities,
            anexos: anexosEntities
        });

        const clienteCreado = await clienteRepository.save(nuevoCliente);

        return [clienteCreado, null];

    } catch (error) {
        if (Array.isArray(error)) {
            console.error("Error al registrar un cliente", error[1]);
            if (manager) throw error
            return error
        }
        console.error("Error al registrar un cliente", error);
        if (manager) throw error
        return [null, "Error interno del servidor"]
    }
}
/*=====FIN FUNCIONES CRUD======*/

//funciones para obtener la informacion relevante de la entidad
export async function getInfoContactos(cliente_id, manager = null) {
    try {
        const contactoRepository = manager ? manager.getRepository(Contacto) :
            AppDataSource.getRepository(Contacto)
        const contactosFound = await contactoRepository.find({
            relations: ['sede', 'cliente'],
            where: { cliente: { cliente_id: cliente_id } }
        })

        if (!contactosFound || contactosFound.length === 0) return [null, createErrorMessage('Contactos', 'No hay Contactos')]


        return [contactosFound, null]
    } catch (error) {
        if (Array.isArray(error)) {
            console.error("Error al obtener un informacion", error[1]);
            if (manager) throw error
            return error
        }
        console.error("Error al obtener contactos:", error);
        if (manager) throw error
        return [null, "Error interno del servidor"]
    }
}

export async function getInfoSedeService(cliente, sede_id = null, manager = null) {
    try {
        const sedeRepository = manager ? manager.getRepository(Sede) :
            AppDataSource.getRepository(Sede)

        const { rutCliente, cliente_id } = cliente

        const where = {}
        if (cliente_id) where.cliente = { cliente_id }
        if (rutCliente) where.cliente = { rutCliente }
        if (sede_id) where.sede_id = sede_id

        //1. Obter la sede por su ID y a quien pertenece
        const sedes = await sedeRepository.find({
            relations: ["contactos", "cliente", "contrato"],
            where,
            order: {
                createdAt: "DESC"
            }
        })
        if (!sedes || sedes.length === 0) return [null, createErrorMessage("sede", "Sede no encontrada")]

        let datosSede = []
        for (const sede of sedes) {
            const sedeData = { ...sede }
            const [historial, errorHistorial] = await getAsignadosService({ rutCliente, cliente_id: sede.cliente.cliente_id, sede_id }, null, manager)
            if (errorHistorial && errorHistorial !== "No hay trabajadores asignados") {
                return [null, errorHistorial]
            }
            sedeData.historial = historial || errorHistorial

            const [contratos, errContrato] = await getContratoComercialService(null, { cliente_id: sede.cliente.cliente_id, sede_id: sede.sede_id }, manager)
            if (errContrato && errContrato !== "Contrato no encontrado") return [null, errContrato]
            sedeData.contratos = contratos || errContrato

            const [anexos, errAnexos] = await getAnexoComercialService(null, sede_id || sede.sede_id, manager)
            if (errAnexos && errAnexos !== "Anexos no encontrados") return [null, errAnexos]
            sedeData.anexos = anexos || errAnexos

            datosSede.push(sedeData)
        }

        return [datosSede, null]
    } catch (error) {
        if (Array.isArray(error)) {
            if (manager) throw error
            console.error("Error al obtener sedes", error[1]);
            return error
        }
        console.error("Error al obtener sedes:", error);
        if (manager) throw error
        return [null, "Error interno del servidor"]
    }
}

//vieja
export async function getInfoClientesService(cliente_id, rutCliente, manager = null) {
    try {
        const clienteRepository = manager ? manager.getRepository(Cliente) :
            AppDataSource.getRepository(Cliente)

        const { rutCliente, cliente_id } = cliente
        if (!rutCliente) return [null, createErrorMessage("rutCliente", "Debe entregar el rut del cliente para obtener su información")]
        const where = {}

        where.rutCliente = rutCliente
        if (cliente_id) where.cliente_id = cliente_id

        //1. obtener al/los cliente(s) buscado(s)
        const listaClientes = await clienteRepository.find({
            where,
            relations: ["contrato", 'contrato.anexos']
        })
        if (!listaClientes) {
            if (manager) throw [null, createErrorMessage("cliente", "No encontrado")];
            return [null, createErrorMessage("cliente", "No encontrado")];
        }
        const listaCompleta = []
        for (const cliente of listaClientes) {
            const data = {}
            data.cliente = cliente
            const { personalSolicitado, personalAsignado } = await getTotalesCliente(cliente.cliente_id, manager)

            //2. Obtener las sedes
            const sedeRepository = manager ? manager.getRepository(Sede) :
                AppDataSource.getRepository(Sede)


            const [sedes, errSedes] = await getInfoSedeService({ cliente_id: cliente.cliente_id }, null, manager)
            data.sedes = sedes

            //3. Obtener las filiales
            const filiales = await clienteRepository.find({
                where: { clientePadre: { rutCliente: rutCliente }, },
            })
            data.filiales = filiales
            listaCompleta.push(data)
        }

        return [listaCompleta, null]

    } catch (error) {
        if (Array.isArray(error)) {
            if (manager) throw error
            console.error("Error al obtener clientes", error[1]);
            return error
        }
        console.error("Error al obtener clientes:", error);
        if (manager) throw error
        return [null, "Error interno del servidor"]
    }
}

export async function getInfoClienteService(clienteData, manager = null) {
    try {
        const clienteRepository = manager ? manager.getRepository(Cliente) :
            AppDataSource.getRepository(Cliente)

        const { rutCliente, cliente_id } = clienteData
        if (!rutCliente) return [null, createErrorMessage("rutCliente", "Debe entregar el rut del cliente para obtener su información")]
        const where = {}

        where.rutCliente = rutCliente
        where.cliente_id = cliente_id

        //1. obtener al/los cliente(s) buscado(s)
        const clienteFound = await clienteRepository.findOne({
            where,
            relations: ["contactos", "contrato", 'contrato.anexos', 'contrato.documentos', 'contrato.anexos.documentos', 'clientePadre'],
            order: {
                createdAt: "DESC"
            }
        })
        if (!clienteFound) {
            if (manager) throw [null, createErrorMessage("cliente", "No encontrado")];
            return [null, createErrorMessage("cliente", "No encontrado")];
        }
        const data = {
            cliente: clienteFound,
            contratos: [],
            anexos: [],
            documentos: [],
            contactos: [],
            filiales: []
        }

        const { solicitados, asignados } = await getTotalesCliente(clienteFound.cliente_id, manager)

        data.solicitados = solicitados
        data.asignados = asignados

        //2. Obtener las sedes
        const sedeRepository = manager ? manager.getRepository(Sede) :
            AppDataSource.getRepository(Sede)

        const [sedes, errSedes] = await getInfoSedeService({ cliente_id: clienteFound.cliente_id }, null, manager)
        data.sedes = sedes

        const [contactos, errContactos] = await getInfoContactos(clienteFound.cliente_id, manager)
        data.contactos = contactos
        /*
                for (const sede of sedes) {
                    for (const contacto of sede.contactos) {
                        data.contactos.push(contacto)
                    }
                }
        */
        //3. Obtener las filiales
        const filiales = await clienteRepository.find({
            relations: ['sede'],
            where: { clientePadre: { cliente_id: clienteFound.cliente_id }, },
        })
        if (filiales && filiales.length > 0) {
            for (const filial of filiales) {

                const [filialData, errFilial] = await getInfoClienteService({ cliente_id: filial.cliente_id, rutCliente: filial.rutCliente }, manager)
                if (errFilial) return [null, errFilial]
                data.filiales.push({ ...filialData, ...filialData.cliente })
            }
        }
        let estadoActual = "TERMINADO";

        if (data.contratos.some(c => c.estado === "VIGENTE")) {
            estadoActual = "VIGENTE";
        }
        else if (data.contratos.some(c => c.estado === "SUSPENDIDO")) {
            estadoActual = "SUSPENDIDO";
        }
        else if (data.contratos.some(c => c.estado === "ESPERA")) {
            estadoActual = "ESPERA";
        }

        data.estado = estadoActual;
        const contratoRepository = manager ? manager.getRepository(contratoComercialSchema)
            : AppDataSource.getRepository(contratoComercialSchema)

        data.contratos = await contratoRepository
            .createQueryBuilder("contrato")
            .leftJoinAndSelect("contrato.cliente", "cliente")
            .leftJoinAndSelect("contrato.sedes", "sedes")
            .leftJoinAndSelect("contrato.documentos", "documentos")
            .leftJoinAndSelect("contrato.anexos", "anexos")
            .leftJoinAndSelect("anexos.sedes", "anexoSedes")
            .leftJoinAndSelect("anexos.documentos", "anexoDocumentos")
            .where("cliente.cliente_id = :cliente_id", {
                cliente_id: clienteFound.cliente_id
            })
            .orderBy("contrato.createdAt", "DESC")
            .getMany();
        for (const contrato of data.contratos) {

            data.documentos.push(...contrato.documentos);

            for (const anexo of contrato.anexos) {

                data.anexos.push(anexo);

                data.documentos.push(...anexo.documentos);

            }

        }


        return [data, null]

    } catch (error) {
        if (Array.isArray(error)) {
            if (manager) throw error
            console.error("Error al obtener clientes", error[1]);
            return error
        }
        console.error("Error al obtener clientes:", error);
        if (manager) throw error
        return [null, "Error interno del servidor"]
    }
}

/**
 * Funciones con Simple en el nombre son funciones que realizan un proceso sin jerarquias
 * Son utilizadas principalmente para pruebas
 */

/**
 * Funcion para registrar un cliente o filial de forma simple, con la posibilidad de asignar un supervisor desde el registro, 
 * pero sin necesidad de crear un perfil para el cliente o filial, ni asignar un contrato comercial al momento del registro
 * @param {*} data datos correspondiente al cliente, sede y contacto de un cliente/filial
 * @param {*} clientePadre_id ID de cliente padre, si se entrega el cliente a crear es filial, sino el ID es nulo
 * @param {*} trabajador_id ID de trabajador a asignar como supervisor del cliente, este campo es opcional, si no se entrega el cliente se registrará sin supervisor asignado
 * @returns datos registrados o mensaje de error, en caso de error se eliminarán los datos ingresados para evitar registros incompletos o espacio ocupado innecesariamente
 */
export async function registerClienteSimpleService(data, trabajador_id = null) {
    try {
        return await AppDataSource.transaction(async manager => {
            //verificar que el trabajador exista antes de intentar registrar el cliente, para evitar registros incompletos


            const { cliente, filial, sede, contacto } = data;

            if (!cliente || !sede || !contacto) throw [null, createErrorMessage("cliente/sede/contacto", "Datos incompletos")]

            let trabajador = null, errTrabajador = null
            if (trabajador_id) {
                [trabajador, errTrabajador] = await getORTrabajadorService({ id: trabajador_id });
                if (errTrabajador) throw errTrabajador
                if (trabajador.rol !== "trabajador") return [null, createErrorMessage("trabajador_id", "El trabajador entregado no califica para ser supervisor")]
            }
            //el cliente, posible filial, posible trabajador y contacto a registrar no pueden tener el mismo rut
            if ((filial && filial.rutCliente === cliente.rutCliente) ||                                                 //verificacion de filial para cliente
                (trabajador && (cliente.rutCliente === trabajador.rut || trabajador.rut === contacto.contacto_rut)) ||  //verificacion con trabajador para supervisor
                cliente.rutCliente === contacto.contacto_rut)                                                           //verificacion de contacto para cliente
                throw [null, createErrorMessage("rut", "Rut duplicado")]


            //verificar el rut con las sedes, que no esté registrado en una sede de otro cliente
            const [existingSedeRut, errSedeRut] = await getSedeByService({ rutSecundario: cliente.rutCliente }, manager)
            if (existingSedeRut) return [null, createErrorMessage("rut", "Rut ya en uso")]

            if (filial && Object.keys(filial).length > 0) {
                const [existingSedeRutFilial, errSedeRutFilial] = await getSedeByService({ rutSecundario: filial.rutCliente }, manager)

                if (existingSedeRutFilial) return [null, createErrorMessage("rut", "Rut ya en uso")]
            }


            //registrar en la tabla cliente
            const [clienteCreado, errClienteCreado] = await createCliente(cliente, null, manager)
            if (errClienteCreado) return [null, errClienteCreado]
            console.log("=> Cliente registrado");

            let filialCreada = null, errFilial = null
            if (filial && Object.keys(filial).length > 0) {
                //si se entrega una filial, se registra como cliente con clientePadre_id del cliente recién creado
                [filialCreada, errFilial] = await createCliente(filial, clienteCreado.cliente_id, manager)
                if (errFilial) {
                    console.error("=> Error de registro");
                    throw [null, errFilial];
                }
            }
            //registrar la sede del cliente
            const [sedeCreada, errSede] = await createSede(sede, filialCreada ? filialCreada.cliente_id : clienteCreado.cliente_id, manager);
            if (errSede) {
                //await deleteUserService({ id: perfilCreado.id })
                console.error("=> Error de registro");
                throw errSede;

            }
            console.log("\t=> Sede registrada");

            /*
            const [rolCliente, errRol] = await getRolByNameService("Cliente")
            const [perfilCreado, errPerfil] = await registerService(
                {
                    nombreCompleto: nombreCompleto,
                    rut: rut,
                    email: email,
                    password: password,
                    rol_id: rolCliente.id
                })
            if (errPerfil) {
                return [null, errPerfil]
            }
            */

            //registrar el contacto
            const [contactoCreado, errContacto] = await createContactoService(contacto, sedeCreada.sede_id, manager)
            if (errContacto) {
                //await deleteUserService({ id: perfilCreado.id })
                console.error("=> Error de registro");
                throw errContacto;

            }
            console.log("\t=> Contacto registrado");

            //registrar un nuevo usuario como supervisor del nuevo cliente
            let usuarioSupervisor = null, errSupervisor = null
            if (trabajador_id) {
                [usuarioSupervisor, errSupervisor] = await asignarPersonalService({ id: trabajador_id, rol: "SUPERVISOR" }, sedeCreada.sede_id, manager)
                if (errSupervisor) {
                    //await deleteUserService({ id: perfilCreado.id })
                    console.error("=> Error de registro:", errSupervisor);
                    throw errSupervisor;

                }
                console.log("\t=> Supervisor registrado");
            }
            if (!trabajador_id) {
                console.log("\t=> No se asignó supervisor");
            }

            return [{
                Cliente: clienteCreado,
                Filial: filialCreada,
                Sede: sedeCreada,
                Contacto: contactoCreado,
                usuarioSupervisor,
            }, null]





        })
    } catch (error) {
        if (Array.isArray(error)) {
            console.error("Error al registrar un cliente", error[1]);
            return error
        }
        console.error("Error al registrar un cliente", error);
        return [null, "Error interno del servidor"]
    }
}




//Funciones compuestas para registro jerarquico

export async function registerClienteJerarquicoYArchivoService(data, manager = null) {
    try {
        const execute = async (transactionManager) => {
            const { cliente, sedes, contrato, anexos, documentosContrato, } = data
            const { filiales } = cliente

            //validar que la cantidad de personal requerido en las sedes no exceda lo que dice el contrato/anexo
            const totalPersonal = calcularPersonalTotal(sedes, filiales || [])
            const limitePersonal = obtenerLimitePersonalContrato(contrato, anexos || [])

            if (limitePersonal > 0 && totalPersonal > limitePersonal) throw [null, createErrorMessage("contrato", `La cantidad total de personal solicitada (${totalPersonal}) excede el límite permitido (${limitePersonal})`)]

            //registrar jerarquía clientes, sedes, contactos y asignar supervisor/es

            const [clientePadre, errorPadre] = await createCliente(cliente, null, {}, transactionManager)
            if (errorPadre) throw [null, errorPadre]
            console.log('=>Cliente creado');

            const [sedesCreadas, errSedes] = await registerSedesJerarquicoService(sedes, clientePadre.cliente_id, transactionManager)
            if (errSedes) throw [null, errSedes]
            console.log("=>Sedes Creadas");

            const sedes_ids = []
            for (const sede of sedesCreadas) {
                const { sede_id, ...sedeSeparada } = sede
                sedes_ids.push(sede_id)
            }

            const [contratoCreado, errContrato] = await createContratoComercialService({ ...contrato, sedes: sedes_ids }, documentosContrato, clientePadre.cliente_id, transactionManager)
            if (errContrato) throw [null, errContrato]
            console.log("=>Contrato Creado");



            let anexosCreados = [], errorAnexos = null

            if (Array.isArray(anexos) && anexos.length > 0) {
                [anexosCreados, errorAnexos] = await createAnexosYDocumentos(anexos, sedes_ids, contratoCreado.id_contrato_comercial, transactionManager)
                if (errorAnexos) throw [null, errorAnexos]
            }
            const anexosIds = anexosCreados.map(a => a.id_anexo);
            const contratosIds = [
                contratoCreado.id_contrato_comercial
            ];
            let filialesCreadas = []
            if (filiales || (Array.isArray(filiales) && filiales.length > 0)) {
                for (const filial of filiales) {
                    const [clienteJerarquico, errCliente] = await registerClienteJerarquicoService(filial, filial.sedes, contratosIds,
                        anexosIds, clientePadre.cliente_id, transactionManager)
                    if (errCliente) throw [null, errCliente]
                    filialesCreadas.push(clienteJerarquico)
                }
                console.log("=>Filiales Creadas");
            }

            return [{
                cliente: clientePadre,
                contrato: contratoCreado,
                sedes: sedesCreadas,
                anexos: anexosCreados,
                filiales: filialesCreadas
            }, null
            ]
        }
        if (manager) return await execute(manager)
        return await AppDataSource.transaction(execute)
    } catch (error) {
        if (Array.isArray(error)) {
            console.error("Error al registrar un cliente/contrato/documentos", error[1]);
            if (manager) throw error
            return error
        }
        console.error("Error al registrar un cliente/contrato/documento", error);
        if (manager) throw error
        return [null, "Error interno del servidor"]
    }
}


/**
 * Función para registrar un cliente o filial de forma jerárquica, con la posibilidad de asignar un supervisor desde el registro, pero sin necesidad de crear un perfil para el cliente o filial, ni asignar un contrato comercial al momento del registro, esta función se puede llamar recursivamente para registrar filiales anidadas
 * @param {*} cliente datos básicos del cliente con posibles filiales (subClientes) anidadas
 * @param {*} sedes Lista de sedes del cliente a registrar
 * @param {*} clientePadre_id ID opcional de un cliente al que se es afiliado
 * @param {*} manager espacio temporal en la base de datos
 * @returns Lista de cliente agregado y todos sus componentes
 */
export async function registerClienteJerarquicoService(cliente, sedes, contratos = [],
    anexos = [], clientePadre_id = null, manager = null) {
    try {

        const execute = async (transactionManager) => {

            const { nombreCliente, rutCliente, filiales } = cliente

            const [clientePadre, errorPadre] = await createCliente(cliente, clientePadre_id, { contratos, anexos }, transactionManager)
            if (errorPadre) throw [null, errorPadre]

            const [sedesCreadas, errSedes] = await registerSedesJerarquicoService(sedes, clientePadre.cliente_id, transactionManager)
            if (errSedes) throw [null, errSedes]


            const filialResponse = []
            if ((Array.isArray(filiales) && filiales.length > 0)) {
                for (const filial of filiales) {
                    const [filialesCreadas, errFiliales] = await registerClienteJerarquicoService(filial, filial.sedes, {
                        contratos,
                        anexos
                    }, clientePadre.cliente_id, transactionManager)
                    if (errFiliales) throw [null, errFiliales]
                    filialResponse.push(filialesCreadas)
                }
            }

            return [
                {
                    ...clientePadre,
                    sedes: sedesCreadas,
                    filiales: filialResponse
                }
                , null]

        }

        if (manager) return await execute(manager)

        return await AppDataSource.transaction(execute)
    } catch (error) {
        if (Array.isArray(error)) {
            console.error("Error al registrar un cliente", error[1]);
            if (manager) throw error
            return error
        }
        console.error("Error al registrar un cliente", error);
        if (manager) throw error
        return [null, "Error interno del servidor"]
    }
}
export async function registerSedesJerarquicoService(sedes, cliente_id, manager = null) {
    try {
        const execute = async (transactionManager) => {
            const sedesCreadas = []

            for (const sede of sedes || []) {
                //extraer los datos de la sede a agregar
                const { nombre_sede, direccion, personalSolicitado, trabajadores, contactos } = sede

                if (!nombre_sede || !direccion) throw [null, createErrorMessage("nombre_sede/direccion", "Datos incompletos")]

                //registrar en el espacio temporal la sede recorrida
                const [sedeCreada, errorSedes] = await createSede(
                    { nombre_sede, direccion, personalSolicitado, },
                    cliente_id,
                    transactionManager
                )
                if (errorSedes) throw [null, errorSedes]

                //constante que almacenará la una sede y la lista de contactos y supervisores
                const sedeResponse = {
                    ...sedeCreada,
                    supervisores: [],
                    contactos: []
                }

                //registrar los contactos de la sede recorrida, utilizando el ID de la sede recién creada y el espacio temporal
                const [contactosCreados, errContactos] = await registerContactoJerarquicoService(contactos, sedeCreada.sede_id, transactionManager)
                if (errContactos) throw [null, errContactos]
                sedeResponse.contactos = contactosCreados

                //registrar los supervisores de la sede recorrida, utilizando el ID de la sede recién creada y el espacio temporal
                if (Array.isArray(trabajadores) && trabajadores.length > 0) {

                    const [supervisores, errSupervisores] = await asignarSupervisorJerarquicoService(trabajadores, sedeCreada.sede_id, cliente_id, transactionManager)
                    if (errSupervisores) throw [null, errSupervisores]
                    sedeResponse.supervisores = supervisores
                }

                sedesCreadas.push(sedeResponse)
            }
            return [sedesCreadas, null]
        }

        if (manager) return await execute(manager)
        return await AppDataSource.transaction(execute)
    } catch (error) {
        if (Array.isArray(error)) {
            console.error("Error al registrar un cliente", error[1]);

            if (manager) throw error
            return error
        }
        console.error("Error al registrar un cliente", error);
        if (manager) throw error
        return [null, "Error interno del servidor"]

    }
}
export async function registerContactoJerarquicoService(contactos, sede_id, manager = null) {
    try {
        const execute = async (transactionManager) => {
            const contactosCreados = []
            //recorrer la lista de contactos 
            let i = 1
            for (const contacto of contactos || []) {
                const { nombreContacto, contacto_rut, email, phone, tipoContacto } = contacto
                const [contactoCreado, errContacto] = await createContactoService(
                    { nombreContacto, contacto_rut, email, phone, tipoContacto },
                    sede_id,
                    i,
                    transactionManager)
                if (errContacto) throw errContacto

                contactosCreados.push(contactoCreado)
                i++
            }
            return [contactosCreados, null]
        }

        if (manager) return await execute(manager)
        return await AppDataSource.transaction(execute)
    } catch (error) {
        if (Array.isArray(error)) {
            console.error("Error al registrar un cliente", error[1]);
            if (manager) throw error
            return error
        }
        console.error("Error al registrar un cliente", error);
        if (manager) throw error
        return [null, "Error interno del servidor"]
    }
}


/**
 * Funcion de actualizacion multiple de contactos
 */
export async function uptadeContactosArrayService(contactos = [], manager = null) {
    try {
        const execute = async (transactionManager) => {
            const contactosActualizados = []
            let i = 1
            for (const contacto of contactos) {
                const [resp, err] = await updateContactoService(contacto.contacto_id, contacto, i, transactionManager)
                if (err) throw [null, err]
                contactosActualizados.push(resp)
                i++
            }

            if (contactosActualizados.length === 0) throw [null, createErrorMessage('Contactos', 'No hay contactos para actualizar')]
            return [contactosActualizados, null]
        }

        if (manager) return await execute(manager)
        return await AppDataSource.transaction(execute)
    } catch (error) {
        if (Array.isArray(error)) {
            console.error("Error al actualizar un contacto", error[1]);
            if (manager) throw error
            return error
        }
        console.error("Error al actualizar contacto:", error);
        if (manager) throw error
        return [null, "Error interno del servidor"]
    }
}
