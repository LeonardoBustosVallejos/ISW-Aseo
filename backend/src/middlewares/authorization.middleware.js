import {
    handleErrorClient,
    handleErrorServer,
} from "../handlers/responseHandlers.js";

export const isAdmin = (allowedRoles) => {
    return (req, res, next) => {

        if (!req.user || !req.user.rol) {
            return handleErrorClient(res, 403, "Acceso denegado. No se pudo determinar el rol.");
        }
        const rol = req.user.rol
        if (allowedRoles.includes(rol.nombre)) {
            next();
        } else {
            return handleErrorClient(res, 403, `Acceso denegado. Se requiere ser: ${allowedRoles.join(" o ")}.`);
        }
    };
};