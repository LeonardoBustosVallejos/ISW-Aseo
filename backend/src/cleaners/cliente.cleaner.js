import { cleanRut } from "./extras.js";

export function cleanClienteEntity(entity) {

    if (entity.rutCliente) {
        entity.rutCliente = cleanRut(entity.rutCliente);
    }

    if (entity.nombreCliente) {
        entity.nombreCliente =
            entity.nombreCliente.trim();
    }
}

export function cleanSedeEntity(entity) {
    if (entity.rutSecundario) {
        entity.rutSecundario = cleanRut(entity.rutSecundario)
    }
    if (entity.nombre_sede) {
        entity.nombre_sede = entity.nombre_sede.trim()
    }
    if (entity.direccion) {
        entity.direccion = entity.direccion.trim()
    }
}
export function cleanContactoEntity(entity) {
    if (entity.nombreContacto) {
        entity.nombreContacto = entity.nombreContacto.trim();
    }
    if (entity.contacto_rut) {
        entity.contacto_rut = cleanRut(entity.contacto_rut);
    }
    if (entity.email) {
        entity.email = entity.email.trim();
    }
    if (entity.phone) {
        entity.phone = entity.phone.trim();
    }
}