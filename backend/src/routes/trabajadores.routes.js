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
import { isAdmin } from "../middlewares/authorization.middleware.js";

const router = Router();

router
  .get("/", isAdmin(["Administrador"]), getTrabajadoresController)
  
  .get("/detail/grupos", isAdmin(["Administrador"]), getGruposController)
  .get("/detail/grupos/:id", isAdmin(["Administrador"]), getGrupoController)
  .patch("/detail/update/grupos/:id", isAdmin(["Administrador"]), updateGrupoController)
  .post("/create/grupos", isAdmin(["Administrador"]), createGrupoController)
  .delete("/detail/delete/grupos/:id", isAdmin(["Administrador"]), deleteGrupoController)

  .get("/detail/:id", isAdmin(["Administrador"]), getTrabajadorController)
  .patch("/detail/:id", isAdmin(["Administrador"]), uploadFiles, updateTrabajadorController)
  .patch("/detail/despedir/:id", isAdmin(["Administrador"]), uploadFiles, despidoTrabajadorController)
  .patch("/detail/recontratar/:id", isAdmin(["Administrador"]), recontratarTrabajadorController)
  .post("/create/", isAdmin(["Administrador"]), uploadFiles, createTrabajadoresController);

  export default router;