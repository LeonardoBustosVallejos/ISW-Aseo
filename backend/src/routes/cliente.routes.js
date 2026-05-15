"use strict";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { Router } from "express";
import { createSede, getClientes, getInfoCliente, getInfoSede, registerCliente, registrarClienteJerarquico, registrarClienteYArchivo } from "../controllers/cliente.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { uploadContratoComercialService } from "../services/archivo.service.js";

const router = Router();

router
    .use(authenticateJwt)
router
    .get("/", isAdmin(['Administrador']), getClientes)
    .get("/:rutCliente", isAdmin(['Administrador']), getInfoCliente)
    .get("/:rutCliente/:sede_id", isAdmin(['Administrador']), getInfoSede)

    .post("/register", isAdmin(['Administrador']), registerCliente)
    .post("/register-gerarquico", isAdmin(["Administrador"]), uploadContratoComercialService.array("documentos"), registrarClienteYArchivo)

    .post("/register/sede", isAdmin(["Administrador"]), createSede)

export default router