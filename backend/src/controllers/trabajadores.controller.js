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
  getGrupoService,
  getTrabajadoresService,
  getTrabajadorService,
  recontratarTrabajadorService,
  updateTrabajadorService,
  updateGrupoService,
  deleteGrupoService
} from "../services/trabajador.service.js";
import { 
  formatDate,
  formatNacimiento
} from "../helpers/formatDate.helper.js"
import {
  calcularEdad
} from "../helpers/calcularEdad.js"
import {
 createTrabajadorBodyValidation,
 getTrabajadoresQueryValidation,
 getTrabajadorParamValidation,
 updateTrabajadorBodyValidation,
 updateTrabajadorParamValidation,
 despidoTrabajadorBodyValidation,
 despidoTrabajadorParamValidation,
 recontratarTrabajadorParamValidation,
 getGruposQueryValidation,
 updateGrupoBodyValidation,
 getGrupoParamValidation,
 createGrupoBodyValidation,
 deleteGrupoParamValidation
} from "../validations/trabajadores.validation.js"


export async function getTrabajadoresController(req, res) {
  try {
    // 1. Primero validamos con Joi para asegurar que la estructura base es correcta
    const { error, value } = getTrabajadoresQueryValidation.validate(req.query);
    if (error) return handleErrorClient(res, 400, "Parámetros de paginación inválidos", error.message);

    // 2. Tomamos el parámetro competencias de donde sea que venga para procesarlo rigurosamente
    let rawCompetencias = value.competencias || req.query.competencias;
    let competenciasFiltradas = null;

    if (rawCompetencias) {
      if (typeof rawCompetencias === 'string') {
        if (rawCompetencias.includes(',')) {
          // "1,4" -> [1, 4]
          competenciasFiltradas = rawCompetencias.split(',').map(id => parseInt(id, 10)).filter(num => !isNaN(num));
        } else if (rawCompetencias.trim() !== "") {
          // "1" -> [1]
          const parsed = parseInt(rawCompetencias, 10);
          if (!isNaN(parsed)) competenciasFiltradas = [parsed];
        }
      } else if (Array.isArray(rawCompetencias)) {
        // Por si llega como array nativo de Express ['1', '4'] -> [1, 4]
        competenciasFiltradas = rawCompetencias.map(id => parseInt(id, 10)).filter(num => !isNaN(num));
      } else if (typeof rawCompetencias === 'number') {
        competenciasFiltradas = [rawCompetencias];
      }
    }

    // 3. BLINDAJE CRUCIAL: Modificamos tanto 'value' como 'req.query' 
    // para asegurarnos de que no importe cuál lea tu "getTrabajadoresService", reciba el Array de enteros limpios.
    if (competenciasFiltradas) {
      value.competencias = competenciasFiltradas;
      req.query.competencias = competenciasFiltradas;
    } else {
      // Si está vacío o es inválido, lo removemos para evitar enviar basura a la BD
      delete value.competencias;
      delete req.query.competencias;
    }

    // 4. Llamamos al servicio pasando el objeto blindado
    const [result, errorTrabajadores] = await getTrabajadoresService(value);
    if (errorTrabajadores) return handleErrorClient(res, 404, errorTrabajadores);
    
    const responseData = result.trabajadores.map(trabajador => {
      return { ...trabajador };
    });

    const finalResponse = {
        trabajadores: responseData,
        pagination: result.pagination
    };

    return handleSuccess(res, 200, "Trabajadores encontrados", finalResponse);
  }
  catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getTrabajadorController(req, res) {
  try {

    const {error, value} = getTrabajadorParamValidation.validate(req.params);
    if(error) { 
      return handleErrorClient(res, 400, "ID inválido en la ruta", error.message)
    }
    const [trabajador, errorTrabajador] = await getTrabajadorService(value.id);

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
      if (body.competenciasIds) {
          if (typeof body.competenciasIds === 'string' && body.competenciasIds.trim() === "") {
              body.competenciasIds = []; 
          } else {
              body.competenciasIds = body.competenciasIds.split(',').map(Number);
          }
      }
      if (!body.competenciasIds) {
          body.competenciasIds = [];
      }
    const { error } = createTrabajadorBodyValidation.validate(body, { abortEarly: false });

    if(error) {
      const errorMessages = error.details.map(err => err.message).join('\n');
      return handleErrorClient(res, 404, "Error al crear un trabajador", errorMessages);
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
      competencias: created.competencias || [],
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

    const paramValidation = updateTrabajadorParamValidation.validate(req.params);
    if (paramValidation.error) {
      return handleErrorClient(res, 400, "ID inválido en la ruta", paramValidation.error.message);
    }

    const targetId = paramValidation.value.id;
    const { body } = req;

    const files = req.files || {};

    if (files.antecedentes?.[0]) {
      body.antecedentes_url = `${req.protocol}://${req.get('host')}/uploads/antecedentes/${files.antecedentes[0].filename}`;
    }

    if (files.cv?.[0]) {
      body.cv_url = `${req.protocol}://${req.get('host')}/uploads/cvs/${files.cv[0].filename}`;
    }

    if (body.competenciasIds) {
      if (typeof body.competenciasIds === "string") {
        body.competenciasIds = body.competenciasIds.split(",").map(id => parseInt(id.trim(), 10)).filter(Boolean);
      } else if (Array.isArray(body.competenciasIds)) {
        body.competenciasIds = body.competenciasIds.map(id => parseInt(id, 10)).filter(Boolean);
      }
    }
    
    const bodyValidation = updateTrabajadorBodyValidation.validate(body, { abortEarly: false });
    if (bodyValidation.error) {
      const erroresDetallados = bodyValidation.error.details.map(err => err.message).join(", ");
      return handleErrorClient(res, 400, "Parámetros del cuerpo inválidos", erroresDetallados);
    }

    const [trabajador, trabajadorError] = await updateTrabajadorService(targetId, bodyValidation.value);

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
    const paramValidation = recontratarTrabajadorParamValidation.validate(req.params);
    if (paramValidation.error) {
      return handleErrorClient(res, 400, "Id inválido en la ruta", paramValidation.error.message);
    }
    const { id } = paramValidation.value;

    const [trabajador, errorTrabajador] = await recontratarTrabajadorService(id);

    if (errorTrabajador) return handleErrorClient(res, 404, errorTrabajador);

    return (handleSuccess(res, 200, "Trabajador recontratado", trabajador));
  }
  catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function despidoTrabajadorController(req, res) {
  try {
    const paramValidation = despidoTrabajadorParamValidation.validate(req.params);
    if(paramValidation.error) {
      return handleErrorClient(res, 400, "ID inválido en la ruta", paramValidation.error.message);
    }
    
    const {id} = paramValidation.value;

    const bodyValidation = despidoTrabajadorBodyValidation.validate(req.body);
    if(bodyValidation.error){
      return handleErrorClient(res, 400, "Datos del despedido inválidos", bodyValidation.error.message);
    }

    const { motivo } = bodyValidation.value;
    
    const files = req.files || {};
    const archivo = files.archivo?.[0];
    let archivo_url = null;

    if (archivo) {
      archivo_url = `${req.protocol}://${req.get('host')}/uploads/archivos/${archivo.filename}`;
    }

    const [trabajador, errorTrabajador] = await despidoTrabajadorService(id, { 
      motivo, 
      archivo_url 
    });

    if (errorTrabajador) return handleErrorClient(res, 400, errorTrabajador);

    return handleSuccess(res, 200, "Trabajador despedido correctamente", trabajador);
  }
  catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}


export async function createGrupoController(req, res) {
  try {
    if (req.body.miembros && typeof req.body.miembros === "string") {
      try { req.body.miembros = JSON.parse(req.body.miembros); } catch (e) {}
    }

    const { error, value } = createGrupoBodyValidation.validate(req.body);
    if (error) return handleErrorClient(res, 400, "Datos de grupo inválidos", error.message);

    const [grupo, errorService] = await createGrupoService(value);

    if (errorService) {
      return handleErrorClient(res, 400, errorService);
    }

    return handleSuccess(res, 201, "Grupo creado correctamente", grupo);
  } catch(error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateGrupoController(req, res) {
  try {
    const { id } = req.params; 
    
    if (req.body.miembros && typeof req.body.miembros === "string") {
      try { req.body.miembros = JSON.parse(req.body.miembros); } catch (e) {}
    }

    const { error, value } = updateGrupoBodyValidation.validate(req.body);
    if (error) return handleErrorClient(res, 400, "Datos de actualización inválidos", error.message);

    const [grupoActualizado, errorService] = await updateGrupoService(Number(id), {
      nombre: value.nombre,
      supervisor_id: value.supervisor_id,
      miembros_ids: value.miembros,
    });

    if (errorService) {
      return handleErrorClient(res, 400, errorService);
    }

    return handleSuccess(res, 200, "Grupo actualizado correctamente", grupoActualizado);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getGruposController(req, res) {
  try {
    const { error, value } = getGruposQueryValidation.validate(req.query);
    if (error) return handleErrorClient(res, 400, "Parámetros de paginación inválidos", error.message);
    
    const [result, errorGrupos] = await getGruposService(value);
    if (errorGrupos) return handleErrorClient(res, 404, errorGrupos);
    
    const responseData = result.grupos.map(grupo => {
      return {
        ...grupo
      };
    });

    const finalResponse = {
        grupos: responseData,
        pagination: result.pagination
    };

    return handleSuccess(res, 200, "Grupos encontrados", finalResponse);
  }
  catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getGrupoController(req, res) {
  try {
    const paramValidation = getGrupoParamValidation.validate(req.params)
    if (paramValidation.error) {
      return handleErrorClient(res, 400, "ID del grupo inválido", paramValidation.error.message);
    }
    const { id } = paramValidation.value;
    
    const [grupo, error] = await getGrupoService(Number(id));
    if (error) {
      return handleErrorClient(res, 404, error);
    }
    return handleSuccess(res, 200, "Grupo encontrado", grupo);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteGrupoController(req, res) {
  try {
    const { error, value } = deleteGrupoParamValidation.validate(req.params);
    if (error) return handleErrorClient(res, 400, "ID de grupo inválido", error.message);
    
    const { id } = value;

    const [msg, errorService] = await deleteGrupoService(id);
    if (errorService) return handleErrorClient(res, 404, errorService);

    return handleSuccess(res, 200, "Grupo disuelto exitosamente", null);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}