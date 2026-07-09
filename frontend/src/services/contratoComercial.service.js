import axios from './root.service.js';

export async function createNuevoContrato(cliente_id, body) {
    try {

        const formData = new FormData();

        // Clonar para quitar los archivos del JSON
        const payload = structuredClone(body);

        payload.metadataDocumentos = payload.metadataDocumentos.map(doc => {
            const { file, ...rest } = doc;
            return rest;
        });

        formData.append("body", JSON.stringify(payload));

        // Agregar archivos
        body.metadataDocumentos.forEach(doc => {

            if (doc.file) {
                formData.append(doc.fileKey, doc.file);
            }

        });
        console.log(body);
        for (const [key, value] of formData.entries()) {
            console.log(key, value);
        }

        const response = await axios.post(`/contratos/comercial/register/${cliente_id}`, formData);

        return response.data;

    } catch (error) {

        console.error("Error 400 - Detalle del Backend:", error);

        return error.response?.data || {
            message: "Error de conexión"
        };
    }
}

