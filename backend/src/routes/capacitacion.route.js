"use strict";
import { Router } from "express";
import {
  getCapacitacionesController,
  createCapacitacionController
} from "../controllers/capacitacion.controller.js";

const router = Router();

router
  .get("/", getCapacitacionesController)
  .post("/create/", createCapacitacionController);

export default router;