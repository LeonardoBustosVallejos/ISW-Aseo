import cron from "node-cron";
import { actualizarEstadosContratos } from "../services/contrato.service.js";

const CADA_10_SEGUNDOS = '*/10 * * * * *'
const MEDIA_NOCHE = "0 0 * * *"

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
    });

    logCron("Cron de contratos iniciado.");

}

function logCron(mensaje) {
    const ahora = new Date();

    const fecha = ahora.toISOString().replace("T", " ").substring(0, 19);

    console.log(`[${fecha}] - ${mensaje}`);
}