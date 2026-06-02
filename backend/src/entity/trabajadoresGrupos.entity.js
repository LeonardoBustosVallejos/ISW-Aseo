"use strict";
import { EntitySchema } from "typeorm";

const TrabajadoresGruposSchema = new EntitySchema({
  name: "TrabajadoresGrupos",
  tableName: "trabajadores_grupos",

  columns: {
    grupo_id: {
      type: "int",
      primary: true,
      generated: true,
    },
    nombre: {
      type: "varchar", 
      length: 150, 
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
    supervisorAsignado: {
      type: "many-to-one",
        target: "Trabajador",
        joinColumn: { name: "supervisor_id" },
        nullable: false,
        onDelete: "RESTRICT",
        inverseSide: "gruposSupervisados"
    },
    sedeAsignada: {
      type: "many-to-one",
        target: "Sede",
        joinColumn: { name: "sede_id" },
        nullable: false,
        onDelete: "CASCADE",
        inverseSide: "grupos"
    },
    miembros: {
      type: "one-to-many",
      target: "Trabajador",
      inverseSide: "grupoAsignado"
    }
  }

})

export default TrabajadoresGruposSchema;