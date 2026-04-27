"use strict";
import { AppDataSource } from "../config/configDb.js";
import Trabajador from "../entity/trabajador.entity.js";

export async function getTrabajadoresService() {
    try {

    }
    catch(error) {
        
    }
}
/*
export async function createItemService(itemData) {
    try {
        const { nombre, descripcion, disponibilidadActual, disponibilidadTotal } = itemData;
        const ItemRepository = AppDataSource.getRepository(Item);
        const newItem = ItemRepository.create({
            nombre: nombre,
            descripcion: descripcion,
            disponibilidadActual: disponibilidadActual, 
            disponibilidadTotal: disponibilidadTotal
        });
        const itemGuardado = await ItemRepository.save(newItem);
        return [itemGuardado, null];
    } catch (error) {
        return [null, error.message];
    }*/

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

