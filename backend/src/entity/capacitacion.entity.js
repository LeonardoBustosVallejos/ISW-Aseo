"use strict";
import { EntitySchema } from "typeorm";

const CapacitacionSchema = new EntitySchema({
    name: "Capacitacion",
    tableName: "capacitaciones",
    columns: {
        id_capacitacion: {
            type: "int",
            primary: true,
            generated: true,
            unique: true
        },
        id_item: {
            type: "int",
            primary: true,
            generated: true,
        },
        id_trabajador: {
            type: "int",
            primary: true,
            generated: true,
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
    indices: [
    {
      name: "IDX_CAPACITACION",
      columns: ["id_capacitacion"],
      unique: true,
    }
  ],
});

export default CapacitacionSchema;