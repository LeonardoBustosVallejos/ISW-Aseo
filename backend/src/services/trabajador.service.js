"use strict";
import { AppDataSource } from "../config/configDb.js";
import Trabajador from "../entity/trabajador.entity.js";

/*
export async function getUsersService() {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const users = await userRepository.find();

    if (!users || users.length === 0) return [null, "No hay usuarios"];

    const usersData = users.map(({ password, ...user }) => user);

    return [usersData, null];
  } catch (error) {
    console.error("Error al obtener a los usuarios:", error);
    return [null, "Error interno del servidor"];
  }
}
*/
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

export async function createTrabajadoresService(trabajadoresData) {
    try {
        const { nombreCompleto, rut, nacimiento, email, rol, competencias } = trabajadoresData;
        const TrabajadoresRepository = AppDataSource.getRepository(Trabajador);

        const newTrabajador = TrabajadoresRepository.create({
            nombreCompleto,
            rut,
            nacimiento,
            email,
            rol,
            competencias,
        });
        const trabajadorGuardado = await TrabajadoresRepository.save(newTrabajador);
        return [trabajadorGuardado, null];
    }
    catch(error) {
        return [null, error.message];
    }
}

