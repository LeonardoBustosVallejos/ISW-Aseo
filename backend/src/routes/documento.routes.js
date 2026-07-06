import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { downloadDocumento } from "../controllers/documentos.controller.js";

const router = Router();

router
    .use(authenticateJwt)
router
    .get('/:id_documento/download', isAdmin(['Administrador']), downloadDocumento)

export default router 