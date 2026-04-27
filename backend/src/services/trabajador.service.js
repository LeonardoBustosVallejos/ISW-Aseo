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

