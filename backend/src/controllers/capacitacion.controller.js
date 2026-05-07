"use strict";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import {
  authValidation,
  registerValidation,
} from "../validations/auth.validation.js";
import {
    getCapacitacionesService,
    createCapacitacionService,
    deleteCapacitacionService
} from "../services/capacitacion.service.js";
import { AppDataSource } from "../config/configDb.js";
import Capacitacion from "../entity/capacitacion.entity.js";

export async function getCapacitacionesController(req, res) {
    try {
        const [capacitaciones, error] = await getCapacitacionesService();
        if (error) return handleErrorClient(res, 404, error);
        handleSuccess(res, 200, "Capacitaciones encontradas", capacitaciones);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

export async function createCapacitacionController(req, res) {
  try {
    const { id_item, id_trabajador } = req.body;
    const [created, err] = await createCapacitacionService({ id_item, id_trabajador });
    if (err) return handleErrorServer(res, 500, err);
    handleSuccess(res, 201, "Capacitacion creada", created);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteCapacitacionController(req, res) {
  const CapacitacionRepository = AppDataSource.getRepository(Capacitacion);
  try {
    const { id_capacitacion } = req.params;
    console.log("ver1");
    if (isNaN(id_capacitacion)) {
      console.log("el id es %d", id_capacitacion);
      return res.status(400).json({ success: false, message: "ID de capacitación inválido"});
    }
    console.log("ver2");
    const result = await deleteCapacitacionService(id_capacitacion);
    if (result.success) {
      return res.status(200).json({ success: true, message: result.message });
    } else {
      return res.status(404).json({ success: false, message: result.message });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error interno de servidor", error: error.message });
  }
}