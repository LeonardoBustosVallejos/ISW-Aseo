"use strict";
import Rut  from "rutjs";
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
import { 
  formatDate,
  formatNacimiento
} from "../helpers/formatDate.helper.js"
import {
  calcularEdad
} from "../helpers/calcularEdad.js"
import {
 createTrabajadorBodyValidation
} from "../validations/trabajadores.validation.js"


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

    const responseData = {
      ...trabajador,
      nombreCompleto: `${trabajador.nombres} ${trabajador.apellidoPaterno} ${trabajador.apellidoMaterno}`,
      edad: calcularEdad(trabajador.nacimiento),
      rut: trabajador.rut ? new Rut(trabajador.rut).getNiceRut(false) : trabajador.rut,
      nacimiento: formatNacimiento(trabajador.nacimiento),
      createdAt: formatDate(trabajador.createdAt),
      updatedAt: formatDate(trabajador.updatedAt)
    }

    return (handleSuccess(res, 200, "Trabajador encontrado", responseData));
  }
  catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function createTrabajadoresController(req, res) {
  try {
    const { body } = req;

    const files = req.files || {};
      if (files.foto && files.foto[0]) {
        body.foto_url = `${req.protocol}://${req.get('host')}/uploads/fotos/${files.foto[0].filename}`;
      }
      if (files.cv && files.cv[0]) {
        body.cv_url = `${req.protocol}://${req.get('host')}/uploads/cvs/${files.cv[0].filename}`;
      }
      if (files.antecedentes && files.antecedentes[0]) {
        body.antecedentes_url = `${req.protocol}://${req.get('host')}/uploads/antecedentes/${files.antecedentes[0].filename}`;
      }
      if (body.grupo_id) {
        body.grupo_id = parseInt(body.grupo_id, 10);
      }
      if (body.despedido) {
        body.despedido = body.despedido === "true" || body.despedido === true;
      }

    const { error } = createTrabajadorBodyValidation.validate(body);

    if(error) {
      return handleErrorClient(res, 404, "Error al crear un trabajador", error.message);
    }

    const edad = calcularEdad(body.nacimiento);
    if (edad < 18) {
      return handleErrorClient(res, 400, "Error de validación", `El trabajador debe ser mayor de edad (mínimo 18 años). Actualmente tiene ${edad} años.`);
    }
    if (edad > 65) {
      return handleErrorClient(res, 400, "Error de validación", `El trabajador no puede ser jubilado (mayor de 65 años). Actualmente tiene ${edad} años.`);
    }

    const [created, err] = await createTrabajadoresService(body);
    if (err) return handleErrorServer(res, 500, err);


    const responseData = {
      ...created,
      edad: calcularEdad(created.nacimiento),
      rut: created.rut ? new Rut(created.rut).getNiceRut(false) : created.rut,
      nacimiento: formatNacimiento(created.nacimiento),
      rol: created.rol ? created.rol.nombre : null, // Asi solo devuelve el nombre
      nombreCompleto: `${created.nombres} ${created.apellidoPaterno} ${created.apellidoMaterno}`,
      createdAt: formatDate(created.createdAt), 
      updatedAt: formatDate(created.updatedAt)  
    };

    return handleSuccess(res, 201, "Trabajador creado correctamente", responseData);
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