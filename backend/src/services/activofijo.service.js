import { AppDataSource } from "../config/configDb.js";
import ActivoFijo from "../entity/activofijo.entity.js";

const generarCodigo = async (prefijo) => {

    const activoFijoRepositorio = AppDataSource.getRepository(ActivoFijo);

    const ultimoActivo = await activoFijoRepositorio
    .createQueryBuilder("activo")
    .where("activo.codigo_inventario LIKE :prefijo", {prefijo: `${prefijo}-%`})
    .orderBy("activo.codigo_inventario", "DESC")
    .getOne();

    if(!ultimoActivo){
        return `${prefijo}-001`;
    }

    const partes = ultimoActivo.codigo_inventario.split('-');
    const ultimoNumero = parseInt(partes[1], 10);
    const nuevoNumero = ultimoNumero + 1;
    const ultimoaTexto = nuevoNumero.toString().padStart(3,'0');

    return `${prefijo}-${ultimoaTexto}`;
};

export const registrarNuevoActivo = async (datosActivo) => {

    try{
        const activoFijoRepositorio = AppDataSource.getRepository(ActivoFijo);

        const nombreLimpio = datosActivo.nombre.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const prefijoDinamico = nombreLimpio.substring(0, 3).toUpperCase();
        const codigoGenerado = await generarCodigo(prefijoDinamico);
        const nuevoActivo = activoFijoRepositorio.create({
            ...datosActivo,
            codigo_inventario: codigoGenerado
        });

        const resultado = await activoFijoRepositorio.save(nuevoActivo);
        return resultado;
    }catch(error){
        console.error("Error gigante de BD:", error); 
        return [null, error.message];
    }
};

export const resumenActivos = async (clienteId) => {

    try{
        const activoFijoRepositorio = AppDataSource.getRepository(ActivoFijo);
        
        const resumen = await activoFijoRepositorio
        .createQueryBuilder("activo")
        .select("activo.nombre", "nombre")
        .addSelect("COUNT(activo.id)", "cantidad")
        .where("activo.cliente_id = :id", { id: clienteId })
        .groupBy("activo.nombre")
        .getRawMany();

        return resumen;
    }catch(error){
    console.error("Error223:", error);
    return [null, "Error223"];
    }
};