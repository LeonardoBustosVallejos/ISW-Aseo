"use strict";
import { Repository } from "typeorm";
import { AppDataSource } from "../config/configDb.js";
import Trabajador from "../entity/trabajador.entity.js";


export async function getTrabajadoresService() {
    try {
        const TrabajadoresRepository = AppDataSource.getRepository(Trabajador);

        const trabajadores = await TrabajadoresRepository.find();

        if (!trabajadores || trabajadores.length === 0) return [null, "No hay trabajadores"];

        //const trabajadoresData = trabajadores.map(({ password, ...trabajador }) => trabajador);

        return [trabajadores, null];
    }
    catch(error) {
        console.error("Error al obtener a los trabajadores:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function getTrabajadorService(id) {
    try {
        const TrabajadoresRepository = AppDataSource.getRepository(Trabajador);
        const trabajador = await TrabajadoresRepository.findOne({ 
            where: 
                { id: Number(id) }, 
            });

        if (!trabajador) return [ null, "No se encontró el trabajador"];

        return [trabajador, null];
    }
    catch(error) {
        console.error("Error al obtener el trabajador:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function createTrabajadoresService(trabajadoresData) {
    try {
        const { nombreCompleto, rut, nacimiento, email, rol, sexo, competencias } = trabajadoresData;
        const TrabajadoresRepository = AppDataSource.getRepository(Trabajador);

        const newTrabajador = TrabajadoresRepository.create({
            nombreCompleto,
            rut,
            nacimiento,
            email,
            rol,
            sexo,
            competencias,
        });
        const trabajadorGuardado = await TrabajadoresRepository.save(newTrabajador);
        return [trabajadorGuardado, null];
    }
    catch(error) {
        return [null, error.message];
    }
}

export async function updateTrabajadorService(id, body) {
    try {
        const trabajadoresRepository = AppDataSource.getRepository(Trabajador);
        const trabajadorFound = await trabajadoresRepository.findOne({
            where: 
                { id: Number(id) },
        })
        if (!trabajadorFound) return [null, "Trabajador no encontrado"]

        const existingTrabajador = await trabajadoresRepository.findOne({
        where: [{ email: body.email }],
    });
        if (existingTrabajador && existingTrabajador.id !== trabajadorFound.id) {
            return [null, "Ya existe un trabajador con el mismo email"];
        }
    
        const dataTrabajadorUpdate = {
            email: body.email,
            rol: body.rol,
            competencias: body.competencias,
            updatedAt: new Date(),
    };

    await trabajadoresRepository.update({ id: trabajadorFound.id }, dataTrabajadorUpdate);

    const trabajadorData = await trabajadoresRepository.findOne({
        where: { id: trabajadorFound.id },
    });

    if (!trabajadorFound) return [null, "Usuario no encontrado"];

    if (!trabajadorData) {
      return [null, "Trabajador no encontrado después de actualizar"];
    }

    return [trabajadorData, null];
  } catch (error) {
    console.error("Error al modificar un trabajador:", error);
    return [null, "Error interno del servidor"];
  }
}
/*
export async function updateUserService(query, body) {
  try {
    const { id, rut, email } = query;

    const userRepository = AppDataSource.getRepository(User);

    const userFound = await userRepository.findOne({
      where: [{ id: id }, { rut: rut }, { email: email }],
    });

    if (!userFound) return [null, "Usuario no encontrado"];

    const existingUser = await userRepository.findOne({
      where: [{ rut: body.rut }, { email: body.email }],
    });

    if (existingUser && existingUser.id !== userFound.id) {
      return [null, "Ya existe un usuario con el mismo rut o email"];
    }
      
    const dataUserUpdate = {
      nombreCompleto: body.nombreCompleto,
      rut: body.rut,
      email: body.email,
      rol: body.rol,
      updatedAt: new Date(),
    };

    await userRepository.update({ id: userFound.id }, dataUserUpdate);

    const userData = await userRepository.findOne({
      where: { id: userFound.id },
    });

    if (!userData) {
      return [null, "Usuario no encontrado después de actualizar"];
    }

    return [userUpdated, null];
  } catch (error) {
    console.error("Error al modificar un usuario:", error);
    return [null, "Error interno del servidor"];
  }
}
*/