import { cleanRut } from "./extras.js";

export function cleanUserEntity(entity) {
    if (entity.rut) {
        entity.rut = cleanRut(entity.rut)
    }
    if (entity.name) {
        entity.name = entity.name.trim()
    }
    if (entity.email) {
        entity.email = entity.email.trim();
    }
    if (entity.phone) {
        entity.phone = entity.phone.trim();
    }
}