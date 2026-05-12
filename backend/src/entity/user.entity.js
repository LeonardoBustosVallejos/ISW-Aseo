"use strict";
import { BeforeInsert, BeforeUpdate, EntitySchema } from "typeorm";
import { cleanUserEntity } from "../cleaners/user.cleaner.js";

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
      length: 15,
      nullable: true,
      unique: true
    },
    isActive: {
      type: "boolean",
      default: true,
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
    },
  },
  listeners: {
    BeforeInsert(entity) {
      cleanUserEntity(entity)
    },
    BeforeUpdate(entity) {
      cleanUserEntity(entity)
    }
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
    //varrios usuarios pueden tener el mismo rol
    rol: {
      target: "Rol",
      type: "many-to-one",
      joinColumn: { name: "rol_id" },
      nullable: false,
      onDelete: "CASCADE",
    },
    //varios usuarios pueden trabajar para la misma sede o ninguno
    asignacionSede: {
      target: "TrabajadoresAsignados",
      type: "one-to-many",
      inverseSide: "usuario",
      onDelete: null,
    }
  }
});

export default UserSchema;