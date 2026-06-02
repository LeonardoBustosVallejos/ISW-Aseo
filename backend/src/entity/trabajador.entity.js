"use strict";
import { EntitySchema, JoinColumn } from "typeorm";

const TrabajadorSchema = new EntitySchema({
  name: "Trabajador",
  tableName: "trabajadores",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    nombreCompleto: {
      type: "varchar",
      length: 225,
      nullable: false,
    },
    rut: {
      type: "varchar",
      length: 12,
      nullable: false,
      unique: true,
    },
    nacimiento: {
      type: "date",
      nullable: false,
    },
    email: {
      type: "varchar",
      length: 255,
      nullable: false,
      unique: true,
    },
    /*grupo: {
      type: "varchar",
      length: 255,
      nullable: true,
    },*/
    rol: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    sexo: {
      type: "varchar",
      length: 1,
      nullable: false,
    },
    competencias: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    // Metadatos de foto
    fotoNombreOriginal: {
      type: "varchar",
      length: 255,
      nullable: true
    },
    fotoNombreArchivo: {
      type: "varchar",
      length: 255,
      nullable: true
    },
    fotoRuta: {
      type: "varchar",
      length: 255,
      nullable: true
    },  
    fotoMimeType: {
      type: "varchar", 
      length: 100, 
      nullable: true,
    },
    fotoPeso: {
      type: "bigint",
      nullable: true
    },
    // Metadatos de CV
    cvNombreOriginal: {
      type: "varchar",
      length: 255,
      nullable: true
    },
    cvNombreArchivo: {
      type: "varchar",
      length: 255,
      nullable: true
    },
    cvRuta: {
      type: "varchar",
      length: 255,
      nullable: true
    },
    cvMimeType: {
      type: "varchar",
      length: 255,
      nullable: true
    },
    cvPeso: {
      type: "bigint",
      nullable: true
    },
    // Metadatos de antecedentes
        antecedentesNombreOriginal: {
      type: "varchar",
      length: 255,
      nullable: true
    },
    antecedentesNombreArchivo: {
      type: "varchar",
      length: 255,
      nullable: true
    },
    antecedentesRuta: {
      type: "varchar",
      length: 255,
      nullable: true
    },
    antecedentesMimeType: {
      type: "varchar",
      length: 255,
      nullable: true
    },
    antecedentesPeso: {
      type: "bigint",
      nullable: true
    },
    despedido: {
      type: "boolean",
      nullable: false,
      default: false,
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
      historialDesvinculaciones: {
        type: "one-to-many",
        target: "TrabajadorHistorial",
        inverseSide: "trabajador",
      },
      grupoAsignado: {
        type: "many-to-one",
        target: "TrabajadoresGrupos",
        JoinColumn: { name: "grupo_id" },
        nullable: true,
        onDelete: "SET NULL",
        inverseSide: "miembros"
      },
      supervisorDeGrupo: {
        type: "one-to-any",
        target: "TrabajadoresGrupos",
        inverseSide: "supervisorAsignado"
      }
  },
});

export default TrabajadorSchema;