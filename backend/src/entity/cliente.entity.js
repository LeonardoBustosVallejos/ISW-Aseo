import { BeforeInsert, BeforeUpdate, EntitySchema } from "typeorm";
import { cleanClienteEntity } from "../cleaners/cliente.cleaner.js";
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
            nullable: true,        //si es filial, el rut es opcional
            unique: true,
        },
        tipoCliente: {
            type: "enum",
            enum: ["EMPRESA", "FILIAL"],
            default: "EMPRESA"
        },
        createdAt: {
            type: "timestamp with time zone",
            default: () => "CURRENT_TIMESTAMP",
            nullable: false,
        },
        updatedAt: {
            type: "timestamp with time zone",
            default: () => "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
            nullable: false,
        },
    },
    listeners: {
        BeforeInsert(entity) {
            cleanClienteEntity(entity)
        },
        BeforeUpdate(entity) {
            cleanClienteEntity(entity)
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
         * Relación recursiva para representar grupos empresariales,
         * donde un cliente puede ser filial de otro cliente.
         *
         * Cada cliente mantiene su propio RUT.
         *
         * Ejemplo:
         * cliente
         *  ├── atributos
         *  ├── sedes[]
         *  │     └── contactos[]
         *  └── filiales[]
         *      ├── atributos
         *      └── sedes[]
         *              └── contactos[]
         */
        clientePadre: {
            type: "many-to-one",
            target: "Cliente",
            joinColumn: { name: "cliente_padre_id" },
            nullable: true,
            onDelete: "CASCADE"
        },
        filiales: {
            type: "one-to-many",
            target: "Cliente",
            inverseSide: "clientePadre"
        }
    }
})



export default ClienteSchema