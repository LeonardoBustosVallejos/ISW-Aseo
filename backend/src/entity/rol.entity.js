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
    relations: {
        users: {
            type: "one-to-many",
            target: "User",
            inverseSide: "rol"
        }
    }
});

export default rolSchema;