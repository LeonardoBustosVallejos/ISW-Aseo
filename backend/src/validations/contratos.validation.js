import Joi from "joi";
import { documentoValidation } from "./documentos.validation.js";

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
        .required(),

    fechaInicio: Joi.date()
        .required(),

    fechaFin: Joi.date()
        .greater(Joi.ref("fechaInicio"))
        .allow(null),

    montoNuevo: Joi.number()
        .positive()
        .allow(null),

    cantidadMaxTrabajadores: Joi.number()
        .integer()
        .min(1)
        .allow(null),

    tipoJornada: Joi.string()
        .valid(
            "DIURNA",
            "NOCTURNA",
            "MIXTA",
            "TURNOS"
        )
        .allow(null),

    tipoAnexo: Joi.string()
        .valid(
            "RENOVACION",
            "AUMENTO_PERSONAL",
            "REDUCCION_PERSONAL",
            "CAMBIO_MONTO",
            "SERVICIO_ADICIONAL",
            "OTRO"
        )
        .default("OTRO"),

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