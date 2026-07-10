import Joi from "joi";
import { documentoValidation } from "./documentos.validation.js";
import { sedeJerarquicoValidation, selectedFilialValidation } from "./cliente.validation.js";

export const contratoComercialValidation = Joi.object({
    fechaInicio: Joi.date()
        .required(),

    fechaFinOriginal: Joi.date()
        .greater(Joi.ref("fechaInicio"))
        .required(),

    monto: Joi.number()
        .positive()
        .required(),

    jornada: Joi.string()
        .valid("COMPLETA", "PARCIAL")
        .default("COMPLETA"),

    tipoJornada: Joi.string()
        .valid(
            "DIURNA",
            "NOCTURNA",
            "MIXTA",
            "TURNOS"
        )
        .default("DIURNA"),

    cantidadMinTrabajadores: Joi.number()
        .integer()
        .min(1)
        .required(),

    cantidadMaxTrabajadores: Joi.number()
        .integer()
        .min(Joi.ref("cantidadMinTrabajadores"))
        .required(),

    tamanoInstalacion: Joi.string()
        .valid(
            "PEQUENA",
            "MEDIANA",
            "GRANDE",
            "INDUSTRIAL"
        ),

    requiereGuardias: Joi.boolean()
        .default(false),

    detalles: Joi.string()
        .allow("", null),

    observacionesOperativas: Joi.string()
        .allow("", null)
})

export const contratoAnexoValidation = Joi.object({

    numeroAnexo: Joi.string()
        .max(50)
        .required()
        .messages({
            'string.empty': 'Entregue un numero de anexo, único para el contrato'
        }),

    fechaInicio: Joi.date()
        .required(),

    fechaFin: Joi.date()
        .greater(Joi.ref("fechaInicio"))
        .allow(null),

    montoNuevo: Joi.number()
        .positive()
        .required(),

    jornada: Joi.string()
        .valid("COMPLETA", "PARCIAL")
        .default("COMPLETA")
        .messages({ "any.only": "El jornada inválida. Sólo COMPLETA ó PARCIAL" }),

    tipoJornada: Joi.string()
        .valid(
            "DIURNA",
            "NOCTURNA",
            "MIXTA",
            "TURNOS"
        )
        .default("DIURNA")
        .messages({
            "any.only": "El tipo de jornada inválida."
        }),

    cantidadMinTrabajadores: Joi.number()
        .integer()
        .min(1)
        .required(),

    cantidadMaxTrabajadores: Joi.number()
        .integer()
        .min(Joi.ref("cantidadMinTrabajadores"))
        .required(),

    tamanoInstalacion: Joi.string()
        .valid(
            "PEQUENA",
            "MEDIANA",
            "GRANDE",
            "INDUSTRIAL"
        ).messages({ "any.only": "El tamaño de instalación inválido." }),
    tipoAnexo: Joi.string()
        .valid(
            "RENOVACION",
            "AUMENTO_PERSONAL",
            "REDUCCION_PERSONAL",
            "CAMBIO_MONTO",
            "SERVICIO_ADICIONAL",
            'REMOVER_SEDES',
            'SUSPENCION',
            "REANUDACION",
            'TERMINO',
            "OTRO"
        ).messages({
            "any.only": "El tipo de anexo inválido."
        })
    ,
    requiereGuardias: Joi.boolean()
        .default(false),

    detalles: Joi.string()
        .allow("", null),

    observacionesOperativas: Joi.string()
        .allow("", null)
})

export const anexoCompletoValidation = Joi.object({

    datos: contratoAnexoValidation
        .required(),

    documentos: Joi.array()
        .items(documentoValidation)
        .default([])
})

export const uploadContratoValidation = Joi.object({
    contrato: contratoComercialValidation.required(),

    metadataDocumentos: Joi.array()
        .items(documentoValidation)
        .required()
})

export const uploadAnexoValidation = Joi.array().min(1).items(anexoCompletoValidation).required()