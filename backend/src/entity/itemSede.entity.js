"use strict";
import { EntitySchema } from "typeorm";

const ItemSedeSchema = new EntitySchema({
  name: "ItemSede",
  tableName: "item_sede",
  columns: {
    id: {
      type: "int",
      primary: true,
      unique: true,
      generated: true,
    },
    id_item: {
      type: "int",
      nullable: false,
    },
    id_sede: {
      type: "int",
      nullable: false,
    },
    cantidad: {
      type: "int",
      nullable: false,
    },
  },
  indices: [
    {
      name: "IDX_ITEM_SEDE",
      columns: ["id"],
      unique: true,
    }
  ],
  relations: {
    item: {
      type: "many-to-one",
      target: "Item",
      joinColumn: { name: "id_item", referencedColumnName: "id" },
      nullable: false,
      onDelete: "CASCADE",
    },
    sede: {
      type: "many-to-one",
      target: "Sede",
      joinColumn: { name: "id_sede", referencedColumnName: "sede_id" },
      nullable: false,
      onDelete: "CASCADE",
    },
  }
});

export default ItemSedeSchema;
