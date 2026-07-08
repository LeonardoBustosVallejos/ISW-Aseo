import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";
import { createAnexoController, createContratoYArchivo, getVistaContratosComerciales } from "../controllers/contrato.controller.js";
import { uploadAnexoService } from "../services/archivo.service.js";

const router = Router();

router
    .use(authenticateJwt)
router
    .get('/', authorizeRoles(['Administrador']), getVistaContratosComerciales)

    .post('/upload/contrato/:cliente_id', authorizeRoles(['Administrador']), uploadAnexoService.fields([{ name: "contrato_pdf", maxCount: 9 }]), createContratoYArchivo)
    .post('/upload/anexo/:id_contrato', authorizeRoles(['Administrador']), uploadAnexoService.fields([{ name: "anexo_pdf", maxCount: 9 }]), createAnexoController)

export default router 