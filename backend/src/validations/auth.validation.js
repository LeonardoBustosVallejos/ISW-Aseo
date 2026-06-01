"use strict";
import Joi from "joi";

export const domainEmailValidator = (value, helper) => {
  //si es @gmail.com pasa sin problemas
  if (!value.endsWith("@gmail.com")) {

    //si no termina con gmail.com ver si es .cl o .com
    if (!(value.endsWith(".cl") || !value.endsWith(".com"))) {
      return helper.message("El correo electrónico debe terminar en .cl o .com");
    }
    //si tiene .cl o .com ver si es gmail
    if (value.endsWith("@gmail.cl")) {
      return helper.message("El correo electrónico @gmail no puede terminar en .cl.");
    }
    //se sale del if sabiendo que no es gmail, 
    // queda para correos de empresas, institucionales y otros correos como hotmail o yahoo
  }
  return value;
};

export const authValidation = Joi.object({
  email: Joi.string()
    .min(10)
    .max(35)
    .email()
    .required()
    .messages({
      "string.empty": "El correo electrónico no puede estar vacío.",
      "any.required": "El correo electrónico es obligatorio.",
      "string.base": "El correo electrónico debe ser de tipo texto.",
      "string.email": "El correo electrónico debe finalizar en @gmail.com.",
      "string.min": "El correo electrónico debe tener al menos 15 caracteres.",
      "string.max": "El correo electrónico debe tener como máximo 35 caracteres.",
    })
    .custom(domainEmailValidator, "Validación dominio email"),
  password: Joi.string()
    .min(8)
    .max(26)
    .pattern(/^[a-zA-Z0-9]+$/)
    .required()
    .messages({
      "string.empty": "La contraseña no puede estar vacía.",
      "any.required": "La contraseña es obligatoria.",
      "string.base": "La contraseña debe ser de tipo texto.",
      "string.min": "La contraseña debe tener al menos 8 caracteres.",
      "string.max": "La contraseña debe tener como máximo 26 caracteres.",
      "string.pattern.base": "La contraseña solo puede contener letras y números, sin caracteres especiales.",
    }),
}).unknown(false).messages({
  "object.unknown": "No se permiten propiedades adicionales.",
});

export const registerValidation = Joi.object({
  nombreCompleto: Joi.string()
    .min(10)
    .max(50)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑäëïöüÄËÏÖÜ\s]+$/)
    .required()
    .messages({
      "string.empty": "El nombre completo no puede estar vacío.",
      "any.required": "El nombre completo es obligatorio.",
      "string.base": "El nombre completo debe ser de tipo texto.",
      "string.min": "El nombre completo debe tener al menos 15 caracteres.",
      "string.max": "El nombre completo debe tener como máximo 50 caracteres.",
      "string.pattern.base": "El nombre completo solo puede contener letras y espacios.",
    }),
  rut: Joi.string()
    .min(9)
    .max(10)
    .required()
    .pattern(/^(\d{7,8}-[\dkK])$/)
    .messages({
      "string.empty": "El rut no puede estar vacío.",
      "string.base": "El rut debe ser de tipo string.",
      "string.min": "El rut debe tener como mínimo 9 caracteres.",
      "string.max": "El rut debe tener como máximo 10 caracteres.",
      "string.pattern.base": "Formato rut inválido, debe sin puntos y con guión.",
    }),
  email: Joi.string()
    .min(10)
    .max(35)
    .email()
    .required()
    .messages({
      "string.empty": "El correo electrónico no puede estar vacío.",
      "any.required": "El correo electrónico es obligatorio.",
      "string.base": "El correo electrónico debe ser de tipo texto.",
      "string.email": "El correo electrónico debe finalizar en @gmail.com.",
      "string.min": "El correo electrónico debe tener al menos 15 caracteres.",
      "string.max": "El correo electrónico debe tener como máximo 35 caracteres.",
    })
    .custom(domainEmailValidator, "Validación dominio email"),
  password: Joi.string()
    .min(8)
    .max(26)
    .pattern(/^[a-zA-Z0-9]+$/)
    .required()
    .messages({
      "string.empty": "La contraseña no puede estar vacía.",
      "any.required": "La contraseña es obligatorio.",
      "string.base": "La contraseña debe ser de tipo texto.",
      "string.min": "La contraseña debe tener al menos 8 caracteres.",
      "string.max": "La contraseña debe tener como máximo 26 caracteres.",
      "string.pattern.base": "La contraseña solo puede contener letras y números.",
    }),
  phone: Joi.string()
    .min(8)
    .max(15)
    .pattern(/^(?:\+56|56)?\s?(?:9\d{8}|[2-7]\d{8})$/)
    .allow('', null)
    .messages({
      "string.base": "El número telefónico debe contener entre 11 y 15 dígitos,opcionalmente con +.",
      "string.min": "El número telefónico debe tener al menos 8 caracteres.",
      "string.max": "El número telefónico debe tener como máximo 15 caracteres.",
      "string.pattern.base": "Formato del número telefónico inválido.",
    }),
  rol_id: Joi.string()
    .length(1)
    .required()
    .pattern(/^[1-4]/)
    .messages({
      "string.empty": "El rol no puede estar vacío.",
      "any.required": "El rol es obligatorio.",
      "string.base": "El rol solo puede contener números.",
      "string.pattern.base": "El rol solo puede contener números.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });
