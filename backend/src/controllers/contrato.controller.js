import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";
import { createAnexosYDocumentos, createContratoClienteExistenteService, createContratoComercialService, getVistaContratosService } from "../services/contrato.service.js";
import { uploadAnexoValidation, uploadContratoValidation } from "../validations/contratos.validation.js";
import { createContratoClienteExistenteValidation } from "../validations/nuevoContrato.validations.js";

export async function createContratoYArchivo(req, res) {
    try {
        const { contrato, metadataDocumentos } = req.body;
        const { cliente_id } = req.params

        if (!cliente_id) {
            return handleErrorClient(res, 400, "Error de validación", "El cliente_id es requerido para asociar el contrato.");
        }

        const contratoParsed = typeof contrato === "string" ? JSON.parse(contrato) : contrato;
        const metadataContratoParsed = typeof metadataDocumentos === "string" ? JSON.parse(metadataDocumentos) : metadataDocumentos || [];

        const { error } = uploadContratoValidation.validate({ contrato: contratoParsed, metadataDocumentos: metadataDocumentos });
        if (error) return handleErrorClient(res, 400, "Error de validación", error.message);

        const documentosContratoFinales = metadataContratoParsed.map(doc => ({
            file: req.files?.[doc.fileKey]?.[0] || null, // Captura el archivo binario usando su fileKey
            nombrePersonalizado: doc.nombrePersonalizado || "",
            tipoDocumento: doc.tipoDocumento || "CONTRATO"
        }));

        const tieneArchivoPrincipal = documentosContratoFinales.some(doc => doc.file !== null);
        if (documentosContratoFinales.length > 0 && !tieneArchivoPrincipal) {
            return handleErrorClient(res, 400, "Error de archivos", "Se enviaron metadatos de documentos pero no se adjuntaron los archivos físicos correspondientes.");
        }

        const [data, errorRegistro] = await createContratoComercialService(contratoParsed, documentosContratoFinales, cliente_id, null);

        if (errorRegistro) {
            return handleErrorClient(res, 400, "Error registrando el contrato", errorRegistro);
        }

        return handleSuccess(res, 201, "Contrato y documentación registrados con éxito", data);

    } catch (error) {
        console.error("Error en registrarContratoYArchivo:", error);
        return handleErrorServer(res, 500, error.message);
    }
}

export async function createAnexoController(req, res) {
    try {
        const { anexos } = req.body;
        const { id_contrato } = req.params

        // 1. Validar y parsear la estructura de anexos
        if (!id_contrato) {
            return handleErrorClient(res, 400, "Error de validación", "El contratoId es requerido.");
        }

        const anexosParsed = typeof anexos === "string" ? JSON.parse(anexos) : anexos || [];

        if (!Array.isArray(anexosParsed) || anexosParsed.length === 0) {
            return handleErrorClient(res, 400, "Error de validación", "Debe enviar al menos un anexo válido.");
        }

        const { error } = uploadAnexoValidation.validate(anexosParsed)
        if (error) return handleErrorClient(res, 400, "Error de validación", error.message)

        const anexosProcesados = anexosParsed.map((anexo) => {
            const documentosConArchivos = (anexo.documentos || []).map((doc) => {

                const archivoFisico = req.files?.[doc.fileKey]?.[0] || null;

                return {
                    nombrePersonalizado: doc.nombrePersonalizado,
                    tipoDocumento: doc.tipoDocumento,
                    file: archivoFisico
                };
            });

            return {
                datos: { ...anexo.datos },
                documentos: documentosConArchivos
            };
        });

        const [data, errorRegistro] = await createAnexosYDocumentos({
            contratoId,
            anexos: anexosProcesados
        });

        if (errorRegistro) {
            return handleErrorClient(res, 400, "Error registrando anexos", errorRegistro);
        }

        return handleSuccess(res, 201, "Anexos registrados con éxito", data);

    } catch (error) {
        console.error("Error en registrarAnexosContrato:", error);
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

export async function createNuevoContratoExistente(req, res) {
    try {

        const { cliente_id } = req.params;

        const body = JSON.parse(req.body.body);

        const files = req.files ?? {};

        const { error } = await createContratoClienteExistenteValidation.validate(body)
        if (error) return handleErrorClient(res, 400, "Error de validación", error.message);

        const metadataDocumentos = body.metadataDocumentos.map(doc => ({
            file: req.files?.[doc.fileKey]?.[0],
            nombrePersonalizado: doc.nombrePersonalizado,
            tipoDocumento: doc.tipoDocumento
        }));
        body.metadataDocumentos = metadataDocumentos;


        const [contrato, err] = await createContratoClienteExistenteService(
            body,
            cliente_id,
            null
        );
        if (err) return handleErrorClient(res, 400, err);

        return handleSuccess(res, 201, "Contrato y documentación registrados con éxito", contrato);

    } catch (error) {

        if (Array.isArray(error)) {
            console.error(error[1]);
            if (manager) throw error
            return error
        }

        console.error(error)

        if (manager) throw error

        return [null, "Error interno del servidor"]

    }
}