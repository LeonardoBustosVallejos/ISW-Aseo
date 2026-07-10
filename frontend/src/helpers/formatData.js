import { startCase } from 'lodash';
import { format as formatRut } from 'rut.js';
import { format as formatTempo } from "@formkit/tempo";

function getRolName(rol) {
    if (typeof rol === 'string') return rol;
    if (rol && typeof rol === 'object') {
        return rol.nombre || rol.rol || rol.nombreRol || rol.role || '';
    }
    return '';
}

export function formatUserData(user) {
    return {
        ...user,
        nombreCompleto: startCase(user.nombreCompleto),
        rol: startCase(getRolName(user.rol)),
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
        rol: startCase(getRolName(user.rol)),
        rut: formatRut(user.rut),
        email: user.email,
        createdAt: formatTempo(user.createdAt, "DD-MM-YYYY")
    };
}

export function formatItemData(item){
    return {
        ...item,
        nombre: startCase(item.nombre),
        codigo: startCase(item.codigo),
        tipo: startCase(item.tipo),
        descripcion: startCase(item.descripcion),
        /*puede que aquí en algún momento me falte implementar un formato especial para los enteros 
        disponibilidadActual y disponibilidadTotal*/
    };
}

export function formatItemPostUpdate(item) {
    return {
        nombre: startCase(item.nombre),
        codigo: startCase(item.codigo),
        tipo: startCase(item.tipo),
        descripcion: startCase(item.descripcion),
    };
}