"use strict";
import { Router } from "express";
import {
  createTrabajadoresController,
  despidoTrabajadorController,
  getTrabajadorController,
  getTrabajadoresController,
  updateTrabajadorController,
} from "../controllers/trabajadores.controller.js";

const router = Router();

router
  .get("/", getTrabajadoresController)
  .get("/detail/:id", getTrabajadorController)
  .patch("/detail/:id", updateTrabajadorController)
  .patch("/detail/:id/despido", despidoTrabajadorController)
  .post("/create/", createTrabajadoresController);

export default router;