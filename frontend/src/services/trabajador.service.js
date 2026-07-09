import axios from "./root.service.js";

/** 
 *  Obtiene todos los trabajadores
 * @returns { Promise } Lista de trabajadores
 */

 export const getTrabajadores = async ({
  page = 1,
  search = "",
  limit = 10,
  sexo = "",
  edadMin = "",
  edadMax = "",
  rol = "",
  competencias = [], 
  estado = "activos"
} = {}) => {
  try {
    const params = {
      page,
      limit,
      estado
    };

    if (search?.trim()) params.search = search.trim();
    if (sexo) params.sexo = sexo;
    if (rol) params.rol = rol;
    
    if (edadMin !== "" && edadMin !== null && edadMin !== undefined) params.edadMin = Number(edadMin);
    if (edadMax !== "" && edadMax !== null && edadMax !== undefined) params.edadMax = Number(edadMax);

    if (competencias) {
      if (Array.isArray(competencias)) {
        if (competencias.length > 0) {
          params.competencias = competencias.join(","); 
        }
      } else if (typeof competencias === "string" && competencias.trim() !== "") {
        params.competencias = competencias;
      }
    }

    const response = await axios.get("/trabajadores", {
      params: params,
      paramsSerializer: {
        indexes: null
      }
    });

    return {
      succes: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    console.error("Error al obtener trabajadores", error);
    return {
      succes: false,
      message: error.response?.data?.message || "Error al obtener trabajadores",
      data: []
    };
  }
};

export async function getTrabajadorById(id) {
  try {
    const response = await axios.get(`/trabajadores/detail/${id}`); 
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al obtener el detalle"
    };
  }
}

export async function updateTrabajador (id, body) {
  try {
    const response = await axios.patch(`/trabajadores/detail/${id}`, body);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al actualizar"
    };
  }
}

/**
 * Registra un nuevo trabajador enviando texto y archivos binarios
 * @param {FormData} formData 
 */
export async function createTrabajador(formData) {
  try {
    const res = await axios.post("/trabajadores/create", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return { 
          success: true, 
          data: res.data };
  } catch (error) {
    console.error("Error en servicio createTrabajador:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || "Error al intentar crear el trabajador." 
    };
  }
}

/**
 * Envía el formulario de despido (motivo y archivo) a la API
 * @param {string} id - ID del trabajador
 * @param {FormData} formData - Datos empaquetados del despido
 */

export async function despedirTrabajador(id, formData) {
  try {
    const response = await axios.patch(`/trabajadores/detail/despedir/${id}`,
          formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
    return { 
          success: true, 
          data: response.data.data,
          message: response.data.message };
  } catch(error){
    return {
      success: false,
      message: error.response?.data?.message || "Error al despedir el trabajador."
    };
  }
}

/**
 * Solicita la recontratación/activación de un trabajador
 * @param {string} id - ID del trabajador
 */
export async function recontratarTrabajador(id) {
  try {
    const response = await axios.patch(`/trabajadores/detail/recontratar/${id}`, { despedido: false });
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al recontratar al trabajador"
    };
  }
}

export const getGrupos = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`/trabajadores/detail/grupos?page=${page}&limit=${limit}`);
    return [response.data.data, null];
  } catch (error) {
    return [null, error.response?.data?.message || 'Error al obtener grupos'];
  }
};

export const createGrupo = async (data) => {
  try {
    const response = await axios.post('/trabajadores/create/grupos', data);
    return [response.data.data, null];
  } catch (error) {
    return [null, error.response?.data?.message || 'Error al crear grupo'];
  }
};

export const updateGrupo = async (id, data) => {
  try {
    const response = await axios.patch(`/trabajadores/detail/update/grupos/${id}`, data);
    return [response.data.data, null];
  } catch (error) {
    return [null, error.response?.data?.message || 'Error al actualizar grupo'];
  }
};

export const deleteGrupo = async (id) => {
  try {
    const response = await axios.delete(`/trabajadores/detail/delete/grupos/${id}`);
    return [response.data.data, null];
  } catch (error) {
    return [null, error.response?.data?.message || 'Error al eliminar grupo'];
  }
};