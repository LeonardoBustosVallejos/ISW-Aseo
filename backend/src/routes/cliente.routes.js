"use strict";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { Router } from "express";
import { createSede, getClientes, registerCliente, registrarClienteJerarquico, registrarClienteYArchivo } from "../controllers/cliente.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { uploadContratoComercialService } from "../services/archivo.service.js";

const router = Router();

router
    .use(authenticateJwt)
router
    .get("/", isAdmin(['Administrador']), getClientes)
    .post("/register", isAdmin(['Administrador']), registerCliente)
    .post("/register-gerarquico", isAdmin(["Administrador"]), uploadContratoComercialService.array("documentos"), registrarClienteYArchivo)

    .post("/register/sede", isAdmin(["Administrador"]), createSede)

export default router