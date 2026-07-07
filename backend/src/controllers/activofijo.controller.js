import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";
import { registrarNuevoActivo, resumenActivosAdmin, asignarActivosCliente, devolverActivosBodega, obtenerActivosPorSede } from "../services/activofijo.service.js";
import { asignarActivosValidation, devolverActivosValidation, confirmarRecepcionValidation } from "../validations/activofijo.validation.js";
import { getFechaContratodeCliente } from "../services/contrato.service.js";
import { AppDataSource } from "../config/configDb.js";
import UserSchema from "../entity/user.entity.js";

export const getResumenActivos = async (req, res) => {
    try {
        const user_id = req.user.id;
        let resumen;
        const userRepository = AppDataSource.getRepository(UserSchema);
        const usuarioCompleto = await userRepository.findOne({
            where: { id: user_id },
            relations: ["rol"]
        });
        if (!usuarioCompleto) {
            return res.status(404).json({ status: "Error", message: "Usuario no encontrado", data: [] });
        }
        const rol_id = usuarioCompleto.rol?.id || usuarioCompleto.rol?.rol_id;

        if(rol_id == 1){
            resumen = await resumenActivosAdmin();
        }else{
            return res.status(403).json({ status: "Error", message: "No tienes permisos para ver el resumen", data: [] });
        }
        return handleSuccess(res, 200, "Resumen obtenido correctamente", resumen);

    }catch(error){
        return res.status(500).json({ status: "Error", message: "Error interno del servidor", error: error.message });
    }
};

export const getActivosPorSede = async (req, res) => {
    try {
        const sede_id = req.params.sedeId;
        const user_id = req.user.id;

        const userRepository = AppDataSource.getRepository(UserSchema);
        const usuarioCompleto = await userRepository.findOne({
            where: { id: user_id },
            relations: ["rol"]
        });

        if (!usuarioCompleto) {
            return res.status(404).json({ status: "Error", message: "Usuario no encontrado", data: [] });
        }

        const rol_id = usuarioCompleto.rol?.id || usuarioCompleto.rol?.rol_id;

        if (rol_id !== 1) {
            return res.status(403).json({ status: "Error", message: "No tienes permisos para ver estos detalles", data: [] });
        }
        if (!sede_id || sede_id === "undefined" || isNaN(parseInt(sede_id))) {
            return res.status(400).json({ status: "Error", message: "El ID de la sede no es válido." });
        }
        const activosDeLaSede = await obtenerActivosPorSede(sede_id);

        return handleSuccess(res, 200, "Detalles de la sede obtenidos correctamente", activosDeLaSede);
    } catch (error) {
        console.error("Error en getActivosPorSede controller:", error);
        return res.status(500).json({ status: "Error", message: "Error interno del servidor", error: error.message });
    }
};

export const crearActivoFijo = async (req, res) => {
    try{
        const datos_ingresados = req.body;
        if(!datos_ingresados.nombre){
            return handleErrorClient(res, 400, "Falta el nombre del activo");
        }

        const [nuevo_activo, error_servicio] = await registrarNuevoActivo(datos_ingresados);
        if(error_servicio){
            return handleErrorClient(res, 400, "Error al crear activo", error_servicio);
        }
        return handleSuccess(res, 201, "Activo registrado correctamente", nuevo_activo);
    }catch(error){
        return handleErrorServer(res, "Error interno del servidor", error.message);
    }
};

export const asignarActivos = async (req, res) => {
    try {
        const {error, value} = asignarActivosValidation.validate(req.body);
        if(error){
            const mensajes = error.details.map(err => err.message).join(", ");
            return handleErrorClient(res, 400, "Parametros de asignacion invalidos", mensajes);
        }

        const{cliente_id, sede_id, nombre_maquina, cantidad} = value;
        const [activos_asignados, error_servicio] = await asignarActivosCliente(cliente_id, sede_id, nombre_maquina, cantidad);
        if(error_servicio){
            return handleErrorClient(res, 400, "Error al asignar activo", error_servicio);
        }

        return handleSuccess(res, 200, `Se asignaron ${activos_asignados.length} ${nombre_maquina} al cliente ${cliente_id}`, activos_asignados);
    }catch (error){
        return handleErrorServer(res, 500, "Error interno del servidor", error.message);
    }
};

export const devolverActivos = async (req, res) => {
    try {
        const {error, value} = devolverActivosValidation.validate(req.body);
        if(error){
            const mensajes = error.details.map(err => err.message).join(", ");
            return handleErrorClient(res, 400, "Parametros de devolucion invalidos", mensajes);
        }

        const{cliente_id, sede_id, activos_ids} = value;
        const [activos_devueltos, error_servicio] = await devolverActivosBodega(cliente_id, sede_id, activos_ids);
        if(error_servicio){
            return handleErrorClient(res, 400, "Error al devolver a bodega", error_servicio);
        }

        return handleSuccess(res, 200, `Se devolvieron ${activos_devueltos.length} activos a la bodega`, activos_devueltos);
    }catch(error){
        return handleErrorServer(res, 500, "Error interno del servidor", error.message);
     }
};

export const getFechaContratoCliente = async (req, res) => {
    try {
        const { cliente_id } = req.params;
        const fecha = await getFechaContratodeCliente(cliente_id);

        return handleSuccess(res, 200, "Fecha obtenida con éxito", fecha);
    } catch (error) {
        return handleErrorServer(res, 500, error.message);
    }
}