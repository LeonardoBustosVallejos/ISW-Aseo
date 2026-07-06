import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";
import { getContactosService, registerClienteSimpleService, listarClientesService, registerClienteJerarquicoService, registerClienteJerarquicoYArchivoService, getInfoClienteService, getInfoSedeService, deleteClienteService, updateSedeService, uptadeContactosArrayService, registerContactoJerarquicoService } from "../services/cliente.service.js";
import { contactosArrayValidation, createSedeValidation, registerClienteJerarquicoValidation, registerClienteJerarquicoYArchivoValidation, registerClienteValidation, sedeJerarquicoValidation } from "../validations/cliente.validation.js";
import fs from "fs";

export async function registerContactos(req, res) {
    try {
        const { error } = await contactosArrayValidation.validate(req.body)
        if (error) return handleErrorClient(res, 400, "Error de validación", error.message);

        const { sede_id } = req.params

        const [data, err] = await registerContactoJerarquicoService(req.body, sede_id, null)

        if (err) return handleErrorClient(res, 400, err)

        handleSuccess(res, 201, 'Contactos creados ', data)
    } catch (error) {
        if (Array.isArray(error)) {
            console.error(error[1])
            return handleErrorClient(res, 400, error[1])
        }
        console.error(error)
        return handleErrorServer(res, 500, error.message)
    }
}



export async function updateContactos(req, res) {
    try {

        const { error } = await contactosArrayValidation.validate(req.body)
        if (error) return handleErrorClient(res, 400, "Error de validación", error.message);

        const [data, err] = await uptadeContactosArrayService(req.body, null)
        if (err) return handleErrorClient(res, 400, err)

        handleSuccess(res, 202, 'Contacto(s) actualizados ', data)

    } catch (error) {
        if (Array.isArray(error)) {
            console.error(error[1])
            return handleErrorClient(res, 400, error[1])
        }
        console.error(error)
        return handleErrorServer(res, 500, error.message)
    }
}

export async function updateSede(req, res) {
    try {
        const { error } = sedeJerarquicoValidation.validate(req.body)
        if (error) return handleErrorClient(res, 400, "Error de validación", error.message);

        const sede = req.body
        const { sede_id } = req.params

        const [data, err] = await updateSedeService(sede_id, sede, null)

        if (err) {
            console.error(err);

            return handleErrorClient(res, 400, err)
        }


        handleSuccess(res, 200, data)

    } catch (error) {
        if (Array.isArray(error)) {
            console.error(error[1])
            return handleErrorClient(res, 400, error[1])
        }
        console.error(error)
        return handleErrorServer(res, 500, error.message)
    }
}





export async function getClientes(req, res) {
    try {
        const [clientes, err] = await listarClientesService()

        if (err) return handleErrorClient(res, 404, err)

        clientes.length === 0
            ? handleSuccess(res, 204)
            : handleSuccess(res, 200, "Clientes encontrados", clientes);
    } catch (error) {
        console.error(error)
        return handleErrorServer(res, 500, error.message)
    }
}

export async function deleteCliente(req, res) {
    try {
        const { cliente_id } = req.params

        const [data, err] = await deleteClienteService(cliente_id)
        if (err) return handleErrorClient(res, 404, "Error eliminado al cliente", err)

        handleSuccess(res, 200, "Cliente eliminado correctamente", data);

    } catch (error) {
        console.error(error)
        return handleErrorServer(res, 500, error.message)
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
        console.error(error)
        return handleErrorServer(res, 500, error.message)
    }
}
export async function getInfoSede(req, res) {
    try {
        const { rutCliente, sede_id } = req.params

        const [data, error] = await getInfoSedeService(rutCliente, sede_id)
        if (error) return handleErrorClient(res, 404, error)

        handleSuccess(res, 200, "Sede encontrada", data);
    } catch (error) {
        console.error(error)
        return handleErrorServer(res, 500, error.message)
    }
}

export async function getInfoCliente(req, res) {
    try {
        const { rutCliente, cliente_id } = req.params

        const [data, error] = await getInfoClienteService({ rutCliente, cliente_id }, null)
        if (error) return handleErrorClient(res, 404, error)

        handleSuccess(res, 200, "Cliente encontrado", data);
    } catch (error) {
        console.error(error)
        return handleErrorServer(res, 500, error.message)
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
        console.error(error)
        return handleErrorServer(res, 500, error.message)
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
        console.error(error)
        return handleErrorServer(res, 500, error.message)
    }
}

export async function registrarClienteYArchivo(req, res) {
    try {


        const { cliente, sedes, contrato, anexos, metadataDocumentosContrato } = req.body
        const bodyParsed = {

            cliente: typeof cliente === "string" ? JSON.parse(cliente) : cliente,

            sedes: typeof sedes === "string" ? JSON.parse(sedes) : sedes,

            contrato: typeof contrato === "string" ? JSON.parse(contrato) : contrato,

            anexos: typeof anexos === "string" ? JSON.parse(anexos) : anexos || [],

            metadataDocumentosContrato: typeof metadataDocumentosContrato === "string" ? JSON.parse(metadataDocumentosContrato) : metadataDocumentosContrato || []
        }
        const { error } = registerClienteJerarquicoYArchivoValidation.validate(bodyParsed)

        if (error) return handleErrorClient(res, 400, "Error de validación", error.message)


        /**
         * Parse JSON
         */

        const clienteParsed = typeof cliente === "string" ? JSON.parse(cliente) : cliente
        const sedesParsed = typeof sedes === "string" ? JSON.parse(sedes) : sedes
        const contratoParsed = typeof contrato === "string" ? JSON.parse(contrato) : contrato
        const anexosParsed = typeof anexos === "string" ? JSON.parse(anexos) : anexos || []
        const metadataContratoParsed = typeof metadataDocumentosContrato === "string" ? JSON.parse(metadataDocumentosContrato) : metadataDocumentosContrato || []

        /**
         * Documentos contrato
         */

        const documentosContratoFinales = metadataContratoParsed.map(doc => ({
            file: req.files?.[doc.fileKey]?.[0],
            nombrePersonalizado: doc.nombrePersonalizado,
            tipoDocumento: doc.tipoDocumento
        }))

        /**
         * Documentos anexos
         */

        for (const anexo of anexosParsed) {
            anexo.documentos = (anexo.documentos || []).map(doc => ({
                file: req.files?.[doc.fileKey]?.[0],
                nombrePersonalizado:
                    doc.nombrePersonalizado,
                tipoDocumento: doc.tipoDocumento
            }))
        }

        /**
         * Registrar
         */

        const [data, errorRegistro] = await registerClienteJerarquicoYArchivoService({
            cliente: clienteParsed,
            sedes: sedesParsed,
            contrato: contratoParsed,
            documentosContrato: documentosContratoFinales,
            anexos: anexosParsed
        })

        if (errorRegistro) return handleErrorClient(res, 400, "Error registrando", errorRegistro)
        return handleSuccess(res, 201, "Cliente registrado con éxito", data)

    } catch (error) {
        console.error(error)
        return handleErrorServer(res, 500, error.message)
    }
}