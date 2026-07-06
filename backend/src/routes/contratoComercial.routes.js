import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { createAnexoController, createContratoYArchivo, getVistaContratosComerciales } from "../controllers/contrato.controller.js";
import { uploadAnexoService } from "../services/archivo.service.js";

const router = Router();

router
    .use(authenticateJwt)
router
    .get('/', isAdmin(['Administrador']), getVistaContratosComerciales)

    .post('/upload/contrato/:cliente_id', isAdmin(['Administrador']), uploadAnexoService.fields([{ name: "contrato_pdf", maxCount: 9 }]), createContratoYArchivo)
    .post('/upload/anexo/:id_contrato', isAdmin(['Administrador']), uploadAnexoService.fields([{ name: "anexo_pdf", maxCount: 9 }]), createAnexoController)

export default router 