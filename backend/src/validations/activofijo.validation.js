import Joi from "joi";

export const asignarActivosValidation = Joi.object({
    cliente_id: Joi.number()
        .integer()
        .positive()
        .required()
        .message({
            "number.base": "El id del cliente debe ser un numero.",
            "number.positive": "El id del cliente debe ser un numero positivo.",
            "any.required": "El id del cliente es obligatorio."
        }),
        nombre_maquina: Joi.string()
            .trim()
            .required()
            .message({
                "string.empty": "El nombre de la maquina no puede estar vacio.",
                "any.required": "El nombre de la maquina es obligatorio."
            }),
        catidad: Joi.number()
            .integer()
            .min(1)
            .required()
            .message({
                "number.min": "La cantidad debe ser al menos 1.",
                "any.required": "La cantidad es obligatoria."
            })
}).options({
    allowUnknown: false,
    stripUnknown: true,
    abortEarly: false
});

export const devolverActivosValidation = Joi.object({
    cliente_id: Joi.number()
        .integer()
        .positive()
        .required()
        .message({
            "number.base": "El id del cliente debe ser un numero.",
            "number.positive": "El id del cliente debe ser un numero positivo.",
            "any.required": "El id del cliente es obligatorio."
        }),
    
    activos_ids: Joi.array()
        .items(Joi.number()
            .integer()
            .positive()
        )
        .min(1)
        .required()
        .message({
            "array.min": "Se debe ingresar el id de al menos un activo a devolver."
        })
}).options({
    allowUnknown: false,
    stripUnknown: true,
    abortEarly: false
});

export const confirmarRecepcionValidation = Joi.object({
    cliente_id: Joi.number()
        .integer()
        .positive()
        .required()
        .message({
            "number.base": "El id del cliente debe ser un numero.",
            "number.positive": "El id del cliente debe ser un numero positivo.",
            "any.required": "El id del cliente es obligatorio."
        }),

    activos_ids: Joi.array()
        .items(Joi.number()
            .integer()
            .positive()
        )
        .min(1)
        .required()
        .message({
            "array.min": "Se debe ingresar el id de al menos un activo a devolver."
        }),

    trabajador_id: Joi.number()
        .integer()
        .positive()
        .required()
        .message({
            "any.required": "Debe ingresarse el id del trabajador que recibio el/los activo/s."
        }),
}).options({
    allowUnknown: false,
    stripUnknown: true,
    abortEarly: false
});