import { BeforeInsert, BeforeUpdate, EntitySchema } from "typeorm";
import { cleanContactoEntity } from "../cleaners/cliente.cleaner.js";

/**
 * esquema de tabla de contactos de las empresas
 * un contacto no puede ser trabajador
 */
const ContactoSchema = new EntitySchema({
    name: "Contacto",
    tableName: "contactos",
    columns: {
        contacto_id: {
            type: "int",
            primary: true,
            generated: true,
        },
        nombreContacto: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        contacto_rut: {         //no es único, pueden ser varios correos y telefonos de la misma persona
            type: "varchar",
            length: 15,
            nullable: false,
        },
        email: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        phone: {
            type: "varchar",
            length: 15,
            nullable: true,
        },
        tipoContacto: {
            type: "enum",
            enum: ["PRINCIPAL", "SECUNDARIO", "EMERGENCIA", "OTRO"],
            default: "PRINCIPAL"
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
            cleanContactoEntity(entity)
        },
        BeforeUpdate(entity) {
            cleanContactoEntity(entity)
        }
    },
    relations: {
        cliente: {
            type: "many-to-one",
            target: "Cliente",
            joinColumn: { name: "cliente_id" },
            nullable: false,
            onDelete: "CASCADE"
        },
        //varios contactos pueden ser de la misma sede
        sede: {
            type: "many-to-one",
            target: "Sede",
            joinColumn: { name: "sede_id" },
            onDelete: "CASCADE",
            nullable: false
        }
    }
})

export default ContactoSchema