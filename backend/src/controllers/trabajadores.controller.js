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
  getTrabajadoresService,
  getTrabajadorService,
  updateTrabajadorService,
} from "../services/trabajador.service.js";


export async function getTrabajadoresController(req, res) {
  try {

    const [trabajadores, errorTrabajadores] = await getTrabajadoresService();

    if (errorTrabajadores) return handleErrorClient(res, 404, errorTrabajadores);
    
    return (handleSuccess(res, 200, "Trabajadores encontrados", trabajadores));
  }
  catch(error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getTrabajadorController(req, res) {
  try {

    const { id } = req.params;
    const [trabajador, errorTrabajador] = await getTrabajadorService(id);

    if (errorTrabajador) return handleErrorClient(res, 404, errorTrabajador);
    
    return (handleSuccess(res, 200, "Trabajador encontrado", trabajador));
  }
  catch(error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function createTrabajadoresController(req, res) {
  try {
    const { nombreCompleto, 
            nacimiento, 
            rut, 
            email, 
            rol, 
            sexo,
            competencias } = req.body;
    const [created, err] = await createTrabajadoresService({ 
            nombreCompleto, 
            nacimiento, 
            rut, 
            email, 
            rol, 
            sexo,
            competencias });
    if (err) return handleErrorServer(res, 500, err);
    
    return handleSuccess(res, 201, "Trabajador creado correctamente", created);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}


export async function updateTrabajadorController(req, res) {
  try {

    const { id } = req.params;
    const { body } = req;

    const [trabajador, trabajadorError] = await updateTrabajadorService(id, body);
    
    if (trabajadorError) {
      return handleErrorClient(res, 400, "Error modificando al trabajador", trabajadorError);
    }
    return (handleSuccess(res, 200, "Trabajador modificado correctamente", trabajador));
  }
  catch(error) {
    handleErrorServer(res, 500, error.message);
  }
}
