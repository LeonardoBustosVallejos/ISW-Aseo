"use strict";
import { Router } from "express";
import {
  createSolicitudController,
  deleteSolicitudController,
  getSolicitudesController,
  updateSolicitudController,
} from "../controllers/solicitud.controller.js";

const router = Router();

router
  .get("/", getSolicitudesController)
  .post("/create/", createSolicitudController)
  .put("/update/:id", updateSolicitudController)
  .delete("/delete/:id", deleteSolicitudController)

export default router;