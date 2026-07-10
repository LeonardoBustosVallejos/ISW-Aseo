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
  getSolicitudesService,
  createSolicitudService,
  deleteSolicitudService,
  updateSolicitudService,
  confirmarRecepcionBooleanoService
} from "../services/solicitud.service.js";
import { AppDataSource } from "../config/configDb.js";
import Solicitud from "../entity/solicitud.entity.js";

export async function getSolicitudesController(req, res) {
  try {
    const [solicitudes, error] = await getSolicitudesService();
    if (error) return handleErrorClient(res, 404, error);
    handleSuccess(res, 200, "Solicitudes encontradas", solicitudes);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

export async function createSolicitudController(req, res) {
  try {

    const { cantidad_solicitud, id_item_solicitud, id_solicitante, id_administrador_solicitud, id_sede_solicitud, detalle_solicitud, estado_solicitud } = req.body;
    const [created, err] = await createSolicitudService({ cantidad_solicitud, id_item_solicitud, id_solicitante, id_administrador_solicitud, id_sede_solicitud, detalle_solicitud, estado_solicitud });
    if (err) return handleErrorServer(res, 500, err);
    handleSuccess(res, 201, "Items creado", created);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteSolicitudController(req, res) {
  const SolicitudRepository = AppDataSource.getRepository(Solicitud);
  try {
    const { id } = req.params;
    const solicitudId = parseInt(id);
    if (isNaN(solicitudId)) {
      return res.status(400).json({ success: false, message: "ID de solicitud inválido"});
    }
    const result = await deleteSolicitudService(solicitudId);
    if (result.success) {
      return res.status(200).json({ success: true, message: result.message });
    } else {
      return res.status(404).json({ success: false, message: result.message });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error interno de servidor", error: error.message });
  }
}

export async function updateSolicitudController(req, res) {
  try {
    const { id } = req.params;
    const { cantidad_solicitud, id_item_solicitud, id_solicitante, id_administrador_solicitud, id_sede_solicitud, detalle_solicitud, estado_solicitud } = req.body;
    const solicitudId = parseInt(id);
    if (isNaN(solicitudId)) {
      return res.status(400).json({ success: false, message: "ID de solicitud inválida"});
    }
    const result = await updateSolicitudService(solicitudId, { cantidad_solicitud, id_item_solicitud, id_solicitante, id_administrador_solicitud, id_sede_solicitud, detalle_solicitud, estado_solicitud });
    if (result.success) {
      return res.status(200).json({ success: true, data: result.data, message: result.message });
    } else {
      return res.status(200).json({ success: false, data: result.data, message: result.message });
    }
  } catch(error) {
    return res.status(500).json({ success: false, message: "Error interno de servidor", error: error.message})
  }
}

export async function marcarSolicitudRecibidaController(req, res) {
  try {
    const { id_solicitud } = req.params;
    const [solicitud, error] = await confirmarRecepcionBooleanoService(id_solicitud);

    if (error) return handleErrorClient(res, 404, error);
    return handleSuccess(res, 200, "Recepción marcada como true exitosamente.", solicitud);
  } catch (error) {
    return handleErrorServer(res, 500, error.message);
  }
}