import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";
import { createContratoService } from "../services/contrato.service.js";

export async function createContrato(req, res) {
    try {
        const [contrato, err] = await createContratoService(req.body)

        if (err) return handleErrorClient(res, 400, erro.message)

        handleSuccess(res, 200, "Contrato agregado con éxito")
    } catch (error) {
        return handleErrorServer(res, 500, error.message);
    }
}