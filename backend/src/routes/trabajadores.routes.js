"use strict";
import { Router } from "express";
import { uploadFiles } from "../middlewares/multer.middleware.js";
import {
  createGrupoController,
  createTrabajadoresController,
  despidoTrabajadorController,
  getGruposController,
  getGrupoController,
  getTrabajadorController,
  getTrabajadoresController,
  recontratarTrabajadorController,
  updateTrabajadorController,
  updateGrupoController,
  deleteGrupoController
} from "../controllers/trabajadores.controller.js";

const router = Router();

router
  .get("/", getTrabajadoresController)
  
  .get("/detail/grupos", getGruposController)
  .get("/detail/grupos/:id", getGrupoController)
  .patch("/detail/update/grupos/:id", updateGrupoController)
  .post("/create/grupos", createGrupoController)
  .delete("/detail/delete/grupos/:id", deleteGrupoController)

  .get("/detail/:id", getTrabajadorController)
  .patch("/detail/:id", uploadFiles, updateTrabajadorController)
  .patch("/detail/despedir/:id", uploadFiles, despidoTrabajadorController)
  .patch("/detail/recontratar/:id", recontratarTrabajadorController)
  .post("/create/", uploadFiles, createTrabajadoresController);

  export default router;