import cron from "node-cron";
import { actualizarEstadosContratos } from "../services/contrato.service.js";

const CADA_10_SEGUNDOS = '*/10 * * * * *' //PRUEBA
const MEDIA_NOCHE = "0 0 * * *";
const ANTES_MEDIODIA_Y_NOCHE = "59 59 11,23 * * *"; //11:59:59 y 23:59:59

export async function iniciarCronContratos() {

    // Ejecutar todos los días a las 00:00
    logCron("Actualizando estados de contratos al iniciar...");
    await actualizarEstadosContratos();

    cron.schedule(MEDIA_NOCHE, async () => {
        try {
            logCron("Actualizando estados de contratos (cron)...");
            await actualizarEstadosContratos();
        } catch (error) {
            logCron(`Error al actualizar estados: ${error}`);
        }
    }, {
        scheduled: true,
        timezone: "America/Santiago" // Asegurar que use las 11:59 y 23:59 de Chile
    });

    logCron("Cron de contratos iniciado.");

}

function logCron(mensaje) {
    const ahora = new Date();

    // Forzar el uso de la hora local de Chile
    const opciones = { timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false };

    // Formatear las partes por separado para construir el string limpio sin T ni Z

    const partes = new Intl.DateTimeFormat("es-CL", opciones).formatToParts(ahora);

    // partes contiene un array con {type: 'day', value: '08'}, etc.
    const deconstruct = {};
    partes.forEach(({ type, value }) => { deconstruct[type] = value; });

    // Armamos el formato exacto YYYY-MM-DD HH:mm
    const fechaFormateada = `${deconstruct.year}-${deconstruct.month}-${deconstruct.day} ${deconstruct.hour}:${deconstruct.minute}:${deconstruct.second}`;

    console.log(`[${fechaFormateada}] - ${mensaje}`);
}