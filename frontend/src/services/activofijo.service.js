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

export const getStockBodega = async () => {
    try {
        const response = await axios.get(`/activos/bodega/stock`);
        return response.data.data || response.data; 
    } catch (error) {
        console.error("Error obteniendo stock de bodega:", error);
        return error.response?.data || [];
    }
}

export const asignarActivos = async (datos_asignacion) => {
    try {
        const response = await axios.patch(`/activos/asignar`, datos_asignacion);
        return response.data;
    }catch (error){
        console.error("Error al asignar activo:", error);
        return error.response?.data || { status: "Error", message: "Error de conexión" };
    }
};

export const confirmarRecepcion = async (datosConfirmacion) => {
    try {
        const response = await axios.patch(`/activos/confirmar`, datosConfirmacion);
        return response.data;
    } catch (error) {
        console.error("Error al confirmar recepción:", error);
        return error.response?.data || { estado: "error", mensaje: "Error de red al conectar con el servidor." };
    }
};