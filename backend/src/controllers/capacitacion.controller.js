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
} from "../services/capacitacion.service.js";
import { AppDataSource } from "../config/configDb.js";
import Capacitacion from "../entity/capacitacion.entity.js";

export async function getCapacitacionesController(req, res) {
        try {
            const [capacitaciones, error] = await getCapacitacionesService();
            
            if (error) return handleErrorClient(res, 404, error);
            
            handleSuccess(res, 200, "Items encontrados", capacitaciones);

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