"use strict";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import {
  authValidation,
  registerValidation,
} from "../validations/auth.validation.js";
import {
  createTrabajadoresService,
  getTrabajadoresService
} from "../services/trabajador.service.js";



export async function createTrabajadoresController(req, res) {
  try {
    const { nombreCompleto, 
            nacimiento, 
            rut, 
            email, 
            rol, 
            competencias } = req.body;
    const [created, err] = await createTrabajadoresService({ 
            nombreCompleto, 
            nacimiento, 
            rut, 
            email, 
            rol, 
            competencias });
    if (err) return handleErrorServer(res, 500, err);
    
    return handleSuccess(res, 201, "Trabajador creado correctamente", created);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
