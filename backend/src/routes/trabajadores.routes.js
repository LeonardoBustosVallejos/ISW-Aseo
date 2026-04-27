"use strict";
import { Router } from "express";
import {
  createTrabajadoresController,
  getTrabajadoresController
} from "../controllers/trabajadores.controller.js";

const router = Router();

router
  .get("/", getTrabajadoresController)
  .post("/create/", createTrabajadoresController);

export default router;