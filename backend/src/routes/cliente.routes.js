"use strict";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { Router } from "express";
import { createSede, deleteCliente, getClientes, getInfoCliente, getInfoSede, registerCliente, registrarClienteJerarquico, registrarClienteYArchivo } from "../controllers/cliente.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { uploadContratoComercialService } from "../services/archivo.service.js";

const router = Router();

router
    .use(authenticateJwt)
router
    .get("/", isAdmin(['Administrador']), getClientes)
    //.get("/:rutCliente/", isAdmin(['Administrador']), getInfoCliente)
    .get("/:rutCliente/:cliente_id", isAdmin(['Administrador']), getInfoCliente)
    .get("/:rutCliente/sede/", isAdmin(['Administrador']), getInfoSede)
    .get("/:rutCliente/sede/:sede_id", isAdmin(['Administrador']), getInfoSede)

    .post("/register", isAdmin(['Administrador']), registerCliente)
    .post("/register-gerarquico", isAdmin(["Administrador"]), uploadContratoComercialService.fields([{ name: "anexo_pdf", maxCount: 9 }, { name: "contrato_pdf", maxCount: 10 }]), registrarClienteYArchivo)

    .post("/register/sede", isAdmin(["Administrador"]), createSede)

    .delete("/delete/:cliente_id", isAdmin(["Administrador"]), deleteCliente)

export default router