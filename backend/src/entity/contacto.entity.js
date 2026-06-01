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
        contacto_rut: {         //no es único, pueden ser varios correos y telefonos de la misma persona
            type: "varchar",
            length: 15,
            nullable: false,
        },
        email: {
            type: "varchar",
            length: 255,
            nullable: false,
            unique: true,
        },
        phone: {
            type: "varchar",
            length: 15,
            nullable: true,
            unique: true
        },
    },
    relations: {
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