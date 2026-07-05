"use strict";
import { EntitySchema } from "typeorm";

const ItemSchema = new EntitySchema({
  name: "Item",
  tableName: "items",
  columns: {
    id: {
      type: "int",
      primary: true,
      unique: true,
      generated: true,
    },
    nombre: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    codigo: {
      type: "varchar",
      lenght: 255,
      unique: true,
      nullable: false,
    },
    tipo: {
      type: "varchar",
      lenght: 255,
      nullable: false,
    },
    descripcion: {
      type: "varchar",
      length: 512,
      nullable: false,
    },
    disponibilidadActual: {
      type: "int",
    },
    disponibilidadTotal: {
      type: "int",
    },
  },
  indices: [
    {
      name: "IDX_ITEM",
      columns: ["id"],
      unique: true,
    }
  ],
  relations:{
  competenciasTrabajadores: {
    type: "many-to-many",
    target: "Trabajador",
    inverseSide: "competencias",
  }}
});

export default ItemSchema;