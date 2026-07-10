import Joi from "joi";
import { anexoCompletoValidation, contratoComercialValidation } from "./contratos.validation.js";
import { documentoValidation } from "./documentos.validation.js";
import { registerClienteJerarquicoValidation, sedeJerarquicoValidation, selectedFilialValidation } from "./cliente.validation.js";

export const createContratoClienteExistenteValidation = Joi.object({
    cliente_id: Joi
        .number()
        .positive(),

    contrato: contratoComercialValidation.required(),

    metadataDocumentos: Joi.array()
        .items(documentoValidation)
        .required(),

    sedesSeleccionadas: Joi.array(),

    nuevasSedes: Joi.array().items(sedeJerarquicoValidation).default([]),

    filiales: Joi.array().items(selectedFilialValidation).default([]),


    nuevasFiliales: Joi.array().items(registerClienteJerarquicoValidation).default([])

})


export const createAnexoClienteExistenteValidation = Joi.object({

    contrato_id: Joi.number()
        .positive()
        .required()
        .messages({
            "number.base": "El id del contrato debe ser un número.",
            "number.positive": "El id del contrato debe ser mayor que cero.",
            "any.required": "Debe indicar el contrato al que pertenece el anexo."
        }),

    anexos: Joi.array()
        .items(anexoCompletoValidation)
        .min(1)
        .required()
        .messages({
            "array.base": "Los anexos deben enviarse en un arreglo.",
            "array.min": "Debe registrar al menos un anexo.",
            "any.required": "Debe enviar al menos un anexo."
        }),

    sedesSeleccionadas: Joi.array()
        .default([])
        .messages({
            "array.base": "Las sedes seleccionadas deben enviarse en un arreglo."
        }),

    nuevasSedes: Joi.array()
        .items(sedeJerarquicoValidation)
        .default([])
        .messages({
            "array.base": "Las nuevas sedes deben enviarse en un arreglo."
        }),

    filiales: Joi.array()
        .items(selectedFilialValidation)
        .default([])
        .messages({
            "array.base": "Las filiales deben enviarse en un arreglo."
        }),

    nuevasFiliales: Joi.array()
        .items(registerClienteJerarquicoValidation)
        .default([])
        .messages({
            "array.base": "Las nuevas filiales deben enviarse en un arreglo."
        })

});