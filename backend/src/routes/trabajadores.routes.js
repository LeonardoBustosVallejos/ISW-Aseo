"use strict";
import { Router } from "express";
import {
  createTrabajadoresController,
  getTrabajadorController,
  getTrabajadoresController,
} from "../controllers/trabajadores.controller.js";

const router = Router();

router
  .get("/", getTrabajadoresController)
  .get("/:id", getTrabajadorController)
  .post("/create/", createTrabajadoresController);

export default router;