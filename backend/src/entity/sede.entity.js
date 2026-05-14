import { BeforeInsert, BeforeUpdate, EntitySchema } from "typeorm";
import { cleanSedeEntity } from "../cleaners/cliente.cleaner.js";

const SedeSchema = new EntitySchema({
    name: "Sede",
    tableName: "sedes",
    columns: {
        sede_id: {
            primary: true,
            type: "int",
            generated: true
        },
        rutSecundario: {
            type: "varchar",
            length: 15,
            nullable: true,
            unique: true,
        },
        nombre_sede: {
            type: "varchar",
            length: 255,
            nullable: false,
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
            cleanSedeEntity(entity)
        },
        BeforeUpdate(entity) {
            cleanSedeEntity(entity)
        }
    },
    relations: {
        //varias sedes pueden ser del mismo cliente
        cliente: {
            type: "many-to-many",
            target: "Cliente",
            joinColumn: { name: "cliente_id" },
            onDelete: "CASCADE" //Si se elimina el cliente con el que está relacionado, también se eliminará la dirección
        },
        //una sede puede tener varias personas de contactos
        contactos: {
            type: "one-to-many",
            target: "Contacto",
            inverseSide: "sede"
        },
    }

})

export default SedeSchema