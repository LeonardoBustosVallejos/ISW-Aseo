import { AppDataSource } from "../config/configDb.js";
import Movimiento from "../entity/movimiento.entity.js";

export const registrarMovimiento = async(tipo_movimiento, descripcion, cliente_id, activos_ids, trabajador_id = null, nombre_trabajador = null) => {
    try {
        const movimiento_repositorio = AppDataSource.getRepository(Movimiento);
        const nuevo_movimiento = movimiento_repositorio.create({
            tipo_movimiento,
            descripcion,
            cliente_id,
            activos_ids,
            trabajador_id,
            nombre_trabajador
        });

        await movimiento_repositorio.save(nuevo_movimiento)
        return true;
    }catch(error){
        console.error("Error de Base Datos:", error); 
        return [null, "error movimiento"];
    }
};

export const obtenetHistorialCliente = async(cliente_id) =>{
    try{
        const movimiento_repositorio = AppDataSource.getRepository(Movimiento);
        const historial = await movimiento_repositorio.find({
            where: {cliente_id: cliente_id},
            order: {fecha: "DESC"}
        });
        return [historial, null];
    }catch(error){
        console.error("Error de Base Datos:", error); 
        return [null, "error leer historial"];
    }
};