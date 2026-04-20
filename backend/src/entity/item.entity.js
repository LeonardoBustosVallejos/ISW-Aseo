"use strict";
import { EntitySchema } from "typeorm";

const ItemSchema = new EntitySchema({
  name: "Item",
  tableName: "items",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    nombre: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    descripcion: {
      type: "varchar",
      length: 512,
      nullable: false,
      unique: true,
    },
    disponibilidadActual: {
      type: "int",
      primary: true,
    },
    disponibilidadTotal: {
      type: "int",
      primary: true,
    },
  },
  indices: [
    {
      name: "IDX_ITEM",
      columns: ["id"],
      unique: true,
    }
  ],
});

export default ItemSchema;