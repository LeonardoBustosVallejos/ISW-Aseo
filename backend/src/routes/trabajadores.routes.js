"use strict";
import { Router } from "express";
import { uploadFiles } from "../middlewares/multer.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
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
import { authorizeRoles } from "../middlewares/authorization.middleware.js";

const router = Router();

router
  .use(authenticateJwt)
  
  .get("/", authorizeRoles(["Administrador"]), getTrabajadoresController)
  
  .get("/detail/grupos", authorizeRoles(["Administrador"]), getGruposController)
  .get("/detail/grupos/:id", authorizeRoles(["Administrador"]), getGrupoController)
  .patch("/detail/update/grupos/:id", authorizeRoles(["Administrador"]), updateGrupoController)
  .post("/create/grupos", authorizeRoles(["Administrador"]), createGrupoController)
  .delete("/detail/delete/grupos/:id", authorizeRoles(["Administrador"]), deleteGrupoController)

  .get("/detail/:id", authorizeRoles(["Administrador"]), getTrabajadorController)
  .patch("/detail/:id", authorizeRoles(["Administrador"]), uploadFiles, updateTrabajadorController)
  .patch("/detail/despedir/:id", authorizeRoles(["Administrador"]), uploadFiles, despidoTrabajadorController)
  .patch("/detail/recontratar/:id", authorizeRoles(["Administrador"]), recontratarTrabajadorController)
  .post("/create/", authorizeRoles(["Administrador"]), uploadFiles, createTrabajadoresController);

  export default router;