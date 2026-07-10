"use strict"
import Joi from "joi";


export const createTrabajadorBodyValidation = Joi.object({
    nombres: Joi.string()
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)
        .min(2)
        .max(100)
        .required()
        .messages({
            "string.empty": "El nombre no puede estar vacío.",
            "any.required": "El nombre es requerido.",
            "string.pattern.base": "El nombre no puede incluir caracteres especiales (como @, $, #, ?, etc).",
            "string.min": "El nombre debe tener al menos {#limit} caracteres.",
            "string.max": "El nombre no puede superar los {#limit} caracteres.",
        }),
    apellidoPaterno: Joi.string()
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)
        .min(2)
        .max(60)
        .required()
        .messages({
            "string.empty": "El apellido paterno no puede estar vacío.",
            "any.required": "El apellido paterno es requerido.",
            "string.pattern.base": "El apellido paterno no puede incluir caracteres especiales (como @, $, #, ?, etc).",
            "string.min": "El apellido paterno debe tener al menos {#limit} caracteres.",
            "string.max": "El apellido paterno no puede superar los {#limit} caracteres.",
        }),
    apellidoMaterno: Joi.string()
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)
        .min(2)
        .max(60)
        .required()
        .messages({
            "string.empty": "El apellido materno no puede estar vacío.",
            "any.required": "El apellido materno es requerido.",
            "string.pattern.base": "El apellido materno no puede incluir caracteres especiales (como @, $, #, ?, etc).",
            "string.min": "El apellido materno debe tener al menos {#limit} caracteres.",
            "string.max": "El apellido materno no puede superar los {#limit} caracteres.",
        }),
    rut: Joi.string()
        .pattern(/^[0-9]{7,8}-([0-9]|k|K)$/)
        .min(9)
        .max(10)
        .required()
        .messages({
            "string.empty": "El rut no puede estar vacío.",
            "any.required": "El rut es requerido.",
            "string.pattern.base": "El rut debe tener una formato válido (ej: 12345678-9).",
            "string.min": "El rut debe tener al menos {#limit} caracteres.",
            "string.max": "El rut no puede superar los {#limit} caracteres.",
        }),
    nacimiento: Joi.string()
    .pattern(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/) 
    .required()
    .messages({
        "string.empty": "La fecha de nacimiento no puede estar vacía.",
        "string.pattern.base": "La fecha debe tener el formato válido AAAA-MM-DD.",
        "any.required": "La fecha de nacimiento es requerida."
    }),
    telefono: Joi.string()
    .pattern(/^\+[0-9]{11}$/)
    .required().messages({
        "string.empty": "El número de contacto no puede estar vacío.",
        "string.pattern.base": "El número debe de cumplir con el formato. Ejemplo: +56123456789",
        "any.required": "El número de contacto es requerido."
    }),
    email: Joi.string() 
        .email({ minDomainSegments: 2, //Debe haber 2 partes, separadas por el dominio (@)
                 tlds: // "TLD" se refiere a "Top-Level Domain" (.com, .cl, .net, .org)
                    { allow: false } }) // dandole a false permite cualquier final. Se removerá después
        .lowercase() 
        .required()
        .messages({
            "string.empty": "El correo electrónico no puede estar vacío.",
            "any.required": "El correo electrónico es requerido.",
            "string.email": "Por favor, ingresa un correo electrónico válido (ej: usuario@dominio.com).",
        }),
    rol: Joi.string()
        .valid(...["Supervisor", "Trabajador"])
        .required()
        .messages({
            "string.empty": "Debe de haber un rol asignado.",
            "any.required": "El rol es requerido.",
            "any.only": `Un trabajador de la empresa sólo puede tener los roles de ${["Supervisor", "Trabajador"].join(", ")}`,
        }),
    sexo: Joi.string()
        .valid("M", "F")
        .required()
        .messages({
            "string.empty": "El sexo no puede ser vacío",
            "any.required": "El sexo es requerido.",
            "any.only": "Un trabajador sólo puedes Masculino o Femenino.",
        }),
    grupo_id: Joi.number()
        .integer()
        .positive()
        .allow(null)
        .optional()
        .messages({
            "number.base": "El id del grupo debe de ser un numero.",
            "number.integer": "El id del grupo debe ser un entero.",
            "number.positive": "El id del grupo debe de ser positivo."
        }),
    foto_url: Joi.string()
        .uri()
        .required()
        .messages({
            "string.uri": "La foto de perfil debe tener una URL válida.",
            "string.empty": "La foto de perfil no puede estar vacía.",
            "any.required": "La URL de la foto de perfil es requerida.",
        }),
    foto_url: Joi.string()
            .uri()
            .optional()
            .messages({
                "string.uri": "La foto de perfil debe ser una URL válida."
            }),
    cv_url: Joi.string()
        .uri()
        .required()
        .messages({
            "string.uri": "El Currículum Vitae debe tener una URL válida.",
            "string.empty": "El Currículum Vitae no puede estar vacío.",
            "any.required": "La URL del Currículum Vitae es requerida.",
        }),
    antecedentes_url: Joi.string()
        .uri()
        .required()
        .messages({
            "string.uri": "Los antecedentes deben tener una URL válida.",
            "string.empty": "Los antecedentes no pueden estar vacíos.",
            "any.required": "La URL de los antecedentes es requerida.",
        }),
    competenciasIds: Joi.array()
        .items(
            Joi.number()
                .integer()
                .positive()
        )
        .allow(null)
        .optional()
        .messages({
            "array.base": "Las competencias deben ser una lista.",
            "number.base": "El id de la competencia debe ser un número.",
            "number.integer": "El id del ítem debe ser un entero.",
            "number.positive": "El id del ítem debe ser positivo."
        }),
    
}); 

export const getTrabajadoresQueryValidation = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .optional(),
    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10)
        .optional(),
    search: Joi.string()
        .trim()
        .allow("")
        .optional(),
    sexo: Joi.string()
        .valid("M", "F")
        .optional(),
    rol: Joi.string()
        .valid("Administrador", "Supervisor", "Trabajador")
        .optional(),
    competencias: Joi.alternatives()
    .try(
        Joi.number()
            .integer()
            .positive(),
        Joi.array()
            .items(
                Joi.number()
                .integer()
                .positive()),
        Joi.string()
            .trim()
            .allow("")
        ).optional(),
    estado: Joi.string()
        .valid("activos", "despedidos", "todos")
        .default("activos")
        .optional(),
    edadMin: Joi.number()
        .integer()
        .min(18)
        .optional(),
    edadMax: Joi.number()
        .integer()
        .max(70)
        .optional()
}).custom((value, helpers) => {
            if (value.edadMin !== undefined && value.edadMax !== undefined && value.edadMin > value.edadMax) {
                return helpers.message("La edad mínima no puede ser mayor que la edad máxima.");
            }

    return value;
});

export const getTrabajadorParamValidation = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "El ID debe ser un número.",
            "number.integer": "El ID debe ser un entero.",
            "number.positive": "El numero debe ser positivo.",
            "any.required": "El ID es un parámetro obligatorio."
        })
});

export const updateTrabajadorBodyValidation = Joi.object({
    telefono: Joi.string()
    .pattern(/^\+[0-9]{11}$/)
    .optional().messages({
        "string.pattern.base": "El número debe de cumplir con el formato. Ejemplo: +56123456789",
    }),
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .optional()
        .messages({
            "string.email": "El formato del correo electrónico no es válido."
        }),
    rol: Joi.number()
        .integer()
        .positive()
        .optional()
        .messages({
            "number.base": "El rol debe ser el ID numérico del Rol."
        }),
    grupo_id: Joi.number()
        .integer()
        .positive()
        .allow(null, "") 
        .optional()
        .messages({
            "number.base": "El grupo_id debe ser un número entero."
        }),
    competenciasIds: Joi.array()
        .items(Joi.number().integer().positive())
        .optional()
        .messages({
            "array.base": "Las competencias deben venir en un formato de lista (Array)."
        }),

});

export const updateTrabajadorParamValidation = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "El ID debe ser un número.",
            "number.integer": "El ID debe ser un entero.",
            "number.positive": "El ID debe ser positivo.",
            "any.required": "El ID es obligatorio."
        })
});

export const despidoTrabajadorBodyValidation = Joi.object({
    motivo: Joi.string()
        .trim()
        .min(10)
        .max(1000)
        .required()
        .messages({
            "string.base": "El motivo debe ser un texto.",
            "string.empty": "El motivo de la desvinculación no puede estar vacío.",
            "string.min": "El motivo debe tener al menos 10 caracteres para ser descriptivo.",
            "string.max": "El motivo no puede exceder los 1000 caracteres.",
            "any.required": "El motivo de la desvinculación es obligatorio."
        })
});

export const despidoTrabajadorParamValidation = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "El ID debe ser un número.",
            "number.integer": "El ID debe ser un entero.",
            "number.positive": "El ID debe ser positivo.",
            "any.required": "El ID del trabajador es obligatorio."
        })
});

export const recontratarTrabajadorParamValidation = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "El ID debe ser un número.",
            "number.integer": "El ID debe ser un entero.",
            "number.positive": "El ID debe ser positivo.",
            "any.required": "El ID del trabajador es obligatorio."
        })
});

export const getGruposQueryValidation = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .optional(),
    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10)
        .optional()
});

export const getGrupoParamValidation = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "El ID del grupo debe ser un número.",
            "number.integer": "El ID del grupo debe ser un número entero.",
            "number.positive": "El ID del grupo debe ser un valor positivo.",
            "any.required": "El ID del grupo es obligatorio en la ruta."
        })
});

export const createGrupoBodyValidation = Joi.object({
    nombre: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .required()
        .messages({
            "string.empty": "El nombre del grupo no puede estar vacío.",
            "string.min": "El nombre del grupo debe tener al menos 3 caracteres.",
            "any.required": "El nombre del grupo es obligatorio."
        }),
    sede_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "El ID de la sede debe ser un número.",
            "any.required": "La sede es obligatoria."
        }),
    supervisor_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "El ID del supervisor debe ser un número.",
            "any.required": "El supervisor es obligatorio."
        }),
    miembros: Joi.array()
        .items(Joi.number()
                .integer()
                .positive())
        .min(1)
        .max(25)
        .required()
        .messages({
            "array.base": "Los miembros deben venir en formato de arreglo.",
            "array.min": "El grupo debe tener al menos un miembro asignado.",
            "array.max": "El grupo no puede exceder los 25 miembros",
            "any.required": "Los miembros del grupo son obligatorios."
        })
});

export const deleteGrupoParamValidation = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "El ID del grupo debe ser un número.",
            "number.integer": "El ID del grupo debe ser un número entero.",
            "number.positive": "El ID del grupo debe ser un valor positivo.",
            "any.required": "El ID del grupo es obligatorio en la ruta."
        })
});

export const updateGrupoBodyValidation = Joi.object({
    nombre: Joi.string()
            .trim()
            .min(3)
            .max(100)
            .optional(),
    supervisor_id: Joi.number()
            .integer()
            .positive()
            .optional(),
    miembros: Joi.array()
                .items(
                    Joi.number()
                    .integer()
                    .positive())
            .min(1)
            .max(25)
            .required()
            .messages({
                "array.min": "El grupo debe tener al menos un miembro asignado.",
                "array.max": "Un grupo de trabajo no puede exceder el máximo de 25 personas.",
                "any.required": "Los miembros del grupo son obligatorios en la actualización."
            })
});