import Joi from "joi";

export const documentoValidation = Joi.object({

    nombrePersonalizado: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            "string.empty": "El nombre del documento no puede estar vacío.",
            "any.required": "El nombre del documento es obligatorio."
        }),

    tipoDocumento: Joi.string()
        .valid(
            "CONTRATO",
            "ANEXO",
            "RENOVACION",
            "RESPALDO",
            "PDF_FIRMADO",
            "CERTIFICADO",
            "OTRO"
        )
        .required()
        .messages({
            "any.only": "Tipo de documento inválido.",
            "any.required": "El tipo de documento es obligatorio."
        }),

    fileKey: Joi.string()
        .required()
        .messages({
            "any.required": "Debe proporcionar una referencia del archivo."
        })
}).unknown(true)