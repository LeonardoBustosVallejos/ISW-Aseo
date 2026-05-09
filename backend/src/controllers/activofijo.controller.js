import { registrarNuevoActivo, resumenActivos, asignarActivosCliente, devolverActivosBodega } from "../services/activofijo.service.js";

export const getResumenActivos = async (req, res) => {

    try{

        const {cliente_id} = req.params;
        const resumen = await resumenActivos(cliente_id);

        return res.status(200).json({
            estado: "exito",
            data: resumen
        });
    }catch(error){
        console.error("Error al obtener el resumen:", error);
        return [null, "Error interno del servidor"];
    }
};

export const crearActivoFijo = async (req, res) => {

    try{

        const datos_ingresados = req.body;

        if(!datos_ingresados.nombre){
            return res.status(400).json({
                estado: "error4",
            });
        }

        const nuevo_activo = await registrarNuevoActivo(datos_ingresados);
        return res.status(201).json({
            estado: "exito",
            mensaje: "Activo registrado correctamente",
            data: nuevo_activo
        });
    }catch(error){
        console.error("Error al crear el activo", error);
        return [null, "Error interno del servidor"];
    }
};

export const asignarActivos = async (req, res) => {
    try {

        const{cliente_id, nombre_maquina, cantidad} = req.body;

        if(!cliente_id || !nombre_maquina || !cantidad) {
            return res.status(400).json({
                estado: "error21"
            });
        }

        const [activos_asignados, error_servicio] = await asignarActivosCliente(cliente_id, nombre_maquina, cantidad);
        if(error_servicio){
            return res.status(400).json({
                estado: "error22",
                mensaje: error_servicio
            });
        }
        return res.status(200).json({
            estado: "exito",
            mensaje: `Se asignaron ${activos_asignados.length}-${nombre_maquina} al cliente ${cliente_id}`,
            data: activos_asignados
        });
    }catch (error){
        console.error("Error al asignar el activo", error);
        return [null, "Error interno del servidor"];
    }
};

export const devolverActivos = async (req, res) => {
    try {
        const{cliente_id, nombre_maquina, cantidad} = req.body;

        if(!cliente_id || !nombre_maquina || !cantidad){
            return res.status(400).json({
                estado: "error",
            });
        }

        const [activos_devueltos, error_servicio] = await devolverActivosBodega(cliente_id, nombre_maquina, cantidad);
        if(error_servicio){
            return res.status(400).json({
                estado: "error22",
                mensaje: error_servicio
            });
        }

        return res.status(200).json({
            estado: "exito",
            mensaje: `Se devolvieron ${activos_devueltos.length}-${nombre_maquina} a la bodega`,
            data: activos_devueltos
        });

    } catch(error){
        console.error("Error al devolver el activo", error);
        return [null, "Error interno del servidor"];
    }
};