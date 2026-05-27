import { EntitySchema } from "typeorm";

const SedeSchema = new EntitySchema({
    name: "Sede",
    tableName: "sedes",
    columns: {
        sede_id: {
            primary: true,
            type: "int",
            generated: true
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
    relations: {
        //varias sedes pueden ser del mismo cliente
        cliente: {
            type: "many-to-one",
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