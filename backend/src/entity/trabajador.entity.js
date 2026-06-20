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
    nombres: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    apellidoPaterno: {
      type: "varchar",
      length: 60,
      nullable: false,
    },
    apellidoMaterno: {
      type: "varchar",
      length: 60,
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
    foto_url: {
      type: "varchar",
      length: 255,
      nullable: true
    },
    cv_url: {
      type: "varchar",
      length: 255,
      nullable: true
    },
    antecedentes_url: {
      type: "varchar",
      length: 255,
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
        joinColumn: { name: "grupo_id" },
        nullable: true,
        onDelete: "SET NULL",
        inverseSide: "miembros"
      },
      supervisorDeGrupo: {
        type: "one-to-many",
        target: "TrabajadoresGrupos",
        inverseSide: "supervisorAsignado"
      }
  },
});

export default TrabajadorSchema;