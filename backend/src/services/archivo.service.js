import { AppDataSource } from "../config/configDb.js"
import DocumentoSchema from "../entity/documentoContrato.entity.js"
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


export async function createMultipleDocumentosService(
    documentos,
    contrato_id,
    manager = null
) {
    try {

        const execute = async (transactionManager) => {

            const documentosCreados = []

            for (const documento of documentos || []) {

                const [nuevoDocumento, errDocumento] =
                    await createDocumentoService(
                        {
                            file: documento,
                            nombrePersonalizado: documento.nombrePersonalizado,
                            tipoDocumento: documento.tipoDocumento,
                            contrato_id
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

export async function createDocumentoService(data, manager = null) {
    try {

        const execute = async (transactionManager) => {

            const {
                file,
                nombrePersonalizado,
                tipoDocumento,
                contrato_id
            } = data

            if (!file) {
                throw [null, "Debe proporcionar un archivo"]
            }

            const documentoRepository = transactionManager.getRepository(DocumentoSchema)

            const documento = documentoRepository.create({
                nombreOriginal: file.file.originalname,
                nombreArchivo: nombrePersonalizado || file.file.filename,
                ruta: file.file.path,
                mimeType: file.file.mimetype,
                extension: path.extname(file.file.originalname),
                peso: file.file.size,
                tipoDocumento,
                contrato: {
                    id_contrato_comercial: contrato_id
                }
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