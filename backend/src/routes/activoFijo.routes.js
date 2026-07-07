"use strict";
import { Router } from "express";
import { getResumenActivos, crearActivoFijo, devolverActivos, asignarActivos, getActivosPorSede, getFechaContratoCliente } from "../controllers/activoFijo.controller.js";
import { confirmarRecepcion, getHistorial } from "../controllers/movimiento.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
const router = Router();

router
    .get("/resumen", authenticateJwt, getResumenActivos)
    .get("/sede/:sede_id/historial", authenticateJwt, getHistorial)
    .post("/", authenticateJwt, crearActivoFijo)
    .patch("/asignar", authenticateJwt, asignarActivos)
    .patch("/devolver", authenticateJwt, devolverActivos)
    .get("/sede/:sedeId", authenticateJwt, getActivosPorSede)
    .patch("/confirmar", authenticateJwt, confirmarRecepcion)
    .get("/fecha/:id", getFechaContratoCliente);

export default router;