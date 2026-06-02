import { ReturningStatementNotSupportedError } from "typeorm";
import { AppDataSource } from "../config/configDb.js";
import ActivoFijo from "../entity/activofijo.entity.js";
import { registrarMovimiento } from "./movimiento.service.js";
import TrabajadorSchema from "../entity/trabajador.entity.js";
import ClienteSchema from "../entity/cliente.entity.js";

const generarCodigo = async (prefijo) => {

    const activoFijoRepositorio = AppDataSource.getRepository(ActivoFijo);
    const ultimo_activo = await activoFijoRepositorio
    .createQueryBuilder("activo")
    .where("activo.codigo_inventario LIKE :prefijo", {prefijo: `${prefijo}-%`})
    .orderBy("activo.codigo_inventario", "DESC")
    .getOne();

    if(!ultimo_activo){
        return `${prefijo}-001`;
    }

    const partes = ultimo_activo.codigo_inventario.split('-');
    const ultimo_numero = parseInt(partes[1], 10);
    const nuevo_numero = ultimo_numero + 1;
    const ultimo_texto = nuevo_numero.toString().padStart(3,'0');

    return `${prefijo}-${ultimo_texto}`;
};

export const registrarNuevoActivo = async (datos_activo) => {
    try{
        const activoFijoRepositorio = AppDataSource.getRepository(ActivoFijo);
        const prefijo_categoria = {
            "Linea Blanca": "LBL",
            "Herramientas de Limpieza": "HRL",
            "Mobiliario": "MOB",
            "Electronica": "ELE"
        };

        const prefijo_of = prefijo_categoria[datos_activo.codigo_inventario];
        const cantidad = datos_activo.cantidad ? parseInt(datos_activo.cantidad): 1;
        const activos_creados = [];

        for(let i = 0; i < cantidad; i++){
            const codigo_generado = await generarCodigo(prefijo_of);
            const nuevoActivo = activoFijoRepositorio.create({
                ...datos_activo,
                cliente_id: null,
                codigo_inventario: codigo_generado
            }) 

            const resultado = await activoFijoRepositorio.save(nuevoActivo);
            activos_creados.push(resultado);
        }

        return [activos_creados, null];
    }catch(error){
        console.error("Error de Base Datos:", error); 
        return [null, "errorrrrr"];
    }
};

export const resumenActivosAdmin = async () => {
    try {
        const clienteRepository = AppDataSource.getRepository("Cliente");
        const todosLosClientes = await clienteRepository.find({
            relations: ["sede"] 
        });

        if (!todosLosClientes || todosLosClientes.length === 0) {
            return []; 
        }

        const resumenFinal = todosLosClientes.flatMap(cliente => {
            if (!cliente.sede || cliente.sede.length === 0) {
                return [{
                    id: cliente.rutCliente,
                    compania: cliente.nombreCliente || "Sin Nombre",
                    ubicacion: "Sin Dirección",
                    estadoSuministros: ['rojo', 'naranja', 'verde'], 
                    alerta: true 
                }];
            }
            return cliente.sede.map(sede => {
                return {
                    id: cliente.rutCliente, 
                    compania: cliente.nombreCliente || "Sin Nombre",
                    ubicacion: sede.direccion || "Sin Dirección",
                    estadoSuministros: ['rojo', 'naranja', 'verde'], 
                    alerta: true 
                };
            });
        });

        return resumenFinal;
    } catch (error) {
        console.error("Error al obtener el cliente del administrador:", error);
        throw error;
    }
};

export const asignarActivosCliente = async(cliente_id, nombre_maquina, cantidad_requerida) => {
    try{
        const activoFijoRepositorio = AppDataSource.getRepository(ActivoFijo);
        const activos_disponibles = await activoFijoRepositorio
            .createQueryBuilder("activo")
            .where("activo.nombre = :nombre", {nombre: nombre_maquina})
            .andWhere("activo.cliente_id IS NULL")
            .limit(cantidad_requerida)
            .getMany();

        if(activos_disponibles.length < cantidad_requerida){
            return[null,`Stock insuficiente en bodega. Hay ${activos_disponibles.length}-${nombre_maquina} en bodega`];
        }
        
        const activo_actualizados = [];
        const ids_asignados = [];
        for(const activo of activos_disponibles){
            activo.cliente_id = cliente_id;
            const resultado = await activoFijoRepositorio.save(activo);
            activo_actualizados.push(resultado);
            ids_asignados.push(activo.activo_id);
        }

        await registrarMovimiento(
            "ASIGNACION",
            `Se asignaron ${activos_disponibles.length} ${nombre_maquina}(s) al cliente`,
            cliente_id,
            ids_asignados
        );

        return [activo_actualizados, null];
    }catch(error){
        console.error("Error al asignar:", error); 
        return [null, error.message];
    }
};

export const devolverActivosBodega = async(cliente_id, activos_ids) => {
    try{
        const activoFijoRepositorio = AppDataSource.getRepository(ActivoFijo);
        const los_activos = await activoFijoRepositorio
            .createQueryBuilder("activo")
            .where("activo.activo_id IN (:...ids)", {ids: activos_ids})
            .andWhere("activo.cliente_id = :cliente_id", {cliente_id: cliente_id})
            .getMany();

        if (los_activos.length !== activos_ids.length){
            return [null, `Error: no se logro devolver los activos.`];
        }

        const activos_devueltos = [];
        const ids_devueltos = [];
        for (const activo of los_activos){
            activo.cliente_id = null;
            const resultado = await activoFijoRepositorio.save(activo);
            activos_devueltos.push(resultado);
            ids_devueltos.push(activo.activo_id);
        }

        await registrarMovimiento(
            "DEVOLUCION",
            `Se retiraron ${los_activos.length} activo(s) del cliente y volvieron a bodega`,
            cliente_id,
            ids_devueltos
        );

        return [activos_devueltos, null];
    } catch(error) {
        console.error("Error al devolver a bodega:", error);
        return [null, error.message];
    }
};

export const confirmarRecepcionActivos = async(cliente_id, activos_ids, trabajador_id) => {
    try{
        const trabajadorRepositorio = AppDataSource.getRepository(TrabajadorSchema)
        const trabajador = await trabajadorRepositorio.findOne({
            where: {id: trabajador_id}
        });
        if(!trabajador){
            return[null,`Error: El trabajador con id ${trabajador_id} no existe en el sistema.`];
        }
        const nombre_trabajador = trabajador.nombre;

        const activoFijoRepositorio = AppDataSource.getRepository(ActivoFijo);
        const activos_enviados = await activoFijoRepositorio
            .createQueryBuilder("activo")
            .where("activo.activo_id IN (:...ids)", {ids: activos_ids})
            .andWhere("activo.cliente_id = :cliente_id", {cliente_id: cliente_id})
            .getMany();

        if(activos_enviados.length !== activos_ids.length){
            return[null,`Error: Se intento confirmar ${activos_ids.length} activos, pero se enviaron ${activos_enviados.length} a este cliente.`];
        }

        const activos_confirmados = [];
        for(const activo of activos_enviados){
            activo.trabajador_id = trabajador_id;
            const resultado = await activoFijoRepositorio.save(activo);
            activos_confirmados.push(resultado);

            await registrarMovimiento(
                "RECEPCION",
                `${nombre_trabajador} confirmó la recepción de ${activo.nombre} (${activo.codigo_inventario})`,
                cliente_id,
                activo.activo_id,
                trabajador_id
            );
        }

        return[activos_confirmados, null];
    }catch(error){
        console.error("Error al confirmar recepcion: ", error);
        return[null, error.message]
    }
}