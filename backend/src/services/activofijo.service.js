import { AppDataSource } from "../config/configDb.js";
import ActivoFijo from "../entity/activofijo.entity.js";

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

export const resumenActivos = async (cliente_id) => {

    try{
        const activoFijoRepositorio = AppDataSource.getRepository(ActivoFijo);
        
        const resumen = await activoFijoRepositorio
        .createQueryBuilder("activo")
        .select("activo.nombre", "nombre")
        .addSelect("COUNT(activo.id)", "cantidad")
        .where("activo.cliente_id = :id", { id: cliente_id })
        .groupBy("activo.nombre")
        .getRawMany();

        return resumen;
    }catch(error){
    console.error("Error al obtener resumen", error);
    return [null, "Error223"];
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
        for(const activo of activos_disponibles){
            activo.cliente_id = cliente_id;
            const resultado = await activoFijoRepositorio.save(activo);
            activo_actualizados.push(resultado);
        }

        return [activo_actualizados, null];

    }catch(error){
        console.error("Error al asignar:", error); 
        return [null, error.message];
    }
}

export const devolverActivosBodega = async(cliente_id, nombre_maquina, cantidad_devolver) => {

    try{
        const activoFijoRepositorio = AppDataSource.getRepository(ActivoFijo);

        const activos_cliente = await activoFijoRepositorio
            .createQueryBuilder("activo")
            .where("activo.nombre = :nombre", {nombre: nombre_maquina})
            .andWhere("activo.cliente_id = :cliente_id", {cliente_id: cliente_id})
            .limit(cantidad_devolver)
            .getMany();

        if(activos_cliente.length < cantidad_devolver){
            return [null,`Error: cliente no cuenta con ${cantidad_devolver}-${nombre_maquina}. Se encontraron ${activos_cliente.length}`];
        }

        const activo_devueltos = [];
        for (const activo of activos_cliente){
            activo.cliente_id = null;
            const resultado = await activoFijoRepositorio.save(activo);
            activo_devueltos.push(resultado);
        }

        return [activo_devueltos, null];
    } catch(error) {
        console.error("Error al devolver a bodega:", error);
        return [null, error.message];
    }
};