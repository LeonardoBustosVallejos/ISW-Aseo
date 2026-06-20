"use strict"
import Joi from "joi";

// RegEx que permite solo letras (con tildes, mayúsculas, Ñ) y espacios

const nombresRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
const rutRegex = /^[0-9]{7,8}-([0-9]|k|K)$/;
const nacimientoRegex = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
const rolesTrabajador = ["Supervisor", "Trabajador"];
const sexoPermitido = ["M", "F"]

export const createTrabajadorBodyValidation = Joi.object({
    nombres: Joi.string()
        .pattern(nombresRegex)
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
        .pattern(nombresRegex)
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
        .pattern(nombresRegex)
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
        .pattern(rutRegex)
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
    .pattern(nacimientoRegex) 
    .required()
    .messages({
        "string.empty": "La fecha de nacimiento no puede estar vacía.",
        "string.pattern.base": "La fecha debe tener el formato válido AAAA-MM-DD.",
        "any.required": "La fecha de nacimiento es requerida."
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
        .valid(...rolesTrabajador)
        .required()
        .messages({
            "string.empty": "Debe de haber un rol asignado.",
            "any.required": "El rol es requerido.",
            "any.only": `Un trabajador de la empresa sólo puede tener los roles de ${rolesTrabajador.join(", ")}`,
        }),
    sexo: Joi.string()
        .valid(...sexoPermitido)
        .required()
        .messages({
            "string.empty": "El sexo no puede ser vacío",
            "any.required": "El sexo es requerido.",
            "any.only": "Un trabajador sólo puedes Masculino o Femenino.",
        }),
    competencias: Joi.any().optional(),// Está así por ahora, ya que se deberá mover después
    grupo_id: Joi.any().optional(), // Está así por ahora, ya que se moverán los grupos después
    foto_url: Joi.string()
        .uri()
        .required()
        .messages({
            "string.uri": "La foto de perfil debe tener una URL válida.",
            "string.empty": "La foto de perfil no puede estar vacía.",
            "any.required": "La URL de la foto de perfil es requerida.",
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
    
});