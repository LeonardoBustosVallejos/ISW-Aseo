"use strict";
import { Router } from "express";
import { getResumenActivos, crearActivoFijo, devolverActivos, asignarActivos } from "../controllers/activoFijo.controller.js";
import { confirmarRecepcion, getHistorial } from "../controllers/movimiento.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";

const router = Router();

router
    .get("/resumen", authenticateJwt, getResumenActivos)
    .get("/cliente/:cliente_id/historial", authenticateJwt, getHistorial)
    .post("/", authenticateJwt, crearActivoFijo)
    .patch("/asignar", authenticateJwt, asignarActivos)
    .patch("/devolver", authenticateJwt, devolverActivos)
    .patch("/confirmar", authenticateJwt, confirmarRecepcion);
    

export default router;