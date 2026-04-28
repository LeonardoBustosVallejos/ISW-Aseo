"use strict";
import { EntitySchema } from "typeorm";

const ItemSchema = new EntitySchema({
  name: "Item",
  tableName: "items",
  columns: {
    item_id: {
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
      columns: ["item_id"],
      unique: true,
    }
  ],
});

export default ItemSchema;