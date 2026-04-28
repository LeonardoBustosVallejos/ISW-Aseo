import User from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDb.js";
import {
    handleErrorClient,
    handleErrorServer,
} from "../handlers/responseHandlers.js";

export async function isAdmin(req, res, next) {
    try {
        const userRepository = AppDataSource.getRepository(User);

        const userFound = await userRepository.findOne({
            relations: ["rol"],
            where:
                [{ id: req.id },
                { rut: req.rut },
                { email: req.email },
                { phone: req.phone }],
        });

        if (!userFound)
            return handleErrorClient(
                res,
                404,
                "Usuario no encontrado en la base de datos",
            );


        const rolUser = userFound.rol;
        console.log(req.user);

        if (rolUser.id != 1) {
            return handleErrorClient(
                res,
                403,
                "Error al acceder al recurso",
                "Se requiere un rol de administrador para realizar esta acción."
            );
        }
        next();
    } catch (error) {
        handleErrorServer(
            res,
            500,
            error.message,
        );
    }
}
export async function isCliente(req, res, next) {
    try {
        const userRepository = AppDataSource.getRepository(User);

        const userFound = await userRepository.findOne({
            relations: ["rol"],
            where:
                [{ id: id },
                { rut: rut },
                { email: email },
                { phone: phone }],
        });

        if (!userFound) {
            return handleErrorClient(
                res,
                404,
                "Usuario no encontrado en la base de datos",
            );
        }

        const rolUser = userFound.rol;

        if (rolUser !== "Cliente") {
            return handleErrorClient(
                res,
                403,
                "Error al acceder al recurso",
                "Se requiere un rol de Cliente para realizar esta acción."
            );
        }
        next();
    } catch (error) {
        handleErrorServer(
            res,
            500,
            error.message,
        );
    }
}
export async function isSupervisor(req, res, next) {
    try {
        const userRepository = AppDataSource.getRepository(User);

        const userFound = await userRepository.findOne({
            relations: ["rol"],
            where:
                [{ id: id },
                { rut: rut },
                { email: email },
                { phone: phone }],
        });

        if (!userFound) {
            return handleErrorClient(
                res,
                404,
                "Usuario no encontrado en la base de datos",
            );
        }

        const rolUser = userFound.rol;

        if (rolUser !== "Supervisor") {
            return handleErrorClient(
                res,
                403,
                "Error al acceder al recurso",
                "Se requiere un rol de supervisor para realizar esta acción."
            );
        }
        next();
    } catch (error) {
        handleErrorServer(
            res,
            500,
            error.message,
        );
    }
}
export async function isTrabajador(req, res, next) {
    try {
        const userRepository = AppDataSource.getRepository(User);

        const userFound = await userRepository.findOne({
            relations: ["rol"],
            where:
                [{ id: id },
                { rut: rut },
                { email: email },
                { phone: phone }],
        });

        if (!userFound) {
            return handleErrorClient(
                res,
                404,
                "Usuario no encontrado en la base de datos",
            );
        }

        const rolUser = userFound.rol;

        if (rolUser !== "Trabajador") {
            return handleErrorClient(
                res,
                403,
                "Error al acceder al recurso",
                "Se requiere un rol de trabajador para realizar esta acción."
            );
        }
        next();
    } catch (error) {
        handleErrorServer(
            res,
            500,
            error.message,
        );
    }
}