import { AppDataSource } from "../config/configDb.js";
import Contacto from "../entity/contacto.entity.js";
import Cliente from "../entity/cliente.entity.js";
import User from "../entity/user.entity.js";

const createErrorMessage = (dataInfo, message) => ({
    dataInfo,
    message
});

export async function getContactos() {
    try {
        const contactoRepository = AppDataSource.getRepository(Contacto);

        const contactos = await contactoRepository.find({
            relations: ["cliente"]
        });

        return [contactos, null];

    } catch (error) {
        console.error("Error al obtener contactos:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function getContactosByCliente(cliente_id) {
    try {
        const contactoRepository = AppDataSource.getRepository(Contacto);

        const contactos = await contactoRepository.find({
            where: {
                cliente: { cliente_id }
            }
        });

        if (!contactos.length) {
            return [null, createErrorMessage("cliente_id", "No hay contactos para este cliente")];
        }

        return [contactos, null];

    } catch (error) {
        console.error("Error al obtener contactos del cliente:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function getContactoByID(contacto_id) {
    try {
        const contactoRepository = AppDataSource.getRepository(Contacto);

        const contacto = await contactoRepository.findOne({
            where: { contacto_id },
            relations: ["cliente"]
        });

        if (!contacto) {
            return [null, createErrorMessage("contacto_id", "Contacto no encontrado")];
        }

        return [contacto, null];

    } catch (error) {
        console.error("Error al obtener contacto:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function getContactoByRut(contacto_rut) {
    try {
        const contactoRepository = AppDataSource.getRepository(Contacto);

        const contacto = await contactoRepository.findOne({
            where: { contacto_rut },
            relations: ["cliente"]
        });

        if (!contacto) {
            return [null, createErrorMessage("contacto_rut", "Contacto no encontrado")];
        }

        return [contacto, null];

    } catch (error) {
        console.error("Error al obtener contacto:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function createContacto(contacto, cliente) {
    try {
        const contactoRepository = AppDataSource.getRepository(Contacto)
        const clienteRepository = AppDataSource.getRepository(Cliente);
        const userRepository = AppDataSource.getRepository(User)

        //verificar que el contacto no sea un trabajador
        const existingUser = await userRepository.findOne({
            where: [
                { email: contacto.email },
                { phone: contacto.phone },
                { rut: contacto.contacto_rut }
            ]
        })
        if (existingUser) return [null, createErrorMessage("contacto", "Los datos de contacto corresponden a un trabajador")]


        if (cliente) {
            const existingClient = await clienteRepository.findOne({ where: { cliente_id: cliente_id } })
            if (!existingClient) return [null, { dataInfo: "cliente_id", message: "No existe cliente" }]
        }

        const nuevoContacto = contactoRepository.create({
            nombreContacto: contacto.nombreContacto,
            contacto_rut: contacto.contacto_rut,
            email: contacto.email,
            phone: contacto.phone,
            cliente: cliente
        });
        const contactoCreado = await contactoRepository.save(nuevoContacto)

        return [contactoCreado, null]

    } catch (error) {
        console.error("Error al registrar un contacto", error);
        return [null, "Error interno del servidor"];
    }
}

export async function deleteContacto(contacto_id) {
    try {
        const contactoRepository = AppDataSource.getRepository(Contacto)

        const [existingContacto, err1] = await getContactoByID(contacto_id)

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
        return [null, "Error interno del servidor"];
    }
}

export async function updateContacto(contacto_id, data) {
    try {

        if (data.email === "" || data.phone === "") {
            return [null, createErrorMessage("contacto", "Datos inválidos")];
        }

        const contactoRepository = AppDataSource.getRepository(Contacto);
        const userRepository = AppDataSource.getRepository(User)

        const [existingContacto, err1] = await getContactoByID(contacto_id)

        if (err1) {
            return [null, createErrorMessage("contacto_id", "Contacto no encontrado")];
        }

        //validar rut del contacto
        if (data.contacto_rut && data.contacto_rut !== existingContacto.contacto_rut) {
            const rutUser = await userRepository.findOne({ where: { rut: data.contacto_rut } })

            if (rutUser) {
                return [null, createErrorMessage("contacto_rut", "Correo ya en uso")];
            }
        }

        //validar email duplicado
        if (data.email && data.email !== existingContacto.email) {
            const emailExist = await contactoRepository.findOne({
                where: { email: data.email }
            });
            const emailUser = await userRepository.findOne({ where: { email: data.email } })

            if (emailExist || emailUser) {
                return [null, createErrorMessage("email", "Correo ya en uso")];
            }
        }

        //validar telefono duplicado
        if (data.phone && data.phone !== existingContacto.phone) {
            const phoneExist = await contactoRepository.findOne({
                where: { phone: data.phone }
            });
            const phoneUser = await userRepository.findOne({ where: { phone: data.phone } })
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
        return [null, "Error interno del servidor"];
    }
}
