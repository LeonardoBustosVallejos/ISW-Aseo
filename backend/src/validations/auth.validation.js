"use strict";
import Joi from "joi";

const domainEmailValidator = (value, helper) => {
  if (!value.endsWith("@gmail.com")) {
    return helper.message(
      "El correo electrónico debe finalizar en @gmail.com."
    );
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
      "string.pattern.base": "La contraseña solo puede contener letras y números.",
    }),
}).unknown(false).messages({
  "object.unknown": "No se permiten propiedades adicionales.",
});

export const registerValidation = Joi.object({
  nombreCompleto: Joi.string()
    .min(10)
    .max(50)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
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
    .max(12)
    .required()
    .pattern(/^^(\d{1,2}(\.\d{3}){2}|\d{7,8})-[\dkK]$/)
    .messages({
      "string.empty": "El rut no puede estar vacío.",
      "string.base": "El rut debe ser de tipo string.",
      "string.min": "El rut debe tener como mínimo 9 caracteres.",
      "string.max": "El rut debe tener como máximo 12 caracteres.",
      "string.pattern.base": "Formato rut inválido, debe ser xx.xxx.xxx-x o xxxxxxxx-x.",
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
    .pattern(/^[0-9+\s-]{8,20}$/)
    .allow('', null)
    .messages({
      "string.base": "El número telefónico debe contener entre 8 y 20 dígitos,opcionalmente con +.",
      "string.base": "El número telefónico debe ser de tipo texto.",
      "string.min": "El número telefónico debe tener al menos 8 caracteres.",
      "string.max": "El número telefónico debe tener como máximo 15 caracteres.",
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

const contactoValidation = Joi.object({
  nombreContacto: Joi.string()
    .min(10)
    .max(50)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .required()
    .messages({
      "string.empty": "El nombre del contacto no puede estar vacío.",
      "any.required": "El nombre del contacto es obligatorio.",
      "string.base": "El nombre del contacto debe ser de tipo texto.",
      "string.min": "El nombre del contacto debe tener al menos 15 caracteres.",
      "string.max": "El nombre del contacto debe tener como máximo 50 caracteres.",
      "string.pattern.base": "El nombre del contacto solo puede contener letras y espacios.",
    }),
  contacto_rut: Joi.string()
    .min(9)
    .max(12)
    .required()
    .pattern(/^^(\d{1,2}(\.\d{3}){2}|\d{7,8})-[\dkK]$/)
    .messages({
      "string.empty": "El rut no puede estar vacío.",
      "string.base": "El rut debe ser de tipo string.",
      "string.min": "El rut debe tener como mínimo 9 caracteres.",
      "string.max": "El rut debe tener como máximo 12 caracteres.",
      "string.pattern.base": "Formato rut inválido, debe ser xx.xxx.xxx-x o xxxxxxxx-x.",
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
  phone: Joi.string()
    .min(8)
    .max(15)
    .pattern(/^[0-9+\s-]{8,20}$/)
    .allow('', null)
    .required()
    .messages({
      "string.base": "El número telefónico debe contener entre 8 y 20 dígitos,opcionalmente con +.",
      "string.base": "El número telefónico debe ser de tipo texto.",
      "any.required": "El teléfono de contacto es obligatorio.",
      "string.min": "El número telefónico debe tener al menos 8 caracteres.",
      "string.max": "El número telefónico debe tener como máximo 15 caracteres.",
    }),
})
const clienteValidation = Joi.object({
  nombreCliente: Joi.string()
    .min(3)
    .max(100)
    .required()
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ.\s]+$/)
    .messages({
      "string.empty": "El nombre de la empresa no puede estar vacío.",
      "any.required": "El nombre de la empresa es obligatorio.",
      "string.base": "El nombre de la empresa debe ser de tipo texto.",
      "string.min": "El nombre de la empresa debe tener al menos 15 caracteres.",
      "string.max": "El nombre de la empresa debe tener como máximo 50 caracteres.",
    }),
  rutCliente: Joi.string()
    .min(9)
    .max(12)
    .required()
    .pattern(/^^(\d{1,2}(\.\d{3}){2}|\d{7,8})-[\dkK]$/)
    .messages({
      "string.empty": "El rut no puede estar vacío.",
      "string.base": "El rut debe ser de tipo string.",
      "string.min": "El rut debe tener como mínimo 9 caracteres.",
      "string.max": "El rut debe tener como máximo 12 caracteres.",
      "string.pattern.base": "Formato rut inválido, debe ser xx.xxx.xxx-x o xxxxxxxx-x.",
    }),
  direccion: Joi.string()
    .min(5)
    .required()
    .pattern(/^[a-zA-Z0-9.\s]+$/)
    .messages({
      "string.empty": "La dirección no puede estar vacía.",
      "any.required": "La dirección es obligatoria.",
      "string.min": "La dirección debe tener al menos 5 caracteres.",
      "string.pattern.base": "La direccion de la empresa solo puede contener letras, espacios y puntos.",
    }),
  personalSolicitado: Joi.number()
    .min(1)
    .required()
    .messages({
      "any.required": "La cantidad de personal requerida es obligatoria.",
      "string.min": "Se debe solicitar al menos una persona.",
    }),
  contacto: contactoValidation.required()
})




export const registerClienteValidation = Joi.object({
  cliente: clienteValidation,
  supervisor: registerValidation,
}).custom((value, helper) => {
  if (value.cliente.rutCliente === value.supervisor.rut) {
    return helpers.error("any.invalid");
  }
  return value
}).messages({
  "any.invalid": "El RUT del cliente y supervisor no pueden ser iguales"
});