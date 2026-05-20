import axios from './root.service.js';

export async function listarClientesTope() {
    try {
        const response = await axios.get("/clientes")
        return response.data
    } catch (error) {

    }
}