"use strict";
import { Router } from "express";
import { getResumenActivos, crearActivoFijo, devolverActivos, asignarActivos } from "../controllers/activoFijo.controller.js";

const router = Router();

router
    .get("/cliente/:cliente_id/resumen", getResumenActivos)
    .post("/", crearActivoFijo)
    .patch("/asignar", asignarActivos)
    .patch("/devolver", devolverActivos);

export default router;