import axios from "./root.service.js";

export const getResumen = async(cliente_id) => {
    try{
        const response = await axios.get(`/activos/resumen`);
        return response.data;
    }catch(error){
        return error.response.data;
    }
}
export const getDetalles = async(sede_id) => {
    try{
        const response = await axios.get(`/activos/sede/${sede_id}`);
        return response.data.data || response.data;
    }catch(error){
        return error.response.data;
    }
}
export const getHistorialSede = async(sede_id) => {
    try {
        const response = await axios.get(`/activos/sede/${sede_id}/historial`);
        return response.data.data || response.data;
    } catch(error) {
        console.error("Error obteniendo historial:", error);
        return []; 
    }
}
export const getFechaContrato = async (cliente_id) => {
    try {
        const response = await axios.get(`/activos/fecha/${cliente_id}`);
        return response.data; 
    } catch (error) {
        console.error("Error obteniendo fecha de contrato:", error);
        return error.response?.data || null; 
    }
};