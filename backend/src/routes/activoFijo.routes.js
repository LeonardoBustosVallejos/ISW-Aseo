"use strict";
import { Router } from "express";
import { getResumenActivos, crearActivoFijo, devolverActivos, asignarActivos } from "../controllers/activoFijo.controller.js";
import { getHistorial } from "../controllers/movimiento.controller.js";

const router = Router();

router
    .get("/cliente/:cliente_id/resumen", getResumenActivos)
    .get("/cliente/:cliente_id/historial", getHistorial)
    .post("/", crearActivoFijo)
    .patch("/asignar", asignarActivos)
    .patch("/devolver", devolverActivos);
    

export default router;