import { AppDataSource } from "../config/configDb.js";
import Roles from "../entity/rol.entity.js";

export async function getRolesService() {
    try {
        const rolRepository = await AppDataSource.getRepository(Roles)

        if (!rolRepository || rolRepository.lenght === 0) return [null, "No hay roles"]

        return [rolRepository, null]
    } catch (error) {
        console.error("Error al obtener a los roles:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function getRolByIdService(id) {
    try {
        const rolRepository = await AppDataSource.getRepository(Roles)

        if (!rolRepository || rolRepository.lenght === 0) return [null, "No hay roles"]

        const rol = await rolRepository.findOne({ where: { id: id } })

        return [rol, null]
    } catch (error) {
        console.error("Error al obtener un rol:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function getRolByNameService(name) {
    try {
        const rolRepository = await AppDataSource.getRepository(Roles)

        if (!rolRepository || rolRepository.lenght === 0) return [null, "No hay roles"]

        const buscado = await rolRepository.findOne({ where: { nombre: name } })

        if (!buscado) return [null, "Sin coincidencia"]

        return [buscado, null]
    } catch (error) {
        console.error("Error al obtener un rol:", error);
        return [null, "Error interno del servidor"];
    }
}