import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";
import { getClientesService, getContactosService, registerClienteSimpleService, listarClientesService, registerClienteJerarquicoService, registerSedeSimpleService, registerClienteJerarquicoYArchivoService } from "../services/cliente.service.js";
import { createSedeValidation, registerClienteJerarquicoValidation, registerClienteValidation } from "../validations/cliente.validation.js";
import fs from "fs";
export async function getClientes(req, res) {
    try {
        const [clientes, err] = await listarClientesService()

        if (err) return handleErrorClient(res, 404, err)

        clientes.length === 0
            ? handleSuccess(res, 204)
            : handleSuccess(res, 200, "Clientes encontrados", clientes);
    } catch (error) {
        handleErrorServer(res, 500, error.message)
    }
}

export async function createSede(req, res) {
    try {
        const { error } = createSedeValidation.validate(req.body);
        if (error) return handleErrorClient(res, 400, "Error de validación", error.message);

        const { cliente_id, sede, contacto, trabajador_id } = req.body

        const [data, err] = await registerSedeSimpleService(sede, contacto, cliente_id, trabajador_id)
        if (err) handleErrorClient(res, 400, err)

        return handleSuccess(res, 201, "Sede registrada con éxito", data)
    } catch (error) {
        handleErrorServer(res, 500, error.message);
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

        const { cliente, filial, sede, contacto, trabajador_id } = req.body;



        const [data, errorNewCliente] = await registerClienteSimpleService({ cliente, filial, sede, contacto }, trabajador_id)

        if (errorNewCliente) return handleErrorClient(res, 400, "Error registrando", errorNewCliente);

        return handleSuccess(res, 201, "Cliente padre y filial registrados con éxito", data);

    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function registrarClienteJerarquico(req, res) {
    try {
        const { cliente, sedes } = req.body;
        const { error } = registerClienteJerarquicoValidation.validate(req.body)
        if (error) return handleErrorClient(res, 400, "Error de validación", error.message);
        const [data, errorNewCliente] = await registerClienteJerarquicoService(cliente, sedes)
        if (errorNewCliente) return handleErrorClient(res, 400, "Error registrando", errorNewCliente);

        return handleSuccess(res, 201, "Cliente padre y filial registrados con éxito", data);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function registrarClienteYArchivo(req, res) {
    try {

        const documentos = req.files || []

        console.log(req.files);

        const { cliente, sedes, contrato, metadataDocumentos } = req.body

        /**
        const { error } = registerClienteJerarquicoValidation.validate({ cliente, sedes, contrato })

        if (error) return handleErrorClient(res, 400, "Error de validación", error.message)
*/
        /**
         * IMPORTANTE:
         * multipart/form-data convierte todo en string,
         * así que normalmente tendrás que parsear.
        */

        const clienteParsed = typeof cliente === "string" ? JSON.parse(cliente) : cliente
        const sedesParsed = typeof sedes === "string" ? JSON.parse(sedes) : sedes
        const contratoParsed = typeof contrato === "string" ? JSON.parse(contrato) : contrato
        const metadataParsed = typeof metadataDocumentos === "string" ? JSON.parse(metadataDocumentos) : metadataDocumentos

        /**
         * unir metadata con archivos reales
        */

        const documentosFinales = documentos.map((file, index) => ({
            file,
            nombrePersonalizado: metadataParsed?.[index]?.nombrePersonalizado,
            tipoDocumento: metadataParsed?.[index]?.tipoDocumento,
            originalname: metadataParsed?.[index]?.originalname
        }))

        const [data, errorRegistro] = await registerClienteJerarquicoYArchivoService({
            cliente: clienteParsed,
            sedes: sedesParsed,
            contrato: contratoParsed,
            documentos: documentosFinales
        })

        if (errorRegistro) return handleErrorClient(res, 400, "Error registrando", errorRegistro)

        for (const file of req.files || []) {
            console.log(
                "EXISTE?",
                fs.existsSync(file.path),
                file.path
            )
        }
        return handleSuccess(res, 201, "Cliente, contrato y documentos registrados con éxito", data)

    } catch (error) {
        console.error(error)
        return handleErrorServer(res, 500, error.message)
    }
}