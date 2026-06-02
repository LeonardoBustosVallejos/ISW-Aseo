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
  createGrupoService,
  createTrabajadoresService,
  despidoTrabajadorService,
  getGruposService,
  getTrabajadoresService,
  getTrabajadorService,
  recontratarTrabajadorService,
  updateTrabajadorService,
} from "../services/trabajador.service.js";


export async function getTrabajadoresController(req, res) {
  try {

    const [trabajadores, errorTrabajadores] = await getTrabajadoresService();

    if (errorTrabajadores) return handleErrorClient(res, 404, errorTrabajadores);

    return (handleSuccess(res, 200, "Trabajadores encontrados", trabajadores));
  }
  catch (error) {
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
  catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function createTrabajadoresController(req, res) {
  try {
    const {
      nombreCompleto,
      nacimiento,
      rut,
      email,
      grupo_id,
      rol,
      sexo,
      competencias,
      despedido,
    } = req.body;

  const files = req.files || {};
  const foto = files.foto?.[0];
  const cv = files.cv?.[0];
  const antecedentes = files.antecedentes?.[0];

  const payload = {
    nombreCompleto,
    nacimiento,
    rut,
    email,
    grupo_id,
    rol,
    sexo,
    competencias,
    despedido,

    foto: foto
    ? {
      original: foto.originalname,
      archivo: foto.filename,
      ruta: foto.path,
      mime: foto.mimetype,
      peso: foto.size,
    } : null,
    cv: cv
    ? {
      original: cv.originalname,
      archivo: cv.filename,
      ruta: cv.path,
      mime: cv.mimetype,
      peso: cv.size,
    } : null,
    antecedentes: antecedentes
    ? {
      original: antecedentes.originalname,
      archivo: antecedentes.filename,
      ruta: antecedentes.path,
      mime: antecedentes.mimetype,
      peso: antecedentes.size,
    } : null
  };

    const [created, err] = await createTrabajadoresService(payload);
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

    const files = req.files || {};
    const foto = files.foto?.[0];
    const cv = files.cv?.[0];
    const antecedentes = files.antecedentes?.[0];

    const payload = {
      ...body,

      foto: foto
      ? {
        original: foto.originalname,
        archivo: foto.filename,
        ruta: foto.path,
        mime: foto.mimetype,
        peso: foto.size,
      } : null,
      cv: cv
      ? {
        original: cv.originalname,
        archivo: cv.filename,
        ruta: cv.path,
        mime: cv.mimetype,
        peso: cv.size,
      } : null,
      antecedentes : antecedentes
      ? {
        original: antecedentes.originalname,
        archivo: antecedentes.filename,
        ruta: antecedentes.path,
        mime: antecedentes.mimetype,
        peso: antecedentes.size,
      } : null,
    };

    const [trabajador, trabajadorError] = await updateTrabajadorService(id, payload);

    if (trabajadorError) {
      return handleErrorClient(res, 400, "Error modificando al trabajador", trabajadorError);
    }
    return (handleSuccess(res, 200, "Trabajador modificado correctamente", trabajador));
  }
  catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function recontratarTrabajadorController(req, res) {
  try {
    const { id } = req.params;
    const { despedido } = req.body;

    const [trabajador, errorTrabajador] = await recontratarTrabajadorService(id, despedido);

    if (errorTrabajador) return handleErrorClient(res, 404, errorTrabajador);

    return (handleSuccess(res, 200, "Trabajador recontratado", trabajador));
  }
  catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function despidoTrabajadorController(req, res) {
  try {
    const { id } = req.params;
    const { despedido } = req.body;
    const { motivo } = req.body;
    
    const files = req.files || {};
    //const archivo = req.files.archivo?.[0];
    const archivo = files.archivo?.[0];
    const payload = {
      despedido,
      motivo,

      archivo: archivo
      ? {
        original: archivo.originalname,
        archivo: archivo.filename,
        ruta: archivo.path,
        mime: archivo.mimetype,
        peso: archivo.size,
      } : null,
    }

    const [trabajador, errorTrabajador] = await despidoTrabajadorService(id, payload);

    if (errorTrabajador) return handleErrorClient(res, 404, errorTrabajador);

    return (handleSuccess(res, 200, "Trabajador despedido", trabajador));
  }
  catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function createGrupoController(req, res) {
  try {
    const {
      nombre,
      sede_id,
      supervisor_id,
      miembros
    } = req.body;

    const miembros_ids = Array.isArray(miembros)
    ? miembros
    : typeof miembros === "string"
      ? JSON.parse(miembros)
      : [];

    const [grupo, error] = await createGrupoService({
      nombre,
      sede_id,
      supervisor_id,
      miembros_ids,
    });

    if (error) {
      return handleErrorClient(res, 400, error);
    }

    return handleSuccess(res, 201, "Grupo creado correctamente", grupo);
  } catch(error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getGruposController(req, res) {
  try {
    const [grupos, error] = await getGruposService();
    if (error) return handleErrorClient(res, 404, error);
    return handleSuccess(res, 200, "Grupos encontrados", grupos);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}