import axios from "./root.service.js";

/** 
 *  Obtiene todos los trabajadores
 * @returns { Promise } Lista de trabajadores
 */

export const getTrabajadores = async () => {
  try {
    const response = await axios.get("/trabajadores/");
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