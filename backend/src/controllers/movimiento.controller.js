import { obtenerHistorialSede } from "../services/movimiento.service.js";
import { confirmarRecepcionActivos } from "../services/activofijo.service.js";

export const getHistorial = async (req, res) => {
    try {
        const { sede_id } = req.params;
        const [historial, error] = await obtenerHistorialSede(sede_id);

        if (error){
            return res.status(500).json({estado: "error", mensaje: error});
        }
        
        return res.status(200).json({ estado: "exito",data: historial});
    } catch(error){
        console.error("Error al obtener historial:", error);
        return res.status(500).json({ estado: "error", mensaje: "Error interno del servidor"}); 
    }
};

export const confirmarRecepcion = async (req, res) => {
    try{
        const {cliente_id, sede_id, activos_ids, trabajador_id} = req.body;

        if(!cliente_id || !sede_id || !Array.isArray(activos_ids) || !trabajador_id){
            return res.status(400).json({estado: "error",mensaje: "Faltan datos"});
        }

        const [activos_confirmados, error] = await confirmarRecepcionActivos(cliente_id, sede_id, activos_ids, trabajador_id);
        if(error){
            return res.status(400).json({estado: "error",mensaje: error});
        }

        return res.status(200).json({ estado: "exito",data: activos_confirmados});
    }catch(error){
        console.error("Error al confirmar recepcion:", error);
        return res.status(500).json({ estado: "error", mensaje: "Error interno del servidor" });
    }
}