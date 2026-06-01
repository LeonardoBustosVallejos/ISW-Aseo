"use strict";
import { AppDataSource } from "../config/configDb.js";
import Solicitud from "../entity/solicitud.entity.js";

export async function getSolicitudesService() {
  try {
    const solicitudRepository = AppDataSource.getRepository(Solicitud);
    const solicitudes = await solicitudRepository.find();
    if (!solicitudes || solicitudes.length === 0) return [null, "No hay solicitudes"];
    console.log("hay un total de %d items", solicitudes.length);
    const solicitudesData = solicitudes.map(({ id, ...solicitud }) => solicitud);
    return [solicitudes, null];
  } catch (error) {
    console.error("Error al obtener solicitudes:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function createSolicitudService(solicitudData) {
  try {
    const { cantidad_solicitud, id_item_solicitud, id_solicitante, id_administrador_solicitud, id_sede_solicitud, detalle_solicitud, estado_solicitud } = solicitudData;
    const SolicitudRepository = AppDataSource.getRepository(Solicitud);
    const newSolicitud = SolicitudRepository.create({
      cantidad_solicitud: cantidad_solicitud,
      id_item_solicitud: id_item_solicitud,
      id_solicitante: id_solicitante,
      id_administrador_solicitud: id_administrador_solicitud,
      id_sede_solicitud: id_sede_solicitud,
      detalle_solicitud: detalle_solicitud,
      estado_solicitud: estado_solicitud
    });
    const solicitudGuardada = await SolicitudRepository.save(newSolicitud);
    return [solicitudGuardada, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function deleteSolicitudService(id) {
  try {
    const SolicitudRepository = AppDataSource.getRepository(Solicitud);
    const result = await SolicitudRepository.delete(id);
    if (result.affected === 0) {
      return { success: false, message: "No existe una solicitud con esa id" };
    }
    return { success: true, message: "Solicitud borrado exitósamente" };
  } catch (error) {
    return { success: false, message: "Error borrando solicitud", error: error.message };
  }
}

export async function updateSolicitudService(id, updateData) {
  try {
    const SolicitudRepository = AppDataSource.getRepository(Solicitud);
    const solicitud = await SolicitudRepository.findOne({ where: { id_solicitud: id } });
    if (!solicitud) return { success: false, message: "Solicitud no encontrada" };
    solicitud.cantidad_solicitud = updateData.cantidad_solicitud;
    solicitud.id_item_solicitud = updateData.id_item_solicitud;
    solicitud.id_solicitante = updateData.id_solicitante;
    solicitud.id_administrador_solicitud = updateData.id_administrador_solicitud;
    solicitud.id_sede_solicitud = updateData.id_sede_solicitud;
    solicitud.detalle_solicitud = updateData.detalle_solicitud;
    solicitud.estado_solicitud = updateData.estado_solicitud;
    const updatedSolicitud = await SolicitudRepository.save(solicitud);
    return { success: true, data: updatedSolicitud, message: "Solicitud actualizada exitósamente" };
  } catch (error) {
    return { success: false, message: "Error actualizando solicitud", error: error.message };
  }
}