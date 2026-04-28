import { EntitySchema } from "typeorm";
/**
 * Tabla de los clientes, se relaciona con los usuarios a traves de un supervisor
 */
const ClienteSchema = new EntitySchema({
    name: "Cliente",
    tableName: "clientes",
    columns: {
        cliente_id: {
            primary: true,
            type: "int",
            generated: true
        },
        nombreCliente: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        rutCliente: {
            type: "varchar",
            length: 12,
            nullable: false,
            unique: true,
        },
        direccion: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        personalSolicitado: {
            type: "int",
            default: 1
        },
        personalAsignado: {
            type: "int",
            default: 0
        },

    },
    indices: [{
        name: "IDX_CLIENTE",
        columns: ["cliente_id"],
        unique: true,
    }],
    relations: {
        contactos: {
            type: "one-to-many",
            target: "Contacto",
            inverseSide: "cliente"
        }
    }
})
export default ClienteSchema