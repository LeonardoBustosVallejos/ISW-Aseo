import axios from "./root.service.js";

export const getResumen = async(cliente_id) => {
    try{
        const response = await axios.get(`/activos/resumen`);
        return response.data;
    }catch(error){
        return error.response.data;
    }
}