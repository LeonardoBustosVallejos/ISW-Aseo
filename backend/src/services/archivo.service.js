import { createErrorMessage } from "../cleaners/extras.js";
import { AppDataSource } from "../config/configDb.js"
import ContratoAnexoSchema from "../entity/contratos/contratoAnexo.entity.js";
import contratoComercialSchema from "../entity/contratos/contratoComercial.entity.js";
import contratoLaboralSchema from "../entity/contratos/contratoLaboral.entity.js";
import DocumentoSchema from "../entity/contratos/documentoContrato.entity.js"
import { createUploadMiddleware } from "../middlewares/multer.middleware.js"
import path from "path";
export const uploadContratoComercialService =
    createUploadMiddleware({
        destination: "uploads/comercial",
        allowedMimeTypes: [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/jpeg",
            "image/png"
        ]
    })

export const uploadContratoLaboralService =
    createUploadMiddleware({
        destination: "uploads/laboral",
        allowedMimeTypes: [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/jpeg",
            "image/png"
        ]
    })

export const uploadImagenPerfilService =
    createUploadMiddleware({
        destination: "uploads/perfiles",
        allowedMimeTypes: [
            "image/jpeg",
            "image/png"
        ]
    })


export async function createMultipleDocumentosService(documentos, relaciones, manager = null) {
    try {

        const execute = async (transactionManager) => {
            const { id_contrato_comercial, contrato_laboral_id, anexo_id } = relaciones

            //asegurar que el documento pertenezca a un contrato o anexo
            if (!contrato_laboral_id && !id_contrato_comercial && !anexo_id) throw [null, createErrorMessage("contrato", "Debe proporcionar un contrato válido")]

            //NUNCA puede pertenecer a un contrato Y anexo a la vez, esto incluye a los tipos de contrato 
            const relacionesValidas = [
                id_contrato_comercial,
                contrato_laboral_id,
                anexo_id
            ].filter(Boolean)

            if (relacionesValidas.length !== 1) throw [null, createErrorMessage("documento", "Debe pertenecer a una sola entidad")]

            const documentosCreados = []

            for (const documento of documentos || []) {

                const [nuevoDocumento, errDocumento] =
                    await createDocumentoService(
                        {
                            file: documento.file,
                            nombrePersonalizado: documento.nombrePersonalizado,
                            tipoDocumento: documento.tipoDocumento,
                            id_contrato_comercial,
                            contrato_laboral_id,
                            anexo_id
                        },
                        transactionManager
                    )

                if (errDocumento) throw [null, errDocumento]

                documentosCreados.push(nuevoDocumento)
            }

            return [documentosCreados, null]
        }

        if (manager) return await execute(manager)

        return await AppDataSource.transaction(execute)

    } catch (error) {
        if (Array.isArray(error)) {
            if (manager) throw error
            return error
        }
        console.error("Error al registrar documentos:", error)
        if (manager) throw error
        return [null, "Error interno del servidor"]
    }
}

/**
 * funcion base para guardar informacion de un documento en la base de datos
 * @param {*} data 
 * @param {*} manager 
 * @returns 
 */
export async function createDocumentoService(data, manager = null) {
    try {

        const execute = async (transactionManager) => {

            const {
                file,
                nombrePersonalizado,
                tipoDocumento,
                id_contrato_comercial,
                contrato_laboral_id,
                anexo_id
            } = data

            if (!file) throw [null, "Debe proporcionar un archivo"]

            //asegurar que el documento pertenezca a un contrato o anexo
            if (!contrato_laboral_id && !id_contrato_comercial && !anexo_id) throw [null, createErrorMessage("contrato", "Debe proporcionar un contrato válido")]

            //NUNCA puede pertenecer a un contrato Y anexo a la vez, esto incluye a los tipos de contrato 
            const relaciones = [
                id_contrato_comercial,
                contrato_laboral_id,
                anexo_id
            ].filter(Boolean)

            if (relaciones.length !== 1) throw [null, createErrorMessage("documento", "Debe pertenecer a una sola entidad")]

            const documentoRepository = transactionManager.getRepository(DocumentoSchema)


            const contratoRepository = transactionManager.getRepository(contratoComercialSchema)

            const anexoRepository = transactionManager.getRepository(ContratoAnexoSchema)

            const contratoLaboralRepository = transactionManager.getRepository(contratoLaboralSchema)

            let contratoComercial = null
            let contratoLaboral = null
            let anexo = null

            if (id_contrato_comercial) {
                contratoComercial = await contratoRepository.findOne({ where: { id_contrato_comercial } })
            }

            if (contrato_laboral_id) {
                contratoLaboral = await contratoLaboralRepository.findOne({ where: { id_contrato_laboral: contrato_laboral_id } })
            }

            if (anexo_id) {
                anexo = await anexoRepository.findOne({ where: { id_anexo: anexo_id } })
            }

            const documento = documentoRepository.create({
                nombreOriginal: file.originalname,
                nombreArchivo: nombrePersonalizado || file.filename,
                ruta: file.path,
                mimeType: file.mimetype,
                extension: path.extname(file.originalname),
                peso: file.size,
                tipoDocumento,
                contratoComercial,
                contratoLaboral,
                anexo
            })

            await documentoRepository.save(documento)

            return [documento, null]
        }

        if (manager) return await execute(manager)

        return await AppDataSource.transaction(execute)

    } catch (error) {

        if (Array.isArray(error)) {
            if (manager) throw error
            return error
        }

        console.error("Error al guardar documento:", error)

        if (manager) throw error

        return [null, "Error interno"]
    }
}





export async function createDocumentoAnexoService(data, manager = null) {

    try {

        const execute = async (transactionManager) => {

            const {
                file,
                nombrePersonalizado,
                anexo_id
            } = data

            if (!file) throw [null, "Debe proporcionar un archivo"]

            const documento = await saveDocumentoBase({

                nombreOriginal: file.originalname,

                nombreArchivo:
                    nombrePersonalizado || file.filename,

                ruta: file.path,

                mimeType: file.mimetype,

                extension: path.extname(file.originalname),

                peso: file.size,

                anexo: {
                    id_anexo: anexo_id
                }

            }, transactionManager)

            return [documento, null]
        }

        if (manager) return await execute(manager)

        return await AppDataSource.transaction(execute)

    } catch (error) {

        if (Array.isArray(error)) {
            if (manager) throw error
            return error
        }

        console.error(error)

        return [null, "Error interno"]
    }
}


export async function createMultipleDocumentosAnexoService(documentos, anexo_id, manager = null) {
    try {

        const execute = async (transactionManager) => {

            const documentosCreados = []

            for (const documento of documentos || []) {

                const [nuevoDocumento, errDocumento] =
                    await createDocumentoAnexoService(
                        {
                            file: documento.file,
                            nombrePersonalizado:
                                documento.nombrePersonalizado,
                            anexo_id
                        },
                        transactionManager
                    )

                if (errDocumento)
                    throw [null, errDocumento]

                documentosCreados.push(nuevoDocumento)
            }

            return [documentosCreados, null]
        }

        if (manager) return await execute(manager)

        return await AppDataSource.transaction(execute)

    } catch (error) {

        if (Array.isArray(error)) {
            if (manager) throw error
            return error
        }

        console.error(error)

        return [null, "Error interno"]
    }
}