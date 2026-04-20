"use strict";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import { getItemsService } from "../services/item.service.js";

export async function getItems(req, res) {
  try {
    const [items, errorItems] = await getItemsService();

    if (errorItems) return handleErrorClient(res, 404, errorItems);

    items.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Items encontrados", items);
  } catch (error) {
    handleErrorServer(
      res,
      500,
      error.message,
    );
  }
}

export async function createItem(req, res) {
  try {
    const { nombre } = req.body;
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Es necesario que el item tenga un nombre no vacío"
      });
    }            
    const id = req.user && req.user.id ? req.user.id : undefined;
    const result = await ItemService.createSubject({ nombre, id });
    if (result.success) {
      return res.status(201).json({
        success: true,
        data: result.data,
        message: result.message
    });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message,
        error: process.env.NODE_ENV === 'development' ? result.error : undefined
      });
    }
    } catch (error) {
      console.error("[ERROR Controller] Error inesperado:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
}