import axios from './root.service.js';

export async function descargarDocumento(documento_id) {
    try {

        const response = await axios.get(`/documentos/${documento_id}/download`, { responseType: "blob" });


        // Obtener el nombre desde el header si existe
        let nombreArchivo = "documento";

        const disposition = response.headers["content-disposition"];

        if (disposition) {
            const match = disposition.match(/filename="?([^"]+)"?/);

            if (match) {
                nombreArchivo = decodeURIComponent(match[1]);
            }
        }

        const url = window.URL.createObjectURL(response.data);

        const link = document.createElement("a");

        link.href = url;
        link.download = nombreArchivo;

        document.body.appendChild(link);

        link.click();

        link.remove();

        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Error descargando documento:", error);
        return error.response?.data || { message: "Error de conexión" };
    }
}


export async function getContratosComerciales() {
    try {
        const response = await axios.get('/contratos/comercial')

        return response.data

    } catch (error) {
        return error.response?.data || { message: "Error de conexión" };
    }
}