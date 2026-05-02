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
            length: 15,
            nullable: false,
            unique: true,
        },
    },
    indices: [{
        name: "IDX_CLIENTE",
        columns: ["cliente_id"],
        unique: true,
    }],
    relations: {
        //un cliente puede tener varias sedes, por ejemplo la UBB en Concepción y Chillán
        sede: {
            type: "one-to-many",
            target: "Sede",
            inverseSide: "cliente"
        },
    }
})
export default ClienteSchema