import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";
import { getVistaContratosService } from "../services/contrato.service.js";

export async function createContrato(req, res) {
    try {

        //if (err) return handleErrorClient(res, 400, erro.message)

        handleSuccess(res, 200, "Contrato agregado con éxito")
    } catch (error) {
        return handleErrorServer(res, 500, error.message);
    }
}
export async function getVistaContratosComerciales(req, res) {
    try {
        const [contactos, err] = await getVistaContratosService({}, null)
        if (err) handleErrorClient(res, 400, err)

        contactos.length === 0
            ? handleSuccess(res, 204)
            : handleSuccess(res, 200, "Contratos encontrados", contactos);
    } catch (error) {
        console.error(error);
        return handleErrorServer(res, 500, error.message);
    }
}