export const ROLES = {
    ADMINISTRADOR: "Administrador",
    CLIENTE: "Cliente",
    SUPERVISOR: "Supervisor",
    TRABAJADOR: "Trabajador",
};

export const isAdmin = (rol) => rol === ROLES.ADMINISTRADOR;
export const isCliente = (rol) => rol === ROLES.CLIENTE;
export const isSupervisor = (rol) => rol === ROLES.SUPERVISOR;
export const isTrabajador = (rol) => rol === ROLES.TRABAJADOR;