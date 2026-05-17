import { obtenetHistorialCliente } from "../services/movimiento.service.js";

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
