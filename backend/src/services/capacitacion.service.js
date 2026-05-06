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
    return [capacitaciones, null];//return [itemsData, null];

    //return { success: true, data: items, message: "si" }//[itemsData, null];
  } catch (error) {
    console.error("Error al obtener las capacitaciones:", error);
    return [null, "Error interno del servidor"];
  }
}