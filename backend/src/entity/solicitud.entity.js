"use strict";
import { EntitySchema } from "typeorm";

const SolicitudSchema = new EntitySchema({
  name: "Solicitud",
  tableName: "solicitudes",
  columns: {
    id_solicitud: {
      type: "int",
      primary: true,
      unique: true,
      generated: true,
    },
    cantidad_solicitud: {
      type: "int",
      nullable: false,
    },
    id_item_solicitud: {
      type: "int",
      nullable: false,
    },
    id_solicitante: {
      type: "int",
      nullable: false,
    },
    id_administrador_solicitud: {
      type: "int",
      nullable: true
    },
    id_sede_solicitud: {
      type: "int",
      nullable: false
    },
    detalle_solicitud: {
      type: "varchar",
      length: 512,
      nullable: false,
    },
    estado_solicitud: {
      type: "varchar",
      length: 255,
      default: "Pendiente",
      nullable: false
    }
  },
  relations: {
   /* item: {
      target: "Item",
      type: "many-to-one",
      joinColumn: {
        name: "id_item_solicitud",
        referencedColumnName: "id"
      },
      onDelete: "CASCADE"
    },*/
    solicitante: {
      target: "Trabajador",
      type: "many-to-one",
      joinColumn: {
        name: "id_solicitante",
        referencedColumnName: "id"
      },
    },
    administrador: {
      target: "Trabajador",
      type: "many-to-one",
      joinColumn: {
        name: "id_administrador_solicitud",
        referencedColumnName: "id"
      },
      onDelete: "SET NULL"
    },
    sede: {
      target: "Sede",
      type: "many-to-one",
      joinColumn: {
        name: "id_sede_solicitud",
        referencedColumnName: "sede_id"
      },
      onDelete: "CASCADE"
    }
  },
  indices: [
    {
      name: "IDX_SOLICITUD",
      columns: ["id_solicitud"],
      unique: true,
    }
  ],
});

export default SolicitudSchema;