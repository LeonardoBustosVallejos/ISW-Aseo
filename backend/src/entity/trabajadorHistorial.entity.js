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
        // posible archivo adjunto
        archivoNombreOriginal: {
            type: "varchar",
            length: 255,
            nullable: true
        },
        archivoNombreArchivo: {
            type: "varchar",
            length: 255,
            nullable: true
        },  
        archivoRuta: {
            type: "varchar",
            length: 255,
            nullable: true
        },
        archivoMimeType: {
            type: "varchar", 
            length: 100, 
            nullable: true,
        },
        archivoPeso: {
            type: "bigint",
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