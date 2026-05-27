"use strict";
import { Router } from "express";
import {
  getCapacitacionesController,
  createCapacitacionController,
  deleteCapacitacionController,
  getCapacitacionItemController,
  getCapacitacionTrabajoController
} from "../controllers/capacitacion.controller.js";

const router = Router();

router
  .get("/", getCapacitacionesController)
  .post("/create/", createCapacitacionController)
  .delete("/delete/:id_capacitacion", deleteCapacitacionController)
  .get("/itemId/:id_item", getCapacitacionItemController)
  .get("/trabajadorId/:id_trabajador", getCapacitacionTrabajoController);
  //ruta para recuperar todas las capacitaciones de igual trabajador
  //ruta para recuperar todas las capacitaciones de igual item
  //ruta para borrar todas las capacitaciones

export default router;