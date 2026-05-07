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
        /**
         * relacion de cliente a si mismo para representar la relación entre cliente principal y filial.
         * Es decir, para los casos de varias sedes con el mismo rut y bajo el mismo nombre.
         */
        clientePadre: {
            type: "many-to-one",
            target: "Cliente",
            joinColumn: { name: "cliente_padre_id" },
            nullable: true
        },
        filiales: {
            type: "one-to-many",
            target: "Cliente",
            inverseSide: "clientePadre"
        }
    }
})
export default ClienteSchema