import Joi from "joi";
import { contratoComercialValidation } from "./contratos.validation.js";
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