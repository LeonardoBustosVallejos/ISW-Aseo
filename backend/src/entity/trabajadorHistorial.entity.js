"use strict";
import { EntitySchema, JoinColumn } from "typeorm";

const TrabajadorHistorialSchema = new EntitySchema({
    name: "TrabajadorHistorial",
    tableName: "trabajadores_historial",
    columns: {
        trabajadorHistorial_id:{
            type: "int",
            primary: true,
            generated: true,
        },
        motivo: {
            type: "varchar",
            length: 500,
            nullable: false,
        },
        archivo_url: {
            type: "varchar",
            length: 500,
            nullable: true
        },
        fechaDesvinculacion: {
            type: "timestamp with time zone",
            default: () => "CURRENT_TIMESTAMP",
            nullable: false,
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
        }
    },
    relations: {
        trabajador: {
            type: "many-to-one",
            target: "Trabajador",
            joinColumn: { name: "trabajador_id" },
            nullable: false,
            onDelete: "CASCADE",
        },
    }
});

export default TrabajadorHistorialSchema;