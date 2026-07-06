"use strict";
import { EntitySchema, JoinColumn, JoinTable } from "typeorm";

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
    telefono: {
      type: "varchar",
      length: 12,
      nullable: true,
      unique: true
    },
    email: {
      type: "varchar",
      length: 255,
      nullable: false,
      unique: true,
    },
    sexo: {
      type: "varchar",
      length: 1,
      nullable: false,
    },/*
    competencias: {
      type: "varchar",
      length: 255,
      nullable: true,
    },*/
    foto_url: {
      type: "varchar",
      length: 255,
      nullable: false
    },
    cv_url: {
      type: "varchar",
      length: 255,
      nullable: false
    },
    antecedentes_url: {
      type: "varchar",
      length: 255,
      nullable: false
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
      },
      rol: {
        type: "many-to-one",
        target: "Rol",
        joinColumn: {
          name: "rol_id"
        },
        eager: true //hace que al buscar un trabajador, traiga automáticamente su rol
      },
      gruposSupervisados: {
        type: "one-to-many",
        target: "TrabajadoresGrupos",
        inverseSide: "supervisorAsignado",
        //nullable: true
      },
      competencias: {
        type: "many-to-many",
        target: "Item",
        inverseSide: "competenciasTrabajadores",
        JoinTable: true,
        nullable: true,
        joinTable: {
          name: "trabajadoresCompetencias",
          referencedColumn: "id"
        },
        inverseJoinColumn: {
          name: "item_id",
          referencedColumn: "id"
        }
      }
  },
});

export default TrabajadorSchema;