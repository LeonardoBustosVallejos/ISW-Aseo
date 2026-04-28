import Joi from "joi";

export const contratoValidation = Joi.object({
    cliente_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "any.required": "El cliente es obligatorio"
        }),

    fechaInicio: Joi.date()
        .required()
        .messages({
            "date.base": "Fecha de inicio inválida",
            "any.required": "La fecha de inicio es obligatoria"
        }),
    fechaFin: Joi.date()
        .allow(null)
        .optional(),

    usuarios_ids: Joi.array()
        .items(Joi.number().integer().positive())
        .optional()
        .messages({
            "array.required": "el usuario del contrato es obligatorio"
        }),

    archivo: Joi.string()
        .optional() //modificar cuando esté habilitado el subir archivos
        .allow(null, "")
}).custom((value, helpers) => {
    const { fechaFin, fechaInicio } = value

    if (!fechaFin && new Date(fechaFin) <= new Date(fechaInicio)) {
        return helpers.error("any.invalid", { message: "La fecha de fin debe ser mayor a la fecha de inicio" });
    }
    //contrato de máximo 3 años

    if (fin <= inicio) {
        return helpers.error("any.invalid", {
            message: "La fecha de fin debe ser mayor a la fecha de inicio"
        });
    }

    const maxFecha = new Date(inicio);
    maxFecha.setFullYear(maxFecha.getFullYear() + 3);

    if (fin > maxFecha) {
        return helpers.error("any.invalid", {
            message: "El contrato no puede durar más de 3 años"
        });
    }

    return value
})
