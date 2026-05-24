import { Query } from "pg";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";
import { registrarNuevoActivo, resumenActivos, asignarActivosCliente, devolverActivosBodega } from "../services/activofijo.service.js";
import { asignarActivosValidation, devolverActivosValidation, confirmarRecepcionValidation } from "../validations/activofijo.validation.js";

export const getResumenActivos = async (req, res) => {
    try{
        const {cliente_id} = req.params;
        const resumen = await resumenActivos(cliente_id);
        return handleSuccess(res, 200, "Resumen obtenido correctamente", resumen);
    }catch(error){
        return handleErrorServer(res, 500, "Error interno del servidor", error.message);
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

        const{cliente_id, nombre_maquina, cantidad} = value;
        const [activos_asignados, error_servicio] = await asignarActivosCliente(cliente_id, nombre_maquina, cantidad);
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

        const{cliente_id, activos_ids} = value;
        const [activos_devueltos, error_servicio] = await devolverActivosBodega(cliente_id, activos_ids);
        if(error_servicio){
            return handleErrorClient(res, 400, "Error al devolver a bodega", error_servicio);
        }

        return handleSuccess(res, 200, `Se devolvieron ${activos_devueltos.length} activos a la bodega`, activos_devueltos);
    }catch(error){
        return handleErrorServer(res, 500, "Error interno del servidor", error.message);
     }
};