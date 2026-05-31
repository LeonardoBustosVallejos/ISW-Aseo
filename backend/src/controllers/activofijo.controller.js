import { registrarNuevoActivo, resumenActivos } from "../services/activofijo.service.js";

export const getResumenActivos = async (req, res) => {

    try{

        const {clienteId} = req.params;
        const resumen = await resumenActivos(clienteId);

        return res.status(200).json({
            estado: "exito",
            data: resumen
        });
    }catch(error){
        console.error("Error al obtener el resumen:", error);
        return res.status(500).json({ estado: "error", mensaje: "Error interno del servidor" });
    }
};

export const crearActivoFijo = async (req, res) => {

    try{

        const datosIngresados = req.body;

        if(!datosIngresados.nombre || !datosIngresados.cliente_id){

            return res.status(400).json({
                estado: "error",
                mensaje: "El nombre y el ID del cliente son obligatorios"
            });
        }

        const nuevoActivo = await registrarNuevoActivo(datosIngresados);

        return res.status(201).json({
            estado: "exito",
            mensaje: "Activo registrado correctamente",
            data: nuevoActivo
        });
    }catch(error){
        console.error("Error al crear el activo:", error);
        return res.status(500).json({ estado: "error", mensaje: "Error interno del servidor" });
    }
};