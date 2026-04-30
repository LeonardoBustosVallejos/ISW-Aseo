"use strict";
import { EntitySchema } from "typeorm";

/**
 * tabla de usuarios
 * 
 * Cada uno tiene un rol
 * Cada rol que no sea trabajador se puede asignar a un cliente
 */
const UserSchema = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    nombreCompleto: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    rut: {
      type: "varchar",
      length: 12,
      nullable: false,
      unique: true,
    },
    email: {
      type: "varchar",
      length: 255,
      nullable: false,
      unique: true,
    },
    password: {
      type: "varchar",
      nullable: false,
    },
    phone: {
      type: "varchar",
      length: 12,
      nullable: true,
      unique: true
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
      name: "IDX_USER",
      columns: ["id"],
      unique: true,
    },
    {
      name: "IDX_USER_RUT",
      columns: ["rut"],
      unique: true,
    },
    {
      name: "IDX_USER_EMAIL",
      columns: ["email"],
      unique: true,
    },
    {
      name: "IDX_USER_PHONE",
      columns: ["phone"],
      unique: true,
    },
  ],
  relations: {
    rol: {
      target: "Rol",
      type: "many-to-one",
      joinColumn: { name: "rol_id" },
      nullable: false,
      onDelete: "CASCADE",
    },
    cliente: {
      target: "Cliente",
      type: "many-to-one",
      joinColumn: { name: "cliente_id" },
      nullable: true,
      onDelete: "CASCADE",
    }
  }
});

export default UserSchema;