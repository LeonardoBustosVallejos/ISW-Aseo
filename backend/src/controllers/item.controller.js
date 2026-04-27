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
import { createItemService,
        getItemsService
} from "../services/item.service.js";

/*
export async function getItemsController(req, res) {
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
*/

export async function getItemsController(req, res) {
        try {
            const [items, error] = await getItemsService();
            
            if (error) return handleErrorClient(res, 404, error);
            
            handleSuccess(res, 200, "Items encontrados", items);

            /*
            if (result.success) {
                return res.status(200).json({
                    success: true,
                    data: result.data,
                    message: result.message
                });
            } else {
                return res.status(500).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }
            */

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
}

export async function createItemController(req, res) {
  try {
    const { nombre, descripcion, disponibilidadActual, disponibilidadTotal } = req.body;
    const [created, err] = await createItemService({ nombre, descripcion, disponibilidadActual, disponibilidadTotal });
    if (err) return handleErrorServer(res, 500, err);

  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}