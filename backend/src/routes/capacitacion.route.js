"use strict";
import { Router } from "express";
import {
  getCapacitacionesController,
  createCapacitacionController,
  deleteCapacitacionController
} from "../controllers/capacitacion.controller.js";

const router = Router();

router
  .get("/", getCapacitacionesController)
  .post("/create/", createCapacitacionController)
  .delete("/delete/:id_capacitacion", deleteCapacitacionController);
  //ruta para recuperar todas las capacitaciones de igual trabajador
  //ruta para recuperar todas las capacitaciones de igual item
  //ruta para borrar todas las capacitaciones

export default router;