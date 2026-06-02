import { obtenetHistorialCliente } from "../services/movimiento.service.js";
import { confirmarRecepcionActivos } from "../services/activofijo.service.js";

export const getHistorial = async (req, res) => {
    try {
        const {cliente_id} = req.params;
        const [historial, error] = await obtenerHistorialPorCliente(cliente_id);

        if (error){
            return res.status(500).json({ 
                estado: "error500"
             });
        }
        
        return res.status(200).json({ 
            estado: "exito",
            data: historial 
        });
    }catch(error){
        console.error("Error obtener historial", error);
        return [null, "Error interno del servidor"];
    }
};

export const confirmarRecepcion = async (req, res) => {
    try{
        const {cliente_id, activos_ids, trabajador_id, nombre_trabajador} = req.body;

        if(!cliente_id || !Array.isArray(activos_ids) || !trabajador_id || !nombre_trabajador){
            return res.status(501).json({
                estado: "error",
                mensaje: "Faltan datos"
            });
        }

        const [activos_confirmados, error] = await confirmarRecepcionActivos(cliente_id, activos_ids, trabajador_id, nombre_trabajador);

        if(error){
            return res.status(502).json({
                estado: "error1",
                mensaje: error
            });
        }

        return res.status(200).json({ 
            estado: "exito1",
            data: activos_confirmados
        });
    }catch(error){
        console.error("Error al confirmar recepcion", error);
        return [null, "Error interno del servidor"];
    }
}
