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