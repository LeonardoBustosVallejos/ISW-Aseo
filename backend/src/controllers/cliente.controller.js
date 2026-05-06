import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";
import { getClientesService, getContactosService, registerClientService } from "../services/cliente.service.js";
import { registerClienteValidation } from "../validations/cliente.validation.js";

export async function getClientes(req, res) {
    try {
        const [clientes, err] = await getClientesService()

        if (err) return handleErrorClient(res, 404, err)

        clientes.length === 0
            ? handleSuccess(res, 204)
            : handleSuccess(res, 200, "Clientes encontrados", clientes);
    } catch (error) {
        handleErrorServer(res, 500, error.message)
    }
}




export async function getContactos(req, res) {
    try {
        const [contactos, err] = await getContactosService()
        if (err) handleErrorClient(res, 400, err)

        contactos.length === 0
            ? handleSuccess(res, 204)
            : handleSuccess(res, 200, "Contactos encontrados", contactos);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
export async function registerCliente(req, res) {
    try {

        const { error } = registerClienteValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, "Error de validación", error.message);

        const { cliente, supervisor } = req.body;



        const [data, errorNewCliente] = await registerClientService(cliente, supervisor)

        if (errorNewCliente) return handleErrorClient(res, 400, "Error registrando", errorNewCliente);

        return handleSuccess(res, 201, "Datos del cliente registrados con éxito", data);

    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}