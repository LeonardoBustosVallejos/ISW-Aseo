"use strict";
import { Router } from "express";
import { uploadFiles } from "../middlewares/multer.middleware.js";
import {
  createGrupoController,
  createTrabajadoresController,
  despidoTrabajadorController,
  getGruposController,
  getTrabajadorController,
  getTrabajadoresController,
  recontratarTrabajadorController,
  updateTrabajadorController,
} from "../controllers/trabajadores.controller.js";

const router = Router();

router
  .get("/", getTrabajadoresController)
  .get("/detail/:id", getTrabajadorController)
  .get("/grupos", getGruposController)
  .patch("/detail/:id", uploadFiles, updateTrabajadorController)
  .patch("/detail/:id/despedir", uploadFiles, despidoTrabajadorController)
  .patch("/detail/:id/recontratar", recontratarTrabajadorController)
  .post("/create/", uploadFiles, createTrabajadoresController)
  .post("/create/grupos", createGrupoController);
export default router;