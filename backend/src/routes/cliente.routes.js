"use strict";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { Router } from "express";
import { getClientes, registerClienteSimple } from "../controllers/cliente.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";

const router = Router();

router
    .use(authenticateJwt)
router
    .get("/", isAdmin(['Administrador']), getClientes)
    .post("/register", isAdmin(['Administrador']), registerClienteSimple)

export default router