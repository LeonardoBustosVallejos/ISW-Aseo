import axios from './root.service.js';

export async function listarClientesTope() {
    try {
        const response = await axios.get("/clientes")
        return response.data
    } catch (error) {
        return error.response?.data || { message: "Error de conexión" };
    }
}
export async function registerCliente(data) {
    try {
        console.log(data);


        const response = await axios.post('clientes/register-gerarquico', data)
        return response.data
    } catch (error) {
        console.error("Error 400 - Detalle del Backend:", error.response?.data);
        return error.response?.data || { message: "Error de conexión" };
    }
}