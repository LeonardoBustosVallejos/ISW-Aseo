"use strict";
import { Router } from "express";
import {
  getCapacitacionesController,
} from "../controllers/capacitacion.controller.js";

const router = Router();

router
  .get("/", getCapacitacionesController)

export default router;