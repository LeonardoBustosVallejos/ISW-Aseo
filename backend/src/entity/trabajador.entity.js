"use strict";
import { EntitySchema } from "typeorm";

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
    grupo: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    antecedentes: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
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
});

export default TrabajadorSchema;