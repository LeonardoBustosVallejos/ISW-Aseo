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
  estado = "activos"
} = {}) => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit)
    });

    const terminoBusqueda = search.trim();
    if (terminoBusqueda !== "") {
      params.set("search", terminoBusqueda);
    }

    if (sexo !== "") {
      params.set("sexo", sexo);
    }

    if (edadMin !== "" && edadMin !== null && edadMin !== undefined) {
      params.set("edadMin", String(edadMin));
    }

    if (edadMax !== "" && edadMax !== null && edadMax !== undefined) {
      params.set("edadMax", String(edadMax));
    }

    if (rol !== "") {
      params.set("rol", rol);
    }

    if (estado !== "") {
      params.set("estado", estado);
    }

    const response = await axios.get(`/trabajadores?${params.toString()}`);

    return {
      succes: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch(error) {
    console.error("Error al obtener trabajadores", error);
    return {
      succes: false,
      message: error.response?.data?.message || "Error al obtener trabajadores",
      data: []
    };
  };
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