"use strict";
import { Router } from "express";
import {
  createSolicitudController,
  deleteSolicitudController,
  getSolicitudesController,
  updateSolicitudController,
  marcarSolicitudRecibidaController
} from "../controllers/solicitud.controller.js";

const router = Router();

router
  .get("/", getSolicitudesController)
  .post("/create/", createSolicitudController)
  .patch("/:id_solicitud/recepcion",  marcarSolicitudRecibidaController)
  .put("/update/:id", updateSolicitudController)
  .delete("/delete/:id", deleteSolicitudController)

export default router;