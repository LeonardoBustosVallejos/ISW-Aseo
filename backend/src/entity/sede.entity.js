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
            unique: false,
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
        tipoSede: {
            type: "enum",
            enum: ["PRINCIPAL", "SUCURSAL", "BODEGA"],
            default: "PRINCIPAL"
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
            type: "many-to-one",
            target: "Cliente",
            joinColumn: { name: "cliente_id" },
            nullable: false,
            onDelete: "CASCADE" //Si se elimina el cliente con el que está relacionado, también se eliminará la dirección
        },
        //una sede puede tener varias personas de contactos
        contactos: {
            type: "one-to-many",
            target: "Contacto",
            inverseSide: "sede"
        },
        contrato: {
            target: "ContratoComercial",
            type: "many-to-many",
            inverseSide: "sedes"
        },
        anexo: {
            target: "ContratoAnexo",
            type: "many-to-many",
            inverseSide: "sedes"
        }
    }

})

export default SedeSchema