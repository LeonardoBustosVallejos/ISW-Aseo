import Cliente from "../entity/cliente.entity.js";
import Contacto from "../entity/contacto.entity.js";
import Trabajador from "../entity/trabajador.entity.js";
import { AppDataSource } from "../config/configDb.js";
import { ILike } from "typeorm";
import { cleanRut, createErrorMessage, createSimpleMessage } from "../cleaners/extras.js";
import User from "../entity/user.entity.js";
import { asignarPersonalService, asignarSupervisorJerarquicoService, asignarSupervisorService, getUserService } from "./user.service.js";
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
 * @param query datos correspondientes a los campos de un contacto 
 * @returns un único contacto que coincida con TODOS los campos dados
 */
export async function getContactoByService(query, manager = null) {
    try {

        const { contacto_id, contacto_rut, nombreContacto, email, phone } = query

        const contactoRepository = manager ?
            manager.getRepository(Contacto) : AppDataSource.getRepository(Contacto);

        const where = {}    //AND

        if (contacto_id) where.contacto_id = contacto_id
        if (contacto_rut) where.contacto_rut = cleanRut(contacto_rut)
        if (nombreContacto) where.nombreContacto = nombreContacto
        if (email) where.email = email
        if (phone) where.phone = phone


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
 * Filtro acumulativo, búsqueda flexible, comparacion con subString
 * @param query datos correspondientes a los campos de un contacto 
 * @returns lista de contactos, no necesita coincidir en todos o ser igual totalmente
 */
export async function findContactosByService(query, manager = null) {
    try {

        const { contacto_id, contacto_rut, nombreContacto, email, phone } = query

        const contactoRepository = manager ?
            manager.getRepository(Contacto) : AppDataSource.getRepository(Contacto);

        const where = []    //OR

        if (contacto_id) where.push({ contacto_id })
        if (contacto_rut) where.push({ contacto_rut: contiene(cleanRut(contacto_rut)) })
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
 * Crea un nuevo contacto asociado a una sede y cliente, el contacto no puede tener un email o teléfono que ya esté registrado en trabajadores, usuarios o contactos, ni un rut que ya esté registrado en trabajadores, usuarios o clientes.
 * @param  contacto datos del contacto a registrar
 * @param  sede_id ID de la sede de quien se es contacto
 * @returns contacto creado o mensaje de error si no se pudo crear por validación o error interno
 */
export async function createContactoService(contacto, sede_id, manager = null) {
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

        const { email, phone, contacto_rut, nombreContacto } = contacto

        //verificar que el email del contacto no esté registrado en contactos, trabajadores o usuarios
        const [registerEmail, errEmail] = await getContactoByService({ email: email }, manager)
        const [registerTrabajadorEmail, errEmailTrabajador] = await getORTrabajadorService({ email: email }, manager)
        const [registerUserEmail, errEmailUser] = await getUserService({ email: email }, manager)
        if (registerEmail || registerTrabajadorEmail || registerUserEmail) {
            if (manager) throw [null, createErrorMessage("email", "Correo electrónico ya en uso")]
            return [null, createErrorMessage("email", "Correo electrónico ya en uso")];
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
        const [clienteRut, errClienteRut] = await getClienteByService({ rutCliente: cleanRut(contacto_rut) }, manager)
        const [existingUserRut, errUserRut] = await getUserService({ rut: cleanRut(contacto_rut) }, manager)
        const [existingTranajadorRut, errTrabajadorRut] = await getORTrabajadorService({ rut: cleanRut(contacto_rut) }, manager)
        if (existingTranajadorRut || clienteRut || existingUserRut) {
            if (manager) throw [null, createErrorMessage("rut", "Rut ya en uso")]
            return [null, createErrorMessage("rut", "Rut ya en uso")]
        }
        //verificar que si el rut ya está en contactos, entonces que la sede tambien sea la misma
        const [existingRut, errRut] = await getContactoByService({ contacto_rut: cleanRut(contacto_rut) })
        if (existingRut && existingRut.sede.sede_id !== sede_id) {
            if (manager) throw [null, createErrorMessage("sede", "Rut ya asignado a otra sede")]
            return [null, createErrorMessage("sede", "Rut ya asignado a otra sede")]
        }
        //preparar datos para crear el contacto
        const nuevoContacto = contactoRepository.create({
            nombreContacto: nombreContacto,
            contacto_rut: cleanRut(contacto_rut),
            email: email,
            phone: phone,
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

        //comprobar cuantos contactos tiene el cliente que tiene éste contacto
        const contactosCount = await contactoRepository.count({
            where: { cliente: { cliente_id: existingContacto.cliente.cliente_id } }
        });

        //verificar que el cliente no se quede sin contactos
        if (contactosCount <= 1) {
            if (manager) throw [null, createErrorMessage("contacto", "El cliente debe tener al menos un contacto")];
            return [null, createErrorMessage("contacto", "El cliente debe tener al menos un contacto")];
        }
        const deletedContacto = await contactoRepository.remove(existingContacto)

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
export async function updateContactoService(contacto_id, data, manager = null) {
    try {

        if (data.email === "") {
            if (manager) throw [null, createErrorMessage("email", "Datos inválidos")];
            return [null, createErrorMessage("email", "Datos inválidos")];
        }
        if (data.contacto_rut === "") {
            if (manager) throw [null, createErrorMessage("contacto_rut", "Datos inválidos")];
            return [null, createErrorMessage("contacto_rut", "Datos inválidos")];
        }

        const { email, phone } = data
        const contactoRepository = manager ?
            manager.getRepository(Contacto) : AppDataSource.getRepository(Contacto);

        //verificar que exista el contacto
        const [currentContacto, errContacto] = await getContactoByService({ contacto_id: contacto_id }, manager)
        if (errContacto) {
            if (manager) throw [null, errContacto]
            return [null, errContacto]
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
            if ((existingEmail && existingEmail.contacto_id !== contacto_id) || existingEmailUser) {
                if (manager) throw [null, createErrorMessage("email", "Correo ya en uso")];
                return [null, createErrorMessage("email", "Correo ya en uso")];
            }
        }

        //validar telefono duplicado
        if (phone && phone !== currentContacto.phone) {
            const [existingPhone, errPhoneContacto] = await getContactoByService({ phone: phone }, manager)
            const [phoneUser, errUser] = await getUserService({ phone: phone }, manager)
            if ((existingPhone && existingPhone.contacto_rut !== currentContacto.contacto_rut) ||
                (phoneUser && phoneUser.rut !== currentContacto.contacto_rut)) {
                if (manager) throw [null, createErrorMessage("phone", "Teléfono ya en uso")];
                return [null, createErrorMessage("phone", "Teléfono ya en uso")];
            }
        }

        //actualizar campos
        await contactoRepository.update({ contacto_id }, { email: email, phone: phone, updatedAt: new Date() });

        //obtener contacto actualizado
        const [contactoActualizado, errContactoActualizado] = await getContactoByService({ contacto_id }, manager)
        if (errContactoActualizado) {
            if (manager) throw [null, createErrorMessage("contacto", "No se encontró el contacto después de actualizar")]
            return [null, createErrorMessage("contacto", "No se encontró el contacto después de actualizar")]
        }
        return [contactoActualizado, null];

    } catch (error) {
        if (Array.isArray(error)) {
            if (manager) throw error
            console.error("Error al actualizar un contacto", error[1]);
            return error
        }
        console.error("Error al actualizar contacto:", error);
        if (manager) throw error
        return [null, "Error interno del servidor"]
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

/**
 * Busqueda estricta AND, comparaciones exactas enlazada con cliente y contactos
 * @param {} query 
 * @returns 
 */
export async function getSedeByService(query, manager = null) {
    try {
        const { sede_id, direccion, cliente_id, rutSecundario } = query;

        const sedeRepository = manager ?
            manager.getRepository(Sede) : AppDataSource.getRepository(Sede);

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

/**
 * Busqueda flexible OR, comparaciones con subString enlazada con cliente y contactos
 * @param {} query 
 * @returns 
 */
export async function findSedesByService(query, manager = null) {
    try {
        const { sede_id, direccion, cliente_id, rutSecundario } = query;

        const sedeRepository = manager ?
            manager.getRepository(Sede) : AppDataSource.getRepository(Sede);

        const where = [];

        if (sede_id) where.push({ sede_id });
        if (direccion) where.push({ direccion: contiene(direccion) });
        if (cliente_id) where.push({ cliente: { cliente_id } });
        if (rutSecundario) where.push({ rutSecundario: cleanRut(rutSecundario) })

        if (!where.length) {
            if (manager) throw [null, "Debe enviar al menos un criterio"];
            return [null, "Debe enviar al menos un criterio"];
        }

        const sedes = await sedeRepository.find({
            relations: ["cliente"],
            where
        });

        if (!sedes.length) {
            if (manager) throw [null, "No se encontraron sedes"];
            return [null, "No se encontraron sedes"];
        }

        return [sedes, null];

    } catch (error) {
        if (Array.isArray(error)) {
            if (manager) throw error
            console.error("Error al buscar sedes", error[1]);
            return error
        }
        console.error("Error al buscar sedes:", error);
        if (manager) throw error
        return [null, "Error interno del servidor"]
    }
}

async function createSede(sede, cliente_id, manager) {
    try {
        const sedeRepository = manager.getRepository(Sede)

        const { nombre_sede, direccion, personalSolicitado, rutSecundario } = sede

        //verificar que el cliente exista
        const [cliente, err] = await getClienteByService({ cliente_id: cliente_id }, manager)
        if (err) {
            if (manager) throw [null, createErrorMessage("cliente", "Cliente no existe")];
            return [null, createErrorMessage("cliente", "Cliente no existe")];
        }
        if (cleanRut(rutSecundario)) {
            //si el rut ya está registrado a otro cliente
            const [existingRut, errRut] = await getSedeByService({ rutSecundario: cleanRut(rutSecundario) }, manager)
            if (existingRut && existingRut.cliente.cliente_id !== cliente_id) {
                if (manager) throw [null, createErrorMessage("rutSecundario", "Rut secundario no valido")];
                return [null, createErrorMessage("rutSecundario", "Rut secundario no valido")];
            }
        }

        //verificar exclusividad del rut con personas
        const [existingUser, errUser] = await getUserService({ rut: cleanRut(rutSecundario) }, manager)
        const [existingTrabajador, errTrabajador] = await getORTrabajadorService({ rut: cleanRut(rutSecundario) }, manager)
        let existingContactoRut = null, errContactoRut = null
        if (cleanRut(rutSecundario)) {
            [existingContactoRut, errContactoRut] = await getContactoByService({ contacto_rut: cleanRut(rutSecundario) }, manager)
        }
        if (existingUser || existingTrabajador || existingContactoRut) {
            if (manager) throw [null, createErrorMessage("rutSecundario", "Rut secundario ya en uso")];
            return [null, createErrorMessage("rutSecundario", "Rut secundario ya en uso")];
        }
        const nuevaSede = sedeRepository.create({
            nombre_sede: nombre_sede,
            direccion: direccion,
            personalSolicitado: personalSolicitado,
            rutSecundario: cleanRut(rutSecundario) || null,
            cliente: cliente_id
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
        const sedeRepository = manager ?
            manager.getRepository(Sede) : AppDataSource.getRepository(Sede);

        const { nombre_sede, direccion, personalSolicitado } = data
        const rutSecundario = cleanRut(data.rutSecundario)

        //verificar que la sede exista
        const [sedeFound, errSede] = await getSedeByService({ sede_id: sede_id }, manager)
        if (errSede) {
            if (manager) throw [null, errSede]
            return [null, errSede]
        }

        if (rutSecundario && rutSecundario !== cleanRut(sedeFound.rutSecundario)) {
            //si el rut ya está registrado una sede de otro cliente
            const [existingRut, errRut] = await getSedeByService({ rutSecundario: rutSecundario }, manager)
            if (
                existingRut &&
                existingRut.sede_id !== sede_id &&
                existingRut.cliente.cliente_id !== sedeFound.cliente.cliente_id
            ) {
                if (manager) throw [null, createErrorMessage("rutSecundario", "Rut secundario no válido")];
                return [null, createErrorMessage("rutSecundario", "Rut secundario no válido")];
            }
        }

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


        //actualizar la sede
        await sedeRepository.update({ sede_id },
            {
                nombre_sede: nombre_sede,
                direccion: direccion,
                personalSolicitado: personalSolicitado,
                rutSecundario: rutSecundario || null,
                updatedAt: new Date(),
            });

        // Obtener la sede actualizada
        const [updatedSede, errUpdated] = await getSedeByService({ sede_id: sede_id }, manager);
        if (errUpdated) {
            if (manager) throw [null, "Sede no encontrada después de actualizar"];
            return [null, "Sede no encontrada después de actualizar"];
        }
        return [updatedSede, null];

    } catch (error) {
        if (Array.isArray(error)) {
            if (manager) throw error
            console.error("Error al actualizar sede", error[1]);
            return error
        }
        console.error("Error al actualizar sede:", error);
        if (manager) throw error
        return [null, "Error interno del servidor"]
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
        const clienteRepository = manager ?
            manager.getRepository(Cliente) : AppDataSource.getRepository(Cliente)

        const clientes = await clienteRepository.createQueryBuilder("cliente")
            .where("cliente.tipoCliente = :tipo", { tipo: "EMPRESA" })
            .leftJoinAndSelect("cliente.filiales", "filial")
            .leftJoinAndSelect("cliente.sede", "sedes")
            .leftJoinAndSelect("sedes.contactos", "contactos")

            .leftJoinAndSelect("filial.sede", "filialSede")
            .leftJoin("filialSede.contactos", "sedeContactos").getMany()

        if (!clientes || clientes.length === 0) {
            return [null, "No hay clientes"];
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


/**
 * Búsqueda estricta AND, comparaciones exactas
 * @param query datos correspondientes a los campos de un contacto, excluye conexiones
 * @returns un único cliente que coincida con TODOS los campos dados
 */
export async function getClienteByService(query, manager = null) {
    try {
        const clienteRepository = manager ?
            manager.getRepository(Cliente) : AppDataSource.getRepository(Cliente)
        const { cliente_id, nombreCliente, rutCliente, tipoCliente } = query

        const where = {}    //AND
        if (cliente_id) where.cliente_id = cliente_id
        if (nombreCliente) where.nombreCliente = nombreCliente
        if (rutCliente) where.rutCliente = cleanRut(rutCliente)
        if (tipoCliente) where.tipoCliente = tipoCliente

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
/**
 * Filtro acumulativo, búsqueda flexible, comparacion con subString
 * @param query datos correspondientes a los campos de un contacto, con los de sede anidados
 * @returns lista de contactos, no necesita coincidir en todos o ser igual totalmente
 */
export async function findClienteByService(query, manager = null) {
    try {
        const clienteRepository = manager ?
            manager.getRepository(Cliente) : AppDataSource.getRepository(Cliente)
        const { nombreCliente, rutCliente, sede } = query

        const where = {}    //AND

        if (nombreCliente) where.nombreCliente = contiene(nombreCliente)
        if (rutCliente) where.rutCliente = contiene(rutCliente)

        if (sede) {
            if (sede.direccion) where.sede.direccion = contiene(sede.direccion)
            if (sede.personalAsignado) where.sede.personalAsignado = contiene(sede.personalAsignado)
            if (sede.personalSolicitado) where.sede.personalSolicitado = contiene(sede.personalSolicitado)
        }

        const cliente = await clienteRepository.find({ relations: ["sede"], where })

        if (!cliente.length) {
            return [null, createErrorMessage("cliente", "Cliente no encontrado")]
        }

        return [cliente, null]

    } catch (error) {
        if (Array.isArray(error)) {
            if (manager) throw error
            console.error("Error al obtener el cliente", error[1]);
            return error
        }
        console.error("Error al obtener el cliente:", error);
        if (manager) throw error
        return [null, "Error interno del servidor"]
    }
}

export async function deleteCliente(cliente_id, manager = null) {
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
        const rutCliente = cleanRut(data.rutCliente)
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

        const [cliente, errCliente] = await getClienteByService({ cliente_id })

        if (errCliente) {
            if (manager) throw [null, createErrorMessage("cliente", "No encontrado")];
            return [null, createErrorMessage("cliente", "No encontrado")];
        }
        //si se entrega un rut, es distinto al actual y está en uso
        if (rutCliente && rutCliente !== cleanRut(cliente.rutCliente)) {
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
 * Crea un cliente sin sede ni contacto, se utiliza para validar y crear clientes
 * @param {*} cliente datos del cliente a crear. nombreCliente y rutCliente
 * @param {*} clientePadre_id ID del cliente padre, si se entrega el cliente a crear es filial, sino el ID es nulo
 * @returns 
 */
async function createCliente(cliente, clientePadre_id = null, manager = null) {
    try {
        const { nombreCliente } = cliente
        const rutCliente = cleanRut(cliente.rutCliente)

        if (!nombreCliente || !rutCliente) {
            if (manager) throw [null, createErrorMessage("cliente", "Datos incompletos")]
            return [null, createErrorMessage("cliente", "Datos incompletos")]
        }
        if (clientePadre_id) {
            const [clientePadreVerif, errClientePadreVerif] = await getClienteByService({ cliente_id: clientePadre_id }, manager)
            if (errClientePadreVerif) {
                if (manager) throw [null, errClientePadreVerif]
                return [null, errClientePadreVerif]
            } if (clientePadreVerif.tipoCliente !== "EMPRESA") {
                if (manager) throw [null, createErrorMessage("padre_id", "El cliente a afiliarse no califica")]
                return [null, createErrorMessage("padre_id", "El cliente a afiliarse no califica")]
            }
        }

        const clienteRepository = manager ?
            manager.getRepository(Cliente) : AppDataSource.getRepository(Cliente);

        const [existingClient, errCliente] = await getClienteByService({ rutCliente: rutCliente }, manager);
        const [existingRutUser, errRutUser] = await getUserService({ rut: rutCliente }, manager);
        const [existingRutContacto, errRutContacto] = await getContactoByService({ contacto_rut: rutCliente }, manager)
        if (existingClient || existingRutUser || existingRutContacto) {
            return [null, createErrorMessage("rut", "Rut en uso")];
        }
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
        return [null, "Error interno del servidor"]
    }
}
/*=====FIN FUNCIONES CRUD======*/


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
            if ((filial && cleanRut(filial.rutCliente) === cleanRut(cliente.rutCliente)) ||                                                 //verificacion de filial para cliente
                (trabajador && (cleanRut(cliente.rutCliente) === cleanRut(trabajador.rut) || cleanRut(trabajador.rut) === cleanRut(contacto.contacto_rut))) ||  //verificacion con trabajador para supervisor
                cleanRut(cliente.rutCliente) === cleanRut(contacto.contacto_rut))                                                           //verificacion de contacto para cliente
                throw createErrorMessage("rut", "Rut duplicado")


            //verificar el rut con las sedes, que no esté registrado en una sede de otro cliente
            const [existingSedeRut, errSedeRut] = await getSedeByService({ rutSecundario: cleanRut(cliente.rutCliente) }, manager)
            if (existingSedeRut) return [null, createErrorMessage("rut", "Rut ya en uso")]

            if (filial && Object.keys(filial).length > 0) {
                const [existingSedeRutFilial, errSedeRutFilial] = await getSedeByService({ rutSecundario: cleanRut(filial.rutCliente) }, manager)

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

export async function registerSedeSimpleService(sede, contacto, cliente_id, trabajador_id = null, manager = null) {
    try {
        const execute = async (transactionManager) => {
            const { nombre_sede, direccion, rutSecundario, personalSolicitado } = sede
            if (!nombre_sede || !direccion || !cliente_id) throw [null, createErrorMessage("nombre_sede/direccion", "Datos incompletos")]

            //no se hacen validaciones porque estan dentro de la funcion createSede
            const [sedeCreada, errSede] = await createSede(sede, cliente_id, transactionManager)
            if (errSede) throw [null, errSede]

            const [contactoCreado, errContacto] = await createContactoService(contacto, sedeCreada.sede_id, transactionManager)
            if (errContacto) throw [null, errContacto]

            let usuarioSupervisor = null, errSupervisor = null
            if (trabajador_id) {
                [usuarioSupervisor, errSupervisor] = await asignarSupervisorService({ id: trabajador_id }, sedeCreada.sede_id, transactionManager)
                if (errSupervisor) throw [null, errSupervisor]
            }

            return [{
                ...sedeCreada,
                contacto: contactoCreado,
                supervisor: usuarioSupervisor
            }, null]

        }

        if (manager) return await execute(manager)
        return AppDataSource.transaction(execute)
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


//Funciones compuestas para registro jerarquico

/**
 * Función para registrar un cliente o filial de forma jerárquica, con la posibilidad de asignar un supervisor desde el registro, pero sin necesidad de crear un perfil para el cliente o filial, ni asignar un contrato comercial al momento del registro, esta función se puede llamar recursivamente para registrar filiales anidadas
 * @param {*} cliente datos básicos del cliente con posibles filiales (subClientes) anidadas
 * @param {*} sedes Lista de sedes del cliente a registrar
 * @param {*} clientePadre_id ID opcional de un cliente al que se es afiliado
 * @param {*} manager espacio temporal en la base de datos
 * @returns Lista de cliente agregado y todos sus componentes
 */
export async function registerClienteJerarquicoService(cliente, sedes, clientePadre_id = null, manager = null) {
    try {

        const execute = async (transactionManager) => {


            const { nombreCliente, rutCliente, filiales } = cliente
            if (!nombreCliente || !rutCliente) throw [null, createErrorMessage("nombreCliente/rutCliente", "Datos incompletos o repetidos")]

            const [clientePadre, errorPadre] = await createCliente({ nombreCliente, rutCliente }, clientePadre_id, transactionManager)
            if (errorPadre) throw [null, errorPadre]

            const [sedesCreadas, errSedes] = await registerSedesJerarquicoService(sedes, clientePadre.cliente_id, transactionManager)
            if (errSedes) throw [null, errSedes]


            const filialResponse = []
            if ((Array.isArray(filiales) && filiales.length > 0)) {
                for (const filial of filiales) {
                    const [filialesCreadas, errFiliales] = await registerClienteJerarquicoService(filial, filial.sedes, clientePadre.cliente_id, transactionManager)
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
                    transactionManager)
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
                const [supervisores, errSupervisores] = await asignarSupervisorJerarquicoService(trabajadores, sedeCreada.sede_id, cliente_id, transactionManager)
                if (errSupervisores) throw [null, errSupervisores]
                sedeResponse.supervisores = supervisores

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
            //recorrer la lista de contactos entregada
            for (const contacto of contactos || []) {
                const { nombreContacto, contacto_rut, email, phone } = contacto
                const [contactoCreado, errContacto] = await createContactoService(
                    { nombreContacto, contacto_rut, email, phone },
                    sede_id,
                    transactionManager)
                if (errContacto) throw errContacto

                contactosCreados.push(contactoCreado)
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