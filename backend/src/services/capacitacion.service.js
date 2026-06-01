"use strict";
import { AppDataSource } from "../config/configDb.js";
import Capacitacion from "../entity/capacitacion.entity.js";

export async function getCapacitacionesService() {
  try {
    const capacitacionRepository = AppDataSource.getRepository(Capacitacion);

    const capacitaciones = await capacitacionRepository.find();

    if (!capacitaciones || capacitaciones.length === 0) return [null, "No hay capacitaciones"];
    console.log("hay un total de %d capacitaciones", capacitaciones.length);
    const capacitacionesData = capacitaciones.map(({ id_capacitacion, ...capacitacion }) => capacitacion);
    return [capacitaciones, null];
  } catch (error) {
    console.error("Error al obtener las capacitaciones:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function createCapacitacionService(capacitacionData) {
  try {
    const { id_item, id_trabajador } = capacitacionData;
    const CapacitacionRepository = AppDataSource.getRepository(Capacitacion);
    const newCapacitacion = CapacitacionRepository.create({
      id_item: id_item,
      id_trabajador: id_trabajador
    });
    const capacitacionGuardado = await CapacitacionRepository.save(newCapacitacion);
    return [capacitacionGuardado, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function deleteCapacitacionService(id_capacitacion) {
  try {
    const CapacitacionRepository = AppDataSource.getRepository(Capacitacion);
    const result = await CapacitacionRepository.delete(id_capacitacion);
    if (result.affected === 0) {
      return { success: true, message: "No existe una capacitacion con esa ID"};
    }
    return { success: true, message: "Capacitacion borrada exitósamente" };
  } catch (error) {
    return { success: false, message: "Error borrando capacitacion", error: error.message };
  }
}

export async function getCapacitacionItemService(id_item) {
  const capacitacionRepository = AppDataSource.getRepository(Capacitacion);
  try {
    if (id_item === undefined || id_item === null) {
      const capacitaciones = await capacitacionRepository.find();
      return { success: true, data: capacitaciones, message: "Capacitaciones recuperadas exitósamente"};
    }
    const capacitaciones = await capacitacionRepository.find({ where: { id_item: parseInt(id_item) } });
    return { success: true, data: capacitaciones, message: "Capacitaciones recuperadas exitósamente"};
  } catch (error) {
    return { success: false, message: "Error recuperando capacitaciones", error: error.message };
  }
}

export async function getCapacitacionTrabajoService(id_trabajador) {
  const capacitacionRepository = AppDataSource.getRepository(Capacitacion);
  try {
    if (id_trabajador === undefined || id_trabajador === null) {
      const capacitaciones = await capacitacionRepository.find();
      return { success: true, data: capacitaciones, message: "Capacitaciones recuperadas exitósamente"};
    }
    const capacitaciones = await capacitacionRepository.find({ where: { id_item: parseInt(id_trabajador) } });
    return { success: true, data: capacitaciones, message: "Capacitaciones recuperadas exitósamente"};
  } catch (error) {
    return { success: false, message: "Error recuperando capacitaciones", error: error.message };
  }
}