"use strict";
import { EntitySchema } from "typeorm";

const rolSchema = new EntitySchema({
    name: "Rol",
    tableName: "roles",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true,
        },
        nombre: {
            type: "varchar",
            length: 50,
            nullable: false,
            unique: true,
        },
    },
});

export default rolSchema;