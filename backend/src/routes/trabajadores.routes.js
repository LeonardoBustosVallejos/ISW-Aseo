"use strict";
import { Router } from "express";
import {
  createTrabajadoresController,
  despidoTrabajadorController,
  getTrabajadorController,
  getTrabajadoresController,
  recontratarTrabajadorController,
  updateTrabajadorController,
} from "../controllers/trabajadores.controller.js";

const router = Router();

router
  .get("/", getTrabajadoresController)
  .get("/detail/:id", getTrabajadorController)
  .patch("/detail/:id", updateTrabajadorController)
  .patch("/detail/:id/despedir", despidoTrabajadorController)
  .patch("/detail/:id/recontratar", recontratarTrabajadorController)
  .post("/create/", createTrabajadoresController);

export default router;