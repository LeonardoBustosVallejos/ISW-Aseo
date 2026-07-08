import { ReturningStatementNotSupportedError } from "typeorm";
import { AppDataSource } from "../config/configDb.js";
import ActivoFijo from "../entity/activofijo.entity.js";
import SedeSchema from "../entity/sede.entity.js";
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

export const obtenerStockBodegaService = async () => {
    try {
        const activoFijoRepositorio = AppDataSource.getRepository(ActivoFijo);
        
        const stock = await activoFijoRepositorio
            .createQueryBuilder("activo")
            .select("activo.nombre", "nombre")
            .addSelect("COUNT(activo.activo_id)", "cantidad_disponible")
            .where("activo.sede_id IS NULL")
            .andWhere("activo.cliente_id IS NULL")
            .groupBy("activo.nombre")
            .getRawMany();
            
        const stockFormateado = stock.map(item => ({
            nombre: item.nombre,
            cantidad_disponible: parseInt(item.cantidad_disponible, 10)
        }));

        return [stockFormateado, null];
    } catch (error) {
        console.error("Error al obtener stock de bodega:", error);
        return [null, "Error al cargar el inventario"];
    }
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
                sede_id: null,
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
                    sede_id: null,
                    compania: cliente.nombreCliente || "Sin Nombre",
                    ubicacion: "Sin Dirección",
                    estadoSuministros: ['rojo', 'naranja', 'verde'], 
                    alerta: true,
                }];
            }
            return cliente.sede.map(sede => {
                return {
                    id: cliente.rutCliente,
                    sede_id: sede.sede_id, 
                    compania: cliente.nombreCliente || "Sin Nombre",
                    ubicacion: sede.direccion || "Sin Dirección",
                    estadoSuministros: ['rojo', 'naranja', 'verde'], 
                    alerta: true,
                };
            });
        });

        return resumenFinal;
    } catch (error) {
        console.error("Error al obtener el cliente del administrador:", error);
        throw error;
    }
};

export const obtenerActivosPorSede = async (sede_id) => {
    try {
        const sedeRepository = AppDataSource.getRepository(SedeSchema);
        const sedeEncontrada = await sedeRepository.findOne({
            where: { sede_id: sede_id }
        });

        if (!sedeEncontrada) {
            throw new Error("La sede solicitada no existe.");
        }

        const activoFijoRepository = AppDataSource.getRepository(ActivoFijo);
        const activos = await activoFijoRepository.find({
            where: { sede_id: sede_id }
        });
        return activos;

    } catch (error) {
        console.error("Error en obtenerActivosPorSede:", error);
        throw error;
    }
};

export const asignarActivosCliente = async(cliente_id, sede_id, nombre_maquina, cantidad_requerida) => {
    try{
        const sedeRepository = AppDataSource.getRepository(SedeSchema);
        const sede = await sedeRepository.findOne({ 
            where: { 
                sede_id: sede_id, 
                cliente: { cliente_id: cliente_id } 
            } 
        });
        
        if(!sede){
            return [null, "La sede especificada no existe o no pertenece a este cliente."];
        }

        const activoFijoRepositorio = AppDataSource.getRepository(ActivoFijo);
        const activos_disponibles = await activoFijoRepositorio
            .createQueryBuilder("activo")
            .where("activo.nombre = :nombre", {nombre: nombre_maquina})
            .andWhere("activo.sede_id IS NULL")
            .andWhere("activo.cliente_id IS NULL") 
            .limit(cantidad_requerida)
            .getMany();

        if(activos_disponibles.length < cantidad_requerida){
            return[null,`Stock insuficiente en bodega. Hay ${activos_disponibles.length} ${nombre_maquina} en bodega`];
        }
        
        const activo_actualizados = [];
        const ids_asignados = [];
        for(const activo of activos_disponibles){
            activo.sede_id = sede_id; 
            activo.cliente_id = cliente_id; 
            
            const resultado = await activoFijoRepositorio.save(activo);
            activo_actualizados.push(resultado);
            ids_asignados.push(activo.activo_id);
        }

        await registrarMovimiento(
            "ASIGNACION",
            `Se asignaron ${activos_disponibles.length} ${nombre_maquina}(s) a la sede`,
            cliente_id, 
            sede_id, 
            ids_asignados
        );

        return [activo_actualizados, null];
    }catch(error){
        console.error("Error al asignar:", error); 
        return [null, error.message];
    }
};

export const devolverActivosBodega = async(cliente_id, sede_id, activos_ids) => {
    try{
        const activoFijoRepositorio = AppDataSource.getRepository(ActivoFijo);
        
        const los_activos = await activoFijoRepositorio
            .createQueryBuilder("activo")
            .where("activo.activo_id IN (:...ids)", {ids: activos_ids})
            .andWhere("activo.sede_id = :sede_id", {sede_id: sede_id})
            .andWhere("activo.cliente_id = :cliente_id", {cliente_id: cliente_id})
            .getMany();

        if (los_activos.length !== activos_ids.length){
            return [null, `Error: no se logro devolver los activos. Verifique que los IDs pertenezcan a la sede y cliente correctos.`];
        }

        const activos_devueltos = [];
        const ids_devueltos = [];
        for (const activo of los_activos){
            activo.cliente_id = null;
            activo.sede_id = null; 
            activo.recepcion_confirmada = false;
            const resultado = await activoFijoRepositorio.save(activo);
            activos_devueltos.push(resultado);
            ids_devueltos.push(activo.activo_id);
        }

        await registrarMovimiento(
            "DEVOLUCION",
            `Se retiraron ${los_activos.length} activo(s) de la sede y volvieron a bodega`,
            cliente_id,
            sede_id,
            ids_devueltos
        );

        return [activos_devueltos, null];
    } catch(error) {
        console.error("Error al devolver a bodega:", error);
        return [null, error.message];
    }
};

export const confirmarRecepcionActivos = async(cliente_id, sede_id, activos_ids, trabajador_id) => {
    try{
        const trabajadorRepositorio = AppDataSource.getRepository(TrabajadorSchema)
        const trabajador = await trabajadorRepositorio.findOne({
            where: {id: trabajador_id}
        });
        
        if(!trabajador){
            return[null,`Error: El trabajador con id ${trabajador_id} no existe en el sistema.`];
        }
        const nombre_trabajador = trabajador.nombreCompleto;

        const activoFijoRepositorio = AppDataSource.getRepository(ActivoFijo);
        
        const activos_enviados = await activoFijoRepositorio
            .createQueryBuilder("activo")
            .where("activo.activo_id IN (:...ids)", {ids: activos_ids})
            .andWhere("activo.sede_id = :sede_id", {sede_id: sede_id})
            .andWhere("activo.cliente_id = :cliente_id", {cliente_id: cliente_id})
            .andWhere("activo.recepcion_confirmada = :confirmado", {confirmado: false})
            .getMany();

        if(activos_enviados.length !== activos_ids.length){
            return[null,`Error: Algunos activos no coinciden con la sede, o ya fueron confirmados anteriormente.`];
        }

        const activos_confirmados = [];
        for(const activo of activos_enviados){
            activo.recepcion_confirmada = true;
            const resultado = await activoFijoRepositorio.save(activo);
            activos_confirmados.push(resultado);

            await registrarMovimiento(
                "RECEPCION",
                `${nombre_trabajador} confirmó la recepción de ${activo.nombre} (${activo.codigo_inventario})`,
                cliente_id,
                sede_id,
                [activo.activo_id], 
                trabajador_id,
                nombre_trabajador
            );
        }

        return[activos_confirmados, null];
    }catch(error){
        console.error("Error al confirmar recepcion: ", error);
        return[null, error.message]
    }
};