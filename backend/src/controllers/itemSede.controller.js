"use strict";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import {
  getItemSedesService,
  createItemSedeService,
  deleteItemSedeService,
  updateItemSedeService,
} from "../services/itemSede.service.js";

export async function getItemSedesController(req, res) {
  try {
    const [itemSedes, error] = await getItemSedesService();
    if (error) return handleErrorClient(res, 404, error);
    handleSuccess(res, 200, "Item_sede encontrados", itemSedes);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

export async function createItemSedeController(req, res) {
  try {
    const { id_item, id_sede, cantidad } = req.body;
    if (!id_item || !id_sede || !cantidad) {
      return res.status(400).json({ success: false, message: "id_item, id_sede y cantidad son obligatorios" });
    }
    const [created, err] = await createItemSedeService({ id_item, id_sede, cantidad });
    if (err) return handleErrorServer(res, 500, err);
    handleSuccess(res, 201, "Item_sede creado", created);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteItemSedeController(req, res) {
  try {
    const { id } = req.params;
    const itemSedeId = parseInt(id);
    if (isNaN(itemSedeId)) {
      return res.status(400).json({ success: false, message: "ID de item_sede inválido" });
    }
    const result = await deleteItemSedeService(itemSedeId);
    if (result.success) {
      return res.status(200).json({ success: true, message: result.message });
    } else {
      return res.status(404).json({ success: false, message: result.message });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error interno de servidor", error: error.message });
  }
}

export async function updateItemSedeController(req, res) {
  try {
    const { id } = req.params;
    const { id_item, id_sede, cantidad } = req.body;
    const itemSedeId = parseInt(id);
    if (isNaN(itemSedeId)) {
      return res.status(400).json({ success: false, message: "ID de item_sede inválido" });
    }
    if (!id_item || !id_sede || !cantidad) {
      return res.status(400).json({ success: false, message: "Debe cambiarse al menos un atributo" });
    }
    const result = await updateItemSedeService(itemSedeId, { id_item, id_sede, cantidad });
    if (result.success) {
      return res.status(200).json({ success: true, data: result.data, message: result.message });
    } else {
      return res.status(200).json({ success: false, data: result.data, message: result.message });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error interno de servidor", error: error.message })
  }
}
