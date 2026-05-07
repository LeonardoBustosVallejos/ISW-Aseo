import Cliente from "../entity/cliente.entity.js";
import Contacto from "../entity/contacto.entity.js";
import Trabajador from "../entity/trabajador.entity.js";
import { AppDataSource } from "../config/configDb.js";
import { ILike } from "typeorm";
import { createErrorMessage, createSimpleMessage } from "../handlers/messages.js";
import User from "../entity/user.entity.js";
import { asignarSupervisorService, deleteUserService, getUserService } from "./user.service.js";
import { registerService } from "./auth.service.js";
import Sede from "../entity/sede.entity.js";
import { getRolByNameService } from "./rol.service.js";
import { getORTrabajadorService } from "./trabajador.service.js";
/**
 * get...s() lista de todos
 * get...By(params) estricta para un único elemento con findOne AND
 * get...(params) estricta para un único elemento con findOne OR
 * find...sBy(params) flexible para listas con find OR
 * where = {} AND
 * where = [] OR
 */

const errorServer = [null, "Error interno del servidor"]
/**
 * funcion que aplica el uso de ILike() para determinar si un string contiene un substring
 * se utiliza en funciones de busqueda
 * @param dato substring que se quiere saber su existencia 
 * @returns 
 */
const contiene = (dato) => { return ILike(`%${dato}%`) }


//Funciones relacionadas a Contactos
/**
 * 
 * @returns todos los contactos
 */
export async function getContactosService() {
    try {
        const contactoRepository = AppDataSource.getRepository(Contacto);

        const contactos = await contactoRepository.find({
            relations: ["sede", "sede.cliente"],
        });
        if (!contactos || contactos.length === 0) return [null, "No hay contactos"];
        return [contactos, null];

    } catch (error) {
        console.error("Error al obtener contactos:", error);
        return errorServer
    }
}

/**
 * Búsqueda estricta AND, comparaciones exactas
 * @param query datos correspondientes a los campos de un contacto 
 * @returns un único contacto que coincida con TODOS los campos dados
 */
export async function getContactoByService(query) {
    try {

        const { contacto_id, contacto_rut, nombreContacto, email, phone } = query

        const contactoRepository = AppDataSource.getRepository(Contacto);

        const where = {}    //AND

        if (contacto_id) where.contacto_id = contacto_id
        if (contacto_rut) where.contacto_rut = contacto_rut
        if (nombreContacto) where.nombreContacto = nombreContacto
        if (email) where.email = email
        if (phone) where.phone = phone


        const contacto = await contactoRepository.findOne({
            relations: ["sede", "sede.cliente"],
            where
        });
        if (!contacto) return [null, createSimpleMessage("Contacto no encontrado")]

        return contacto

    } catch (error) {
        console.error("Error al obtener contacto:", error);
        return errorServer
    }
}

/**
 * Filtro acumulativo, búsqueda flexible, comparacion con subString
 * @param query datos correspondientes a los campos de un contacto 
 * @returns lista de contactos, no necesita coincidir en todos o ser igual totalmente
 */
export async function findContactosByService(query) {
    try {

        const { contacto_id, contacto_rut, nombreContacto, email, phone } = query

        const contactoRepository = AppDataSource.getRepository(Contacto);

        const where = []    //OR

        if (contacto_id) where.push(contacto_id)
        if (contacto_rut) where.push({ contacto_rut: contiene(contacto_rut) })
        if (nombreContacto) where.push({ nombreContacto: contiene(nombreContacto) })
        if (email) where.push({ email: contiene(email) })
        if (phone) where.push({ phone: contiene(phone) })

        const contactos = await contactoRepository.find({
            relations: ["sede", "sede.cliente"],
            where
        });
        if (!contactos.length) {
            return [null, createErrorMessage("contacto", "No encontrado")];
        }

        return [contactos, null];


    } catch (error) {
        console.error("Error al obtener contacto:", error);
        return errorServer
    }
}

/**
 * Crea un nuevo contacto asociado a una sede y cliente, el contacto no puede tener un email o teléfono que ya esté registrado en trabajadores, usuarios o contactos, ni un rut que ya esté registrado en trabajadores, usuarios o clientes.
 * @param  contacto datos del contacto a registrar
 * @param  sede_id ID de la sede de quien se es contacto
 * @returns contacto creado o mensaje de error si no se pudo crear por validación o error interno
 */
export async function createContactoService(contacto, sede_id) {
    try {
        const contactoRepository = AppDataSource.getRepository(Contacto)

        //verificar que la sede exista
        const [existingSede, err] = await getSedeByService({ sede_id: sede_id })
        if (err) return [null, err]

        //obtener el cliente de la sede
        const [existingCliente, errCliente] = await getClienteByService({ cliente_id: existingSede.cliente.cliente_id })
        if (errCliente) return [null, errCliente]

        const { email, phone, contacto_rut, nombreContacto } = contacto

        //verificar que el email del contacto no esté registrado en contactos, trabajadores o usuarios
        const [registerEmail, errEmail] = await getContactoByService({ email: email })
        const [registerTrabajadorEmail, errEmailTrabajador] = await getORTrabajadorService({ email: email })
        const [registerUserEmail, errEmailUser] = await getUserService({ email: email })
        if (registerEmail || registerTrabajadorEmail || registerUserEmail) return [null, createErrorMessage("email", "Correo electrónico ya en uso")];

        //si el contacto tiene teléfono, verificar que no esté registrado en contactos, trabajadores o usuarios
        if (phone) {
            const [registerPhone, errPhone] = await getContactoByService({ phone: phone })
            const [registerUserPhone, errUserPhone] = await getUserService({ phone: phone })
            if (registerPhone || registerUserPhone) return [null, createErrorMessage("phone", "Teléfono ya asociado a una cuenta")];
        }

        //verificar que el rut no sea un de trabajador, cliente o usuario
        const [clienteRut, errRut] = await getClienteByService({ rutCliente: contacto_rut })
        const [existingUserRut, errUserRut] = await getUserService({ rut: contacto_rut })
        const [existingTranajadorRut, errTrabajadorRut] = await getORTrabajadorService({ rut: contacto_rut })
        if (existingTranajadorRut || clienteRut || existingUserRut) return [null, createErrorMessage("rut", "Rut ya en uso")]

        //preparar datos para crear el contacto
        const nuevoContacto = contactoRepository.create({
            nombreContacto: nombreContacto,
            contacto_rut: contacto_rut,
            email: email,
            phone: phone,
            sede: existingSede,
            cliente: existingCliente
        });
        await contactoRepository.save(nuevoContacto)

        return [nuevoContacto, null]

    } catch (error) {
        console.error("Error al registrar un contacto", error);
        return errorServer
    }
}
export async function deleteContactoService(contacto_id) {
    try {
        const contactoRepository = AppDataSource.getRepository(Contacto)

        const [existingContacto, err1] = await getContactoByService()

        if (err1) return [null, createErrorMessage("contacto_id", "No existe el contacto buscado")]

        //comprobar cuantos contactos tiene el cliente que tiene éste contacto
        const contactosCount = await contactoRepository.count({
            where: { cliente: { cliente_id: existingContacto.cliente.cliente_id } }
        });

        //verificar que el cliente no se quede sin contactos
        if (contactosCount <= 1) return [null, createErrorMessage("contacto", "El cliente debe tener al menos un contacto")];

        const deletedContacto = await contactoRepository.remove(existingContacto)

        return [deletedContacto, null]

    } catch (error) {
        console.error("Error al eliminar un contacto:", error);
        return errorServer
    }
}
export async function updateContactoService(contacto_id, data) {
    try {

        if (data.email === "") return [null, createErrorMessage("email", "Datos inválidos")];
        if (data.contacto_rut === "") return [null, createErrorMessage("contacto_rut", "Datos inválidos")];

        const { email, phone, contacto_rut } = data
        const contactoRepository = AppDataSource.getRepository(Contacto);

        //verificar que exista el contacto
        const [currentContacto, errContacto] = await getContactoByService({ contacto_id: contacto_id })
        if (errContacto) return [null, errContacto]

        //validar rut del contacto
        if (contacto_rut && contacto_rut !== currentContacto.contacto_rut) {
            //si se entrega un rut y es distinto al actual
            const [rutUser, errUser] = await getUserService({ rut: contacto_rut })
            const existingTranajador = await getORTrabajadorService({ rut: contacto_rut })
            if (rutUser || existingTranajador) {
                return [null, createErrorMessage("rut", "Rut ya en uso")];
            }
            //si esta en contactos pero es de otro contacto o es contacto de otro cliente
            const [existingRutContacto, errRutContacto] = await getContactoByService({ contacto_rut: contacto_rut })
            if (existingRutContacto && (existingRutContacto.contacto_id !== contacto_id || existingRutContacto.cliente.cliente_id !== currentContacto.cliente.cliente_id)) {
                return [null, createErrorMessage("rut", "Rut ya en uso")];
            }
        }
        //validar email duplicado
        if (email && email !== currentContacto.email) {
            const [existingEmail, errEmailContacto] = await getContactoByService({ email: email })
            const [existingEmailUser, errEmailUser] = await getUserService({ email: email });
            if ((existingEmail && existingEmail.contacto_id === contacto_id) || existingEmailUser) {
                return [null, createErrorMessage("email", "Correo ya en uso")];
            }
        }

        //validar telefono duplicado
        if (phone && phone !== currentContacto.phone) {
            const [existingPhone, errPhoneContacto] = await getContactoByService({ phone: phone })
            const [phoneUser, errUser] = await getUserService({ phone: phone })
            if ((existingPhone && existingPhone.contacto_id === contacto_id) || phoneUser) {
                return [null, createErrorMessage("phone", "Teléfono ya en uso")];
            }
        }

        //actualizar campos
        await contactoRepository.update({ contacto_id }, { contacto_rut: contacto_rut, email: email, phone: phone, updatedAt: new Date() });

        //obtener contacto actualizado
        const [contactoActualizado, errContactoActualizado] = await getContactoByService({ contacto_id })
        if (errContactoActualizado) return [null, createErrorMessage("contacto", "No se encontró el contacto después de actualizar")]

        return [contactoActualizado, null];

    } catch (error) {
        console.error("Error al actualizar contacto:", error);
        return errorServer
    }
}

//funciones relacionadas a las sedes
export async function getSedesService() {
    try {
        const sedeRepository = AppDataSource.getRepository(Sede);

        const sedes = await sedeRepository.find({
            relations: ["cliente", "contactos"]
        });

        if (!sedes.length) {
            return [null, "No hay sedes"];
        }

        return [sedes, null];

    } catch (error) {
        console.error("Error al obtener sedes:", error);
        return errorServer;
    }
}

/**
 * Busqueda estricta AND, comparaciones exactas enlazada con cliente y contactos
 * @param {} query 
 * @returns 
 */
export async function getSedeByService(query) {
    try {
        const { sede_id, direccion, cliente_id, rutSecundario } = query;

        const sedeRepository = AppDataSource.getRepository(Sede);

        const where = {};

        if (sede_id) where.sede_id = sede_id;
        if (direccion) where.direccion = direccion;
        if (cliente_id) where.cliente = cliente_id;
        if (rutSecundario) where.rutSecundario = rutSecundario;

        if (where.length === 0) return [null, "Debe enviar al menos un criterio de busqueda"]

        const sede = await sedeRepository.findOne({
            relations: ["cliente", "contactos"],
            where
        });

        if (!sede) {
            return [null, "Sede no encontrada"];
        }

        return [sede, null];

    } catch (error) {
        console.error("Error al obtener sede:", error);
        return errorServer;
    }
}

/**
 * Busqueda flexible OR, comparaciones con subString enlazada con cliente y contactos
 * @param {} query 
 * @returns 
 */
export async function findSedesByService(query) {
    try {
        const { sede_id, direccion, cliente_id } = query;

        const sedeRepository = AppDataSource.getRepository(Sede);

        const where = [];

        if (sede_id) where.push({ sede_id });
        if (direccion) where.push({ direccion: contiene(direccion) });
        if (cliente_id) where.push({ cliente: { cliente_id } });

        if (!where.length) {
            return [null, "Debe enviar al menos un criterio"];
        }

        const sedes = await sedeRepository.find({
            relations: ["cliente"],
            where
        });

        if (!sedes.length) {
            return [null, "No se encontraron sedes"];
        }

        return [sedes, null];

    } catch (error) {
        console.error("Error al buscar sedes:", error);
        return errorServer;
    }
}

export async function createSedeService(sede, cliente_id) {
    try {
        const sedeRepository = AppDataSource.getRepository(Sede);

        const { nombre_sede, direccion, personalSolicitado, rutSecundario } = sede

        //verificar que el cliente exista
        const [cliente, err] = await getClienteByService({ cliente_id: cliente_id })
        if (err) return [null, createErrorMessage("cliente", "Cliente no existe")];

        if (rutSecundario) {
            //si el rut ya está registrado a otro cliente
            const [existingRut, errRut] = await getSedeByService({ rutSecundario: rutSecundario })
            if (existingRut && existingRut.cliente.cliente_id !== cliente_id) return [null, createErrorMessage("rutSecundario", "Rut secundario no valido")];
        }

        const [existingUser, errUser] = await getUserService({ rut: rutSecundario })
        const [existingTrabajador, errTrabajador] = await getORTrabajadorService({ rut: rutSecundario })
        let existingContactoRut = null, errContactoRut = null
        if (rutSecundario) {
            [existingContactoRut, errContactoRut] = await getContactoByService({ contacto_rut: rutSecundario })
        }
        if (existingUser || existingTrabajador || existingContactoRut) return [null, createErrorMessage("rutSecundario", "Rut secundario ya en uso")];

        const nuevaSede = sedeRepository.create({
            nombre_sede: nombre_sede,
            direccion: direccion,
            personalSolicitado: personalSolicitado,
            rutSecundario: rutSecundario,
            cliente: cliente_id
        });

        const sedeCreada = await sedeRepository.save(nuevaSede);

        return [sedeCreada, null];

    } catch (error) {
        console.error("Error al crear sede:", error);
        return errorServer;
    }
}

export async function updateSedeService(sede_id, data) {
    try {
        const sedeRepository = AppDataSource.getRepository(Sede);

        const { nombre_sede, direccion, personalSolicitado, rutSecundario } = data

        //verificar que la sede exista
        const [sedeFound, errSede] = await getSedeByService({ sede_id: sede_id })
        if (errSede) return [null, errSede]

        if (rutSecundario && rutSecundario !== sedeFound.rutSecundario) {
            //si el rut ya está registrado una sede de otro cliente
            const [existingRut, errRut] = await getSedeByService({ rutSecundario: rutSecundario })
            if (
                existingRut &&
                existingRut.sede_id !== sede_id &&
                existingRut.cliente.cliente_id !== sedeFound.cliente.cliente_id
            ) return [null, createErrorMessage("rutSecundario", "Rut secundario no válido")];
        }

        const [existingUser, errUser] = await getUserService({ rut: rutSecundario })
        const [existingTrabajador, errTrabajador] = await getORTrabajadorService({ rut: rutSecundario })
        let existingContactoRut = null, errContactoRut = null
        if (rutSecundario) {
            [existingContactoRut, errContactoRut] = await getContactoByService({ contacto_rut: rutSecundario })
        }
        if (existingUser || existingTrabajador || existingContactoRut) return [null, createErrorMessage("rutSecundario", "Rut secundario ya en uso")];



        //actualizar la sede
        await sedeRepository.update({ sede_id },
            {
                nombre_sede: nombre_sede,
                direccion: direccion,
                personalSolicitado: personalSolicitado,
                rutSecundario: rutSecundario,
                updatedAt: new Date(),
            });

        // Obtener la sede actualizada
        const [updatedSede, errUpdated] = await getSedeByService({ sede_id: sede_id });
        if (errUpdated) return [null, "Sede no encontrada después de actualizar"];

        return [updatedSede, null];

    } catch (error) {
        console.error("Error al actualizar sede:", error);
        return errorServer;
    }
}

export async function deleteSedeService(sede_id) {
    try {
        const sedeRepository = AppDataSource.getRepository(Sede);

        const sede = await sedeRepository.findOne({
            where: { sede_id },
            relations: ["contactos"]
        });

        if (!sede) {
            return [null, "Sede no encontrada"];
        }

        if (sede.contactos && sede.contactos.length > 0) {
            return [null, "No se puede eliminar una sede con contactos"];
        }

        await sedeRepository.remove(sede);

        return [sede, null];

    } catch (error) {
        console.error("Error al eliminar sede:", error);
        return errorServer;
    }
}
//funciones relacionadas a los clientes

/**
 * 
 * @returns todos los clientes o mensage de error
 */
export async function getClientesService() {
    try {
        const clienteRepository = AppDataSource.getRepository(Cliente)

        const clientes = await clienteRepository.find({ relations: ["sede"] })

        if (!clientes || clientes.length === 0) return [null, "No hay clientes"];

        return [clientes, null]
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        return errorServer
    }
}


/**
 * Búsqueda estricta AND, comparaciones exactas
 * @param query datos correspondientes a los campos de un contacto, excluye conexiones
 * @returns un único cliente que coincida con TODOS los campos dados
 */
export async function getClienteByService(query) {
    try {
        const clienteRepository = AppDataSource.getRepository(Cliente)
        const { cliente_id, nombreCliente, rutCliente, tipoCliente } = query

        const where = {}    //AND
        if (cliente_id) where.cliente_id = cliente_id
        if (nombreCliente) where.nombreCliente = nombreCliente
        if (rutCliente) where.rutCliente = rutCliente
        if (tipoCliente) where.tipoCliente = tipoCliente

        const cliente = await clienteRepository.findOne({ relations: ["sede"], where })

        if (!cliente) return [null, createSimpleMessage("Cliente no encontrado")]

        return [cliente, null]

    } catch (error) {
        console.error("Error al obtener el cliente:", error);
        return errorServer
    }
}
/**
 * Filtro acumulativo, búsqueda flexible, comparacion con subString
 * @param query datos correspondientes a los campos de un contacto 
 * @returns lista de contactos, no necesita coincidir en todos o ser igual totalmente
 */
export async function findClienteByService(query) {
    try {
        const clienteRepository = AppDataSource.getRepository(Cliente)
        const { nombreCliente, rutCliente, sede } = query

        const where = {}    //AND

        if (nombreCliente) where.nombreCliente = contiene(nombreCliente)
        if (rutCliente) where.rutCliente = contiene(rutCliente)

        if (sede) {
            if (sede.direccion) where.sede.direccion = contiene(direccion)
            if (sede.personalAsignado) where.sede.personalAsignado = contiene(personalAsignado)
            if (sede.personalSolicitado) where.sede.personalSolicitado = contiene(personalSolicitado)
        }

        const cliente = await clienteRepository.find({ relations: ["sede"], where })

        if (!cliente.length) return [null, createSimpleMessage("Cliente no encontrado")]


        return [cliente, null]

    } catch (error) {
        console.error("Error al obtener el cliente:", error);
        return errorServer
    }
}

export async function deleteCliente(query) {
    try {
        const { cliente_id } = query
        const [clienteFound, err] = await getClienteByService({ cliente_id: cliente_id })

        if (err) return err

        const clienteRepository = AppDataSource.getRepository(Cliente)

        const clienteDeleted = await clienteRepository.remove(clienteFound)

        return [clienteDeleted, null]

    } catch (error) {
        console.error("Error al eliminar un cliente:", error);
        return errorServer;
    }
}

export async function updateClienteService(cliente_id, data) {
    try {
        const { nombreCliente, rutCliente, tipoCliente } = data

        if (nombreCliente === "") return [null, createErrorMessage("nombreCliente", "Datos inválidos")];
        if (rutCliente === "") return [null, createErrorMessage("rutCliente", "Datos inválidos")];
        if (tipoCliente === "") return [null, createErrorMessage("tipoCliente", "Datos inválidos")];

        const clienteRepository = AppDataSource.getRepository(Cliente);

        const cliente = await clienteRepository.findOne({
            where: { cliente_id }
        });

        if (!cliente) {
            return [null, createErrorMessage("cliente", "No encontrado")];
        }
        //si se entrega un rut, es distinto al actual y está en uso
        if (rutCliente && rutCliente !== cliente.rutCliente) {
            const existente = await clienteRepository.findOne({
                where: { rutCliente: rutCliente }
            });

            if (existente) {
                return [null, createErrorMessage("rut", "Rut ya en uso")];
            }
        }

        await clienteRepository.update({ cliente_id }, { nombreCliente: nombreCliente, rutCliente: rutCliente, tipoCliente: tipoCliente, updatedAt: new Date() });
        const [updatedCliente, errUpdate] = await getClienteByService({ cliente_id })
        if (errUpdate) return [null, "Cliente no encontrado después de actualizar: " + errUpdate]

        return [updatedCliente, null];

    } catch (error) {
        console.error("Error al actualizar cliente:", error);
        return errorServer;
    }
}

/**
 * Funcion para registrar un cliente padre y su filial asociada
 * @param {*} padre datos basicos del cliente padre a registrar, debe contener al menos nombreCliente y rutCliente
 * @param {*} filial datos de la filial, incluye cliente, sede, contacto
 * @param {*} trabajador_id ID de trabajador a asignar como supervisor del cliente, este campo es opcional, si no se entrega el cliente se registrará sin supervisor asignado
 * @returns 
 */
export async function registerClientePadre(padre, filial, trabajador_id = null) {
    try {

        if (trabajador_id) {
            const [trabajador, errTrabajador] = await getORTrabajadorService({ id: trabajador_id });
            if (errTrabajador) return [null, errTrabajador]
            if (trabajador.rol !== "Trabajador") return [null, createErrorMessage("trabajador_id", "El trabajador entregado no califica para ser supervisor")]
        }

        const { nombreCliente, rutCliente } = padre
        const [clienteCreado, errCliente] = await createCliente(padre)
        if (errCliente) return [null, errCliente]
        console.log("=> Cliente padre registrado");

        const [filialCreada, errFilial] = await registerClienteSimpleService(filial, clienteCreado.cliente_id, trabajador_id ? trabajador_id : null)
        if (errFilial) {
            const clienteRepository = AppDataSource.getRepository(Cliente);
            console.error("=> Error de registro, borrando cliente padre");
            await clienteRepository.remove(clienteCreado)
            return [null, errFilial]
        }

        return [{
            ClientePadre: clienteCreado,
            Filial: filialCreada
        }, null]
    } catch (error) {
        console.error("Error al registrar un cliente padre", error);
        return errorServer;
    }
}

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
        //verificar que el trabajador exista antes de intentar registrar el cliente, para evitar registros incompletos

        const clienteRepository = AppDataSource.getRepository(Cliente);

        const { cliente, filial, sede, contacto } = data;

        if (!cliente || !sede || !contacto) return [null, createErrorMessage("cliente/sede/contacto", "Datos incompletos")]

        let trabajador = null, errTrabajador = null
        if (trabajador_id) {
            [trabajador, errTrabajador] = await getORTrabajadorService({ id: trabajador_id });
            if (errTrabajador) return [null, errTrabajador]
            if (trabajador.rol !== "trabajador") return [null, createErrorMessage("trabajador_id", "El trabajador entregado no califica para ser supervisor")]
        }
        //el cliente, posible filial, posible trabajador y contacto a registrar no pueden tener el mismo rut
        if ((filial && filial.rutCliente === cliente.rutCliente) ||                                                 //verificacion de filial para cliente
            (trabajador && (cliente.rutCliente === trabajador.rut || trabajador.rut === contacto.contacto_rut)) ||  //verificacion con trabajador para supervisor
            cliente.rutCliente === contacto.contacto_rut)                                                           //verificacion de contacto para cliente
            return [null, createErrorMessage("rut", "Rut duplicado")]


        //verificar el rut con las sedes, que no esté registrado en una sede de otro cliente
        const [existingSedeRut, errSedeRut] = await getSedeByService({ rutSecundario: cliente.rutCliente })
        if (existingSedeRut) return [null, createErrorMessage("rut", "Rut ya en uso")]

        if (filial && Object.keys(filial).length > 0) {
            const [existingSedeRutFilial, errSedeRutFilial] = await getSedeByService({ rutSecundario: filial.rutCliente })

            if (existingSedeRutFilial) return [null, createErrorMessage("rut", "Rut ya en uso")]
        }


        //registrar en la tabla cliente
        const [clienteCreado, errClienteCreado] = await createCliente(cliente)
        if (errClienteCreado) return [null, errClienteCreado]
        console.log("=> Cliente registrado");

        let filialCreada = null, errFilial = null
        if (filial && Object.keys(filial).length > 0) {
            //si se entrega una filial, se registra como cliente con clientePadre_id del cliente recién creado
            [filialCreada, errFilial] = await createCliente(filial, clienteCreado.cliente_id)
            if (errFilial) {
                console.error("=> Error de registro, borrando cliente");
                await clienteRepository.remove(clienteCreado)
                return [null, errFilial]
            }
        }
        //registrar la sede del cliente
        const [sedeCreada, errSede] = await createSedeService(sede, filialCreada ? filialCreada.cliente_id : clienteCreado.cliente_id);
        if (errSede) {
            //await deleteUserService({ id: perfilCreado.id })
            console.error("=> Error de registro, borrando cliente");
            await clienteRepository.remove(clienteCreado)
            return [null, errSede]
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
            await clienteRepository.remove(clienteCreado)
            return [null, errPerfil]
        }
        */

        //registrar el contacto
        const [contactoCreado, errContacto] = await createContactoService(contacto, sedeCreada.sede_id)
        if (errContacto) {
            //await deleteUserService({ id: perfilCreado.id })
            console.error("=> Error de registro, borrando cliente");
            await clienteRepository.remove(clienteCreado)
            return [null, errContacto]
        }
        console.log("\t=> Contacto registrado");

        //registrar un nuevo usuario como supervisor del nuevo cliente
        let usuarioSupervisor = null, errSupervisor = null
        if (trabajador_id) {
            [usuarioSupervisor, errSupervisor] = await asignarSupervisorService({ id: trabajador_id }, sedeCreada.sede_id)
            if (errSupervisor) {
                //await deleteUserService({ id: perfilCreado.id })
                console.error("=> Error de registro, borrando cliente");
                await clienteRepository.remove(clienteCreado)
                return [null, errSupervisor];
            }
            console.log("\t=> Supervisor registrado");
        }
        if (!trabajador_id) {
            console.log("\t=> No se asignó supervisor");
        }
        /**
         * Ante cualquier error se eliminará en cascada los datos ingresados, 
         * para evitar espacio ocupado innecesariamente
         */

        return [{
            Cliente: clienteCreado,
            Filial: filialCreada,
            Sede: sedeCreada,
            Contacto: contactoCreado,
            usuarioSupervisor,
        }, null]


    } catch (error) {
        console.error("Error al registrar un cliente", error);
        return errorServer;
    }
}

/**
 * Crea un cliente sin sede ni contacto, se utiliza para validar y crear clientes
 * @param {*} cliente datos del cliente a crear
 * @param {*} clientePadre_id ID del cliente padre, si se entrega el cliente a crear es filial, sino el ID es nulo
 * @returns 
 */
async function createCliente(cliente, clientePadre_id = null) {
    try {
        const { nombreCliente, rutCliente } = cliente

        if (!nombreCliente || !rutCliente) return [null, createErrorMessage("cliente", "Datos incompletos")]

        if (clientePadre_id) {
            const [clientePadreVerif, errClientePadreVerif] = await getClienteByService({ cliente_id: clientePadre_id })
            if (errClientePadreVerif) return [null, errClientePadreVerif]
            if (clientePadreVerif.tipoCliente !== "EMPRESA") return [null, createErrorMessage("padre_id", "El cliente entregado no califica para ser cliente padre")]
        }

        const clienteRepository = AppDataSource.getRepository(Cliente);
        const [existingClient, errCliente] = await getClienteByService({ rutCliente: rutCliente });
        const [existingRutUser, errRutUser] = await getUserService({ rut: rutCliente });
        const [existingRutContacto, errRutContacto] = await getContactoByService({ contacto_rut: rutCliente })
        if (existingClient || existingRutUser || existingRutContacto) return [null, createErrorMessage("rut", "Rut en uso")];

        //preparar los datos para crear el nuevo cliente
        const nuevoCliente = clienteRepository.create({
            nombreCliente: nombreCliente,
            rutCliente: rutCliente,
            tipoCliente: clientePadre_id ? "FILIAL" : "EMPRESA",
            clientePadre: clientePadre_id //nulo si el cliente padre no fue entregado
        });

        const clienteCreado = await clienteRepository.save(nuevoCliente);

        return [clienteCreado, null];

    } catch (error) {
        console.error("Error al registrar un cliente", error);
        return errorServer;
    }
}