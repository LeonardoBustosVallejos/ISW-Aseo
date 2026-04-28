"use strict";
import { Router } from "express";
import { getResumenActivos, crearActivoFijo } from "../controllers/activoFijo.controller.js";

const router = Router();

router
    .get("/cliente/:clienteId/resumen", getResumenActivos)
    .post("/", crearActivoFijo);

export default router;