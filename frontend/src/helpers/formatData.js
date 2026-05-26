import { startCase } from 'lodash';
import { format as formatRut } from 'rut.js';
import { format as formatTempo } from "@formkit/tempo";

export function formatUserData(user) {
    return {
        ...user,
        nombreCompleto: startCase(user.nombreCompleto),
        rol: startCase(user.rol),
        rut: formatRut(user.rut),
        createdAt: formatTempo(user.createdAt, "DD-MM-YYYY")
    };
}

export function convertirMinusculas(obj) {
    for (let key in obj) {
        if (typeof obj[key] === 'string') {
            obj[key] = obj[key].toLowerCase();
        }
    }
    return obj;
}

export function formatPostUpdate(user) {
    return {
        nombreCompleto: startCase(user.nombreCompleto),
        rol: startCase(user.rol),
        rut: formatRut(user.rut),
        email: user.email,
        createdAt: formatTempo(user.createdAt, "DD-MM-YYYY")
    };
}

export function formatItemData(item){
    return {
        ...item,
        nombre: startCase(item.nombre),
        tipo: startCase(item.tipo),
        descripcion: startCase(item.descripcion),
        /*puede que aquí en algún momento me falte implementar un formato especial para los enteros 
        disponibilidadActual y disponibilidadTotal*/
    };
}

export function formatItemPostUpdate(item) {
    return {
        nombre: startCase(item.nombre),
        tipo: startCase(item.tipo),
        descripcion: startCase(item.descripcion),
    };
}