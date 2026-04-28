import { EntitySchema } from "typeorm";

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
        contacto_rut: {
            type: "varchar",
            length: 12,
            nullable: false,
            unique: true,
        },
        email: {
            type: "varchar",
            length: 255,
            nullable: false,
            unique: true,
        },
        phone: {
            type: "varchar",
            length: 12,
            nullable: true,
            unique: true
        },
    },
    relations: {
        cliente: {
            type: "many-to-one",
            target: "Cliente",
            joinColumn: { name: "cliente_id" },
            onDelete: "CASCADE"
        }
    }
})

export default ContactoSchema