"use strict";
import { Repository } from "typeorm";
import { AppDataSource } from "../config/configDb.js";
import Trabajador from "../entity/trabajador.entity.js";
import Contacto from "../entity/contacto.entity.js";


export async function getTrabajadoresService() {
    try {
        const TrabajadoresRepository = AppDataSource.getRepository(Trabajador);

        const trabajadores = await TrabajadoresRepository.find({
            where: {
                despedido: false
            }
        });

        if (!trabajadores || trabajadores.length === 0) return [null, "No hay trabajadores"];

        return [trabajadores, null];
    }
    catch (error) {
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

        if (!trabajador) return [null, "No se encontró el trabajador"];

        return [trabajador, null];
    }
    catch (error) {
        console.error("Error al obtener el trabajador:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function updateTrabajadorService(id, body) {
    try {
        const trabajadoresRepository = AppDataSource.getRepository(Trabajador);
        const contactoRepository = AppDataSource.getRepository(Contacto);
        const trabajadorFound = await trabajadoresRepository.findOne({
            where:
                { id: Number(id) },
        })
        if (!trabajadorFound) return [null, "Trabajador no encontrado"]

        /*const existingTrabajador = await trabajadoresRepository.findOne({
        where: [{ email: body.email }],
        });
        if (existingTrabajador && existingTrabajador.id !== trabajadorFound.id) {
            return [null, "Ya existe un trabajador con el mismo email"];
        }*/

        //verificar que el correo electrónico no esté registrado
        const existingEmail = await TrabajadoresRepository.findOne({ where: [{ email: body.email }] })
        const existingContactoEmail = await contactoRepository.findOne({ where: [{ email: body.email }] })
        if (existingEmail || existingContactoEmail) return [null, "Email ya en uso"]

        const dataTrabajadorUpdate = {
            grupo: body.grupo,
            antecedentes: body.antecedentes,
            email: body.email,
            rol: body.rol,
            competencias: body.competencias,
            updatedAt: new Date(),
        };

        await trabajadoresRepository.update({ id: trabajadorFound.id }, dataTrabajadorUpdate);

        const trabajadorData = await trabajadoresRepository.findOne({
            where: { id: trabajadorFound.id },
        });

        if (!trabajadorFound) return [null, "Trabajador no encontrado"];

        if (!trabajadorData) {
            return [null, "Trabajador no encontrado después de actualizar"];
        }

        return [trabajadorData, null];
    } catch (error) {
        console.error("Error al modificar un trabajador:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function despidoTrabajadorService(id, despedido = true) {
    try {
        const trabajadoresRepository = AppDataSource.getRepository(Trabajador);
        const trabajadorFound = await trabajadoresRepository.findOne({
            where:
            {
                id: Number(id),
                despedido: false,
            },
        })
        if (!trabajadorFound) return [null, "Trabajador no encontrado"]

        const dataTrabajadorUpdate = {
            despedido: Boolean(despedido),
            updatedAt: new Date(),
        }

        await trabajadoresRepository.update({ id: trabajadorFound.id }, dataTrabajadorUpdate);

        const trabajadorData = await trabajadoresRepository.findOne({
            where: { id: trabajadorFound.id },
        });

        if (!trabajadorData) {
            return [null, "Trabajador no encontrado después de despedirse"];
        }

        return [trabajadorData, null];

    } catch (error) {
        console.error("Error al despedir un trabajador:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function recontratarTrabajadorService(id, despedido = false) {
    try {
        const trabajadoresRepository = AppDataSource.getRepository(Trabajador);
        const trabajadorFound = await trabajadoresRepository.findOne({
            where:
            {
                id: Number(id),
                despedido: true,
            },
        })
        if (!trabajadorFound) return [null, "Trabajador no encontrado"]

        const dataTrabajadorUpdate = {
            despedido: Boolean(despedido),
            updatedAt: new Date(),
        }

        await trabajadoresRepository.update({ id: trabajadorFound.id }, dataTrabajadorUpdate);

        const trabajadorData = await trabajadoresRepository.findOne({
            where: { id: trabajadorFound.id },
        });

        if (!trabajadorData) {
            return [null, "Trabajador no encontrado después de despedirse"];
        }

        return [trabajadorData, null];

    } catch (error) {
        console.error("Error al despedir un trabajador:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function createTrabajadoresService(trabajadoresData) {
    try {
        const { nombreCompleto,
            nacimiento,
            rut,
            email,
            grupo,
            antecedentes,
            rol,
            sexo,
            competencias,
            despedido } = trabajadoresData;
        const TrabajadoresRepository = AppDataSource.getRepository(Trabajador);
        const contactoRepository = AppDataSource.getRepository(Contacto);


        //verificar que el rut no esté ya registrado
        const existingRut = await TrabajadoresRepository.findOne({ where: [{ rut: rut }] })
        const existingContacto = await contactoRepository.findOne({ where: [{ contacto_rut: rut }] })
        if (existingContacto || existingRut) return [null, "Rut ya registrado previamente"]

        //verificar que el correo electrónico no esté registrado
        const existingEmail = await TrabajadoresRepository.findOne({ where: [{ email: email }] })
        const existingContactoEmail = await contactoRepository.findOne({ where: [{ email: email }] })
        if (existingEmail || existingContactoEmail) return [null, "Email ya en uso"]

        const newTrabajador = TrabajadoresRepository.create({
            nombreCompleto,
            nacimiento,
            rut,
            email,
            grupo,
            antecedentes,
            rol,
            sexo,
            competencias,
            despedido: despedido ?? false,
        });
        const trabajadorGuardado = await TrabajadoresRepository.save(newTrabajador);
        return [trabajadorGuardado, null];
    }
    catch (error) {
        return [null, error.message];
    }
}