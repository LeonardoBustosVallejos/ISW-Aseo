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

export default router;