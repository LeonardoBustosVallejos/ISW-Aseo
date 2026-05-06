import Cliente from "../entity/cliente.entity.js";
import Contacto from "../entity/contacto.entity.js";
import Trabajador from "../entity/trabajador.entity.js";
import { AppDataSource } from "../config/configDb.js";
import { ILike } from "typeorm";
import { createErrorMessage, createSimpleMessage } from "../handlers/messages.js";
import User from "../entity/user.entity.js";
import { deleteUserService, getUserService } from "./user.service.js";
import { registerService } from "./auth.service.js";
import Sede from "../entity/sede.entity.js";
import { getRolByNameService } from "./rol.service.js";
/**
 * get...() lista de todos
 * get...By(params) para un único elemento con findOne AND
 * find...By(params) para listas con find OR
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
 * Búsqueda estricta, comparaciones exactas
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

export async function createContactoService(contacto, sede_id) {
    try {
        const contactoRepository = AppDataSource.getRepository(Contacto)
        const userRepository = AppDataSource.getRepository(User)
        const trabajadoresRepository = AppDataSource.getRepository(Trabajador)

        //verificar que la sede exista
        const [existingSede, err] = await getSedeByService({ sede_id: sede_id })
        if (err) return [null, err]

        const { email, phone, contacto_rut, nombreContacto } = contacto

        //verificar que los datos no hayan sido registrados antes en contactos
        const [registerEmail, errEmail] = await getContactoByService({ email: email })
        if (registerEmail) {
            console.log(registerEmail);

            return [null, createErrorMessage("email", "Correo electrónico ya en uso")];
        }
        if (phone) {
            const [registerPhone, errPhone] = await getContactoByService({ phone: phone })
            if (registerPhone) return [null, createErrorMessage("phone", "Teléfono ya asociado a una cuenta")];
        }

        const [clienteRut, errCliente] = await getClienteByService({ rutCliente: contacto_rut })
        if (clienteRut) return [null, createErrorMessage("rut", "Rut ya en uso")];

        //verificar que el contacto no sea un trabajador o usuario
        //pero si el rut es del usuario ligado a al cliente entonces los datos serán extra los correspondiente
        const [existingUserRut, errUserRut] = await getUserService({ rut: contacto_rut })
        let newUserContacto = null;


        if (existingUserRut) {
            const contactoUser = await getUserService({ nombreCompleto: nombreContacto })
            if (contactoUser && contactoUser.cliente && contactoUser.id === existingUserRut.id && existingSede.cliente.cliente_id === contactoUser.cliente.cliente_id) {


                const [existingEmailContacto, errEmail] = getContactoByService({ email: contactoUser.email })

                if (contactoUser.phone) {
                    const [existingPhoneUser, errPhone] = getContactoByService({ phone: contactoUser.phone })

                    if (errPhone) {
                        if (existingEmailContacto) {
                            newUserContacto = await updateContactoService(existingEmailContacto.contacto_id, { phone: contactoUser.phone })
                        } else {
                            newUserContacto = await contactoRepository.save(
                                contactoRepository.create({
                                    nombreContacto: nombreContacto,
                                    contacto_rut: contacto_rut,
                                    email: contactoUser.email,
                                    phone: phone,
                                    sede: existingSede
                                })
                            )
                        }
                    } else if (errEmail) {
                        newUserContacto = await contactoRepository.save(
                            contactoRepository.create({
                                nombreContacto: nombreContacto,
                                contacto_rut: contacto_rut,
                                email: contactoUser.email,
                                sede: existingSede
                            })
                        )
                    }
                } else if (errEmail) {
                    newUserContacto = await contactoRepository.save(
                        contactoRepository.create({
                            nombreContacto: nombreContacto,
                            contacto_rut: contacto_rut,
                            email: contactoUser.email,
                            sede: existingSede
                        })
                    )
                }
            }
        }
        const existingTranajador = await trabajadoresRepository.findOne({ where: [{ email: email }] })
        if (existingTranajador) return [null, createErrorMessage("contacto", "Los datos de contacto corresponden a un trabajador")]


        const nuevoContacto = contactoRepository.create({
            nombreContacto: nombreContacto,
            contacto_rut: contacto_rut,
            email: email,
            phone: phone,
            sede: existingSede
        });
        const contactoCreado = await contactoRepository.save(nuevoContacto)
        if (newUserContacto) return [{ contactoCreado, newUserContacto }]
        return [contactoCreado, null]

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

        if (data.phone === "") return [null, createErrorMessage("phone", "Datos inválidos")];

        const contactoRepository = AppDataSource.getRepository(Contacto);
        const trabajadoresRepository = AppDataSource.getRepository(Trabajador)

        //verificar que exista el contacto
        const [currentContacto, errContacto] = await getContactoByService({ contacto_id: contacto_id })

        if (errContacto) return [null, errContacto]

        //validar rut del contacto

        if (data.contacto_rut && data.contacto_rut !== currentContacto.contacto_rut) {

            //si se entrega un rut, es distinto al actual y está en uso
            const [rutUser, errUser] = await getUserService({ rut: data.contacto_rut })
            const existingTranajador = await trabajadoresRepository.findOne({ where: { rut: data.contacto_rut } })
            if (rutUser || existingTranajador) {
                return [null, createErrorMessage("rut", "Rut ya en uso")];
            }

            const [existingRutContacto, errRutContacto] = await getContactoByService({ contacto_rut: data.contacto_rut })
            if (existingRutContacto && existingRutContacto.contacto_id !== contacto_id) {
                return [null, createErrorMessage("rut", "Rut ya en uso")];
            }
        }
        //validar email duplicado
        if (data.email && data.email !== currentContacto.email) {
            const [existingEmail, errEmailContacto] = await getContactoByService({ email: data.email })
            const [existingEmailUser, errEmailUser] = await getUserService({ email: data.email });

            if (existingEmail || existingEmailUser) {
                return [null, createErrorMessage("email", "Correo ya en uso")];
            }
        }

        //validar telefono duplicado
        if (data.phone && data.phone !== currentContacto.phone) {
            const [existingPhone, errPhoneContacto] = await getContactoByService({ phone: data.phone })
            const [phoneUser, errUser] = await getUserService({ phone: data.phone })
            if (phoneExist || phoneExist) {
                return [null, createErrorMessage("phone", "Teléfono ya en uso")];
            }
        }

        //actualizar campos
        const updatedContacto = contactoRepository.merge(existingContacto, data);

        await contactoRepository.save(updatedContacto);

        return [updatedContacto, null];

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

export async function getSedeByService(query) {
    try {
        const { sede_id, direccion, cliente_id } = query;

        const sedeRepository = AppDataSource.getRepository("Sede");

        const where = {};

        if (sede_id) where.sede_id = sede_id;
        if (direccion) where.direccion = direccion;
        if (cliente_id) where.cliente = { cliente_id };


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

        const { direccion, personalSolicitado } = sede

        const [cliente, err] = await getClienteByService({ cliente_id: cliente_id })

        if (err) return [null, createErrorMessage("cliente", "Cliente no existe")];

        const nuevaSede = sedeRepository.create({
            direccion: direccion,
            personalSolicitado: personalSolicitado,
            cliente: cliente_id
        });

        const sedeCreada = await sedeRepository.save(nuevaSede);

        return [sedeCreada, null];

    } catch (error) {
        console.error("Error al crear sede:", error);
        return errorServer;
    }
}

export async function updateSedeService(sede_id, sede) {
    try {
        const sedeRepository = AppDataSource.getRepository(Sede);

        const sede = await sedeRepository.findOne({
            where: { sede_id }
        });

        if (!sede) {
            return [null, "Sede no encontrada"];
        }

        const updatedSede = sedeRepository.merge(sede, sede);

        await sedeRepository.save(updatedSede);

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
 * Búsqueda estricta, comparaciones exactas
 * @param query datos correspondientes a los campos de un contacto, excluye conexiones
 * @returns un único cliente que coincida con TODOS los campos dados
 */
export async function getClienteByService(query) {
    try {
        const clienteRepository = AppDataSource.getRepository(Cliente)
        const { cliente_id, nombreCliente, rutCliente, direccion, personalSolicitado, personalAsignado } = query

        const where = {}    //AND
        if (cliente_id) where.cliente_id = cliente_id
        if (direccion) where.direccion = direccion
        if (nombreCliente) where.nombreCliente = nombreCliente
        if (personalAsignado) where.personalAsignado = personalAsignado
        if (personalSolicitado) where.personalSolicitado = personalSolicitado
        if (rutCliente) where.rutCliente = rutCliente

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
        const clienteRepository = AppDataSource.getRepository(Cliente);

        const cliente = await clienteRepository.findOne({
            where: { cliente_id }
        });

        if (!cliente) {
            return [null, createErrorMessage("cliente", "No encontrado")];
        }

        if (data.rutCliente && data.rutCliente !== cliente.rutCliente) {
            const existente = await clienteRepository.findOne({
                where: { rutCliente: data.rutCliente }
            });

            if (existente) {
                return [null, createErrorMessage("rut", "Rut ya en uso")];
            }
        }

        const updatedCliente = clienteRepository.merge(cliente, data);

        await clienteRepository.save(updatedCliente);

        return [updatedCliente, null];

    } catch (error) {
        console.error("Error al actualizar cliente:", error);
        return errorServer;
    }
}

export async function registerClientService(cliente, supervisor) {
    try {
        const clienteRepository = AppDataSource.getRepository(Cliente);

        const { nombreCliente, rutCliente, nombreCompleto, rut, email, password, sede, contacto } = cliente;

        //el cliente y supervisor no pueden tener el mismo rut
        if (cliente.rutCliente === supervisor.rut) return [null, createErrorMessage("rut", "Rut duplicado")]

        //comprobacion de campos únicos
        const [existingClient, errCliente] = await getClienteByService({ rutCliente: rutCliente });
        const [existingRutUser, errRutUser] = await getUserService({ rut: rutCliente });
        const [existingRutContacto, errRutContacto] = await getContactoByService({ contacto_rut: rutCliente })

        if (existingClient || existingRutUser || existingRutContacto) return [null, createErrorMessage("rut", "Rut en uso")];

        if (supervisor.phone) {
            const [existingPhoneUser, errPhone] = await getUserService({ phone: supervisor.phone })     //si un usuario ya lo tiene
            const [phoneExistContacto, errPhoneContacto] = await getContactoByService({ phone: supervisor.phone })
            if (existingPhoneUser || phoneExistContacto) return [null, createErrorMessage("phone", "Teléfono ya asociado a una cuenta")];
        }


        const nuevoCliente = clienteRepository.create({
            nombreCliente: nombreCliente,
            rutCliente: rutCliente,
        });

        //registrar en la tabla cliente
        const clienteCreado = await clienteRepository.save(nuevoCliente)
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


        const [sedeCreada, errSede] = await createSedeService(sede, clienteCreado.cliente_id);
        if (errSede) {
            await deleteUserService({ id: perfilCreado.id })
            await clienteRepository.remove(clienteCreado)
            return [null, errSede]
        }


        //registrar el contacto
        const [contactoCreado, errContacto] = await createContactoService(contacto, clienteCreado.cliente_id)
        if (errContacto) {
            await deleteUserService({ id: perfilCreado.id })
            await clienteRepository.remove(clienteCreado)
            return [null, errContacto]
        }

        const dataSupervisor = {
            nombreCompleto: supervisor.nombreCompleto,
            rut: supervisor.rut,
            email: supervisor.email,
            password: supervisor.password,
            phone: supervisor.phone,
            rol_id: await getRolByNameService("Supervisor"),
        }

        //registrar un nuevo usuario como supervisor del nuevo cliente
        const [usuarioSupervisor, errSupervisor] = await registerService(supervisor, nuevoCliente.cliente_id)
        if (errSupervisor) {
            await deleteUserService({ id: perfilCreado.id })
            await clienteRepository.remove(clienteCreado)
            return [null, errSupervisor];
        }
        /**
         * Ante cualquier error se eliminará en cascada los datos ingresados, 
         * para evitar espacio ocupado innecesariamente
         */

        return [{
            Cliente: clienteCreado,
            Contacto: contactoCreado,
            usuarioSupervisor,
        }, null]


    } catch (error) {
        console.error("Error al registrar un cliente", error);
        return errorServer;
    }
}
