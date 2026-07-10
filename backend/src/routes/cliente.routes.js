"use strict";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";
import { Router } from "express";
import { createSede, deleteCliente, getClientes, getInfoCliente, getInfoSede, getSedes, registerCliente, registerContactos, registrarClienteJerarquico, registrarClienteYArchivo, updateContactos, updateSede } from "../controllers/cliente.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { uploadContratoComercialService } from "../services/archivo.service.js";

const router = Router();

router
    .use(authenticateJwt)
router
    .post('/register/contactos/:sede_id', authorizeRoles(['Administrador']), registerContactos)
    .patch('/update/contactos', authorizeRoles(['Administrador']), updateContactos)
    .get('/sedes', getSedes)




    .post('/sedes/add/:clienteId', authorizeRoles(['Administrador']))
    .patch('/update/sede/:sede_id', authorizeRoles(['Administrador']), updateSede)




    //clientes
    .get("/", authorizeRoles(['Administrador']), getClientes)
    //.get("/:rutCliente/", authorizeRoles(['Administrador']), getInfoCliente)
    .get("/:rutCliente/:cliente_id", authorizeRoles(['Administrador']), getInfoCliente)
    .get("/:rutCliente/sede/", authorizeRoles(['Administrador']), getInfoSede)
    .get("/:rutCliente/sede/:sede_id", authorizeRoles(['Administrador']), getInfoSede)

    .post("/register", authorizeRoles(['Administrador']), registerCliente)
    .post("/register-gerarquico", authorizeRoles(["Administrador"]), uploadContratoComercialService.fields([{ name: "anexo_pdf", maxCount: 9 }, { name: "contrato_pdf", maxCount: 10 }]), registrarClienteYArchivo)

    .post("/register/sede", authorizeRoles(["Administrador"]), createSede)

    .delete("/delete/:cliente_id", authorizeRoles(["Administrador"]), deleteCliente)

export default router