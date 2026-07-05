import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { uploadContratoComercialService } from "../services/archivo.service.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { getVistaContratosComerciales } from "../controllers/contrato.controller.js";

const router = Router();

router
    .use(authenticateJwt)
router
    .get('/', isAdmin(['Administrador']), getVistaContratosComerciales)

export default router 