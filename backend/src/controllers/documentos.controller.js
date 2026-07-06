import { handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";
import { downloadDocumentoService } from "../services/archivo.service.js";


export async function downloadDocumento(req, res) {
    try {

        const { id_documento } = req.params;

        const [documento, err] = await downloadDocumentoService(id_documento, null);

        if (err) return handleErrorClient(res, 404, err);

        return res.download(documento.ruta, documento.nombreOriginal);

    } catch (error) {
        console.error(error);
        return handleErrorServer(res, 500, error.message);
    }
}