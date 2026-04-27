"use strict";
import { Router } from "express";
import {
  createTrabajadoresController,
  getTrabajadorController,
  getTrabajadoresController,
  updateTrabajadorController,
} from "../controllers/trabajadores.controller.js";

const router = Router();

router
  .get("/", getTrabajadoresController)
  .get("/detail/:id", getTrabajadorController)
  .patch("/detail/:id", updateTrabajadorController)
  .post("/create/", createTrabajadoresController);

export default router;