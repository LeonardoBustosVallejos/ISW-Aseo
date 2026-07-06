import Contrato from "../entity/contratos/contratoComercial.entity.js";
import { AppDataSource } from "../config/configDb.js";
import Clientes from "../entity/cliente.entity.js";
import User from "../entity/user.entity.js";
import Sedes from "../entity/sede.entity.js";
import { createErrorMessage } from "../cleaners/extras.js";
import { getClienteByService, getSedeByService } from "./cliente.service.js";
import { getTopJerarquía } from "./user.service.js";
import ContratoAnexoSchema from "../entity/contratos/contratoAnexo.entity.js";
import { createMultipleDocumentosService } from "./archivo.service.js";


export async function createContratoComercialService(data, documentos, cliente_id, manager = null) {
    try {
        const execute = async (transactionManager) => {

            const contratoRepository = transactionManager.getRepository(Contrato);
            const clienteRepository = transactionManager.getRepository(Clientes);
            const sedeRepository = transactionManager.getRepository(Sedes)

            const {
                fechaInicio,
                fechaFinOriginal,
                fechaFinReal,
                jornada,
                monto,
                detalles,
                cantidadMinTrabajadores,
                cantidadMaxTrabajadores,
                tipoJornada,
                tamanoInstalacion,
                requiereGuardias,
                observacionesOperativas,
                sedes
            } = data
            if (!documentos || documentos.length === 0) throw [null,]

            // Validaciones básicas
            if (!fechaInicio || !fechaFinOriginal || !cliente_id) throw [null, createErrorMessage("Contrato", "Datos incompletos")]


            // Validar fechas
            if (new Date(fechaInicio) >= new Date(fechaFinOriginal)) throw [null, createErrorMessage("Fechas de contrato", "Fechas inválidas")]

            if (
                cantidadMinTrabajadores &&
                cantidadMaxTrabajadores &&
                (cantidadMaxTrabajadores - cantidadMinTrabajadores < 0)
            ) throw [null, createErrorMessage(`Contrato - Cantidad de trabajadores`, "Cantidad mínima no puede ser mayor a la máxima")]


            // Buscar cliente

            const [clienteFound, errCliente] = await getClienteByService({ cliente_id: cliente_id }, transactionManager)

            if (errCliente) throw [null, errCliente]

            // Obtener cliente raíz
            const [representante, errRep] = await getTopJerarquía(clienteFound.cliente_id, transactionManager)

            if (errRep) throw [null, errRep]


            // Validar sedes
            let sedesEncontradas = []

            if (sedes?.length > 0) {

                for (const sede of sedes) {
                    const sedeFound = await sedeRepository.findOne({ where: { sede_id: sede } })
                    if (!sedeFound || sedeFound.length < 1) throw [null, createErrorMessage("sede", "Una o más sedes no existen")]
                    sedesEncontradas.push({ sede_id: sedeFound.sede_id })
                }


            } else {
                // Si no se proporcionan sedes, asignar la sede principal del cliente
                const sedePrincipal = await sedeRepository.findOne({
                    where: {
                        cliente: { cliente_id },
                        tipo_sede: "PRINCIPAL"
                    }
                })
                if (!sedePrincipal) throw [null, createErrorMessage("sede", "Sede principal no encontrada para el cliente")]
                sedesEncontradas.push({ sede_id: sedePrincipal.sede_id })
            }

            // Estado automático
            const fechaActual = new Date()

            const estado = fechaActual >= new Date(fechaInicio) ? "VIGENTE" : "ESPERA"

            // Crear contrato
            const contrato = contratoRepository.create({
                codigoContrato:
                    `COM-${representante.cliente_id}-${Date.now()}`,
                fechaInicio,
                fechaFinOriginal,
                fechaFinReal: fechaFinReal || fechaFinOriginal,
                estado,
                jornada: jornada || "COMPLETA",
                monto: monto || 0,
                detalles: detalles || "Sin descripción",
                cantidadMinTrabajadores: cantidadMinTrabajadores || 0,
                cantidadMaxTrabajadores: cantidadMaxTrabajadores || 0,
                tipoJornada: tipoJornada || "DIURNA",
                tamanoInstalacion: tamanoInstalacion || null,
                requiereGuardias: requiereGuardias || false,
                observacionesOperativas: observacionesOperativas || null,
                cliente: { cliente_id: representante.cliente_id },
                sedes: sedesEncontradas
            })

            const resContrato = await contratoRepository.save(contrato)
            console.log("=>Contrato creado");

            //Continuar con los archivos/documentos
            let documentosCreados = [];

            if (Array.isArray(documentos) && documentos.length > 0) {

                const [docsContrato, errDocs] = await createMultipleDocumentosService(documentos,
                    { id_contrato_comercial: resContrato.id_contrato_comercial },
                    transactionManager
                );

                if (errDocs) throw [null, errDocs];

                documentosCreados = docsContrato;

                console.log("=>Documentos del contrato creados");
            }


            return [{ ...resContrato, documentos: documentosCreados }, null];
        }

        if (manager) return await execute(manager)

        return await AppDataSource.transaction(execute)

    } catch (error) {

        console.error(
            "Error creando contrato: ",
            error
        )

        if (Array.isArray(error)) {

            if (manager) throw error

            return error
        }

        if (manager) throw error

        return [null, "Error interno"]
    }
}

export async function createContratoAnexoService(data, contrato_id, manager = null, index = 1) {
    try {

        const execute = async (transactionManager) => {

            const contratoRepository = transactionManager.getRepository(Contrato)

            const anexoRepository = transactionManager.getRepository(ContratoAnexoSchema)
            const sedeRepository = transactionManager.getRepository(Sedes)

            const {
                numeroAnexo,
                fechaInicio,
                fechaFin,
                montoNuevo,
                cantidadMinTrabajadores,
                cantidadMaxTrabajadores,
                jornada,
                tipoJornada,
                tamanoInstalacion,
                requiereGuardias,
                observacionesOperativas,
                detalles,
                tipoAnexo,
                sedes
            } = data

            // Validaciones básicas
            if (!numeroAnexo || !fechaInicio || !contrato_id) throw [null, createErrorMessage(`Anexo ${index}`, "Datos incompletos")]

            // Buscar contrato
            const contrato = await contratoRepository.findOne({
                where: { id_contrato_comercial: contrato_id }
            })

            if (!contrato) throw [null, createErrorMessage("Contrato", "Contrato no encontrado")]


            let sedesEncontradas = []
            if (sedes) {
                for (const sede of sedes) {
                    const sedeFound = await sedeRepository.findOne({
                        where: sede
                    })
                    if (!sedeFound) throw [null, createErrorMessage("Contrato", "Sede no encontrada para el cliente")]
                    sedesEncontradas.push({ sede_id: sedeFound.sede_id })
                }
            }

            // Validar número anexo
            const existe = await anexoRepository.findOne({
                where: {
                    numeroAnexo,
                    contratoComercial: { id_contrato_comercial: contrato_id }
                }
            })

            if (existe) throw [null, createErrorMessage(`Anexo ${index}`, "Número de anexo ya registrado")]


            // Validar fechas
            if (fechaFin && new Date(fechaInicio) >= new Date(fechaFin)) throw [null, createErrorMessage(`Anexo ${index}`, "Rango de fechas inválido")]


            // Validar trabajadores
            if (
                cantidadMinTrabajadores &&
                cantidadMaxTrabajadores &&
                (cantidadMaxTrabajadores - cantidadMinTrabajadores < 0)
            ) throw [null, createErrorMessage(`Anexo ${index}`, "Cantidad mínima no puede ser mayor a la máxima")]


            // Crear anexo
            const anexo = anexoRepository.create({
                numeroAnexo,
                fechaInicio,
                fechaFin,
                montoNuevo,
                cantidadMinTrabajadores,
                cantidadMaxTrabajadores,
                jornada,
                tipoJornada,
                tamanoInstalacion,
                requiereGuardias,
                observacionesOperativas,
                detalles,
                tipoAnexo: tipoAnexo || "OTRO",
                contratoComercial: { id_contrato_comercial: contrato_id },
                sedes: sedesEncontradas
            })

            await anexoRepository.save(anexo)

            /**
             * Actualizar contrato vigente
             */

            let contratoActualizado = false

            // Renovación fecha
            if (fechaFin && new Date(fechaFin) > new Date(contrato.fechaFinReal)) {
                contrato.fechaFinReal = fechaFin
                contratoActualizado = true
            }

            // Cambio monto
            if (montoNuevo && montoNuevo > 0 && montoNuevo !== contrato.monto) {
                contrato.monto = montoNuevo
                contratoActualizado = true
            }

            // Trabajadores mínimos
            if (cantidadMinTrabajadores && cantidadMinTrabajadores !== contrato.cantidadMinTrabajadores) {
                contrato.cantidadMinTrabajadores = cantidadMinTrabajadores
                contratoActualizado = true
            }

            // Trabajadores máximos
            if (cantidadMaxTrabajadores && cantidadMaxTrabajadores !== contrato.cantidadMaxTrabajadores) {
                contrato.cantidadMaxTrabajadores = cantidadMaxTrabajadores
                contratoActualizado = true
            }

            // Jornada contractual
            if (jornada && jornada !== contrato.jornada) {
                contrato.jornada = jornada
                contratoActualizado = true
            }

            // Tipo jornada
            if (tipoJornada && tipoJornada !== contrato.tipoJornada) {
                contrato.tipoJornada = tipoJornada
                contratoActualizado = true
            }

            // Tamaño instalación
            if (tamanoInstalacion && tamanoInstalacion !== contrato.tamanoInstalacion) {
                contrato.tamanoInstalacion = tamanoInstalacion
                contratoActualizado = true
            }

            // Guardias
            if (requiereGuardias !== undefined && requiereGuardias !== contrato.requiereGuardias) {
                contrato.requiereGuardias = requiereGuardias
                contratoActualizado = true
            }

            // Observaciones operativas
            if (observacionesOperativas) {
                contrato.observacionesOperativas = observacionesOperativas
                contratoActualizado = true
            }

            // Detalles
            if (detalles) {
                contrato.detalles = detalles
                contratoActualizado = true
            }

            // Guardar cambios contrato
            if (contratoActualizado) {
                await contratoRepository.save({ ...contrato, updatedAt: new Date() })
            }

            return [anexo, null]
        }

        if (manager) return await execute(manager)

        return await AppDataSource.transaction(execute)

    } catch (error) {
        console.error("Error creando anexo", error)
        if (Array.isArray(error)) {
            if (manager) throw error
            return error
        }
        if (manager) throw error
        return [null, "Error interno"]
    }
}

export async function createAnexosYDocumentos(anexos, sedes = [], id_contrato_comercial, manager = null) {
    try {
        const execute = async (transactionManager) => {
            const anexosCreados = []
            let index = 1
            for (const anexoData of anexos) {
                const { datos } = anexoData
                datos.sedes = datos.sedes ? datos.sedes : sedes
                const [anexoCreado, errAnexo] = await createContratoAnexoService({ ...datos, sedes }, id_contrato_comercial, transactionManager, index)
                if (errAnexo) throw [null, errAnexo]

                let documentosAnexo = []

                if (Array.isArray(anexoData.documentos) && anexoData.documentos.length > 0) {
                    const [docsAnexo, errDocsAnexo] = await createMultipleDocumentosService(anexoData.documentos, { anexo_id: anexoCreado.id_anexo }, transactionManager)
                    if (errDocsAnexo) throw [null, errDocsAnexo]
                    documentosAnexo = docsAnexo
                }

                anexosCreados.push({ ...anexoCreado, documentos: documentosAnexo })
                index++
            }
            console.log("=>Anexos Creados");

            return [anexosCreados, null]
        }

        if (manager) return await execute(manager)

        return await AppDataSource.transaction(execute)

    } catch (error) {
        console.error("Error creando anexo", error)
        if (Array.isArray(error)) {
            if (manager) throw error
            return error
        }
        if (manager) throw error
        return [null, "Error interno"]
    }
}

export async function getContratoComercialService(contrato = null, data = null, manager = null) {
    try {
        const execute = async (transactionManager) => {
            let contrato_id = null, codigoContrato = null, cliente_id = null, sede_id = null
            if (contrato) {
                contrato_id = contrato.contrato_id
                codigoContrato = contrato.codigoContrato
            }
            if (data) {
                cliente_id = data.cliente_id
                sede_id = data.sede_id

            }

            const contratoRepository = transactionManager.getRepository(Contrato)

            const where = {}
            if (contrato_id) where.id_contrato_comercial = contrato_id
            if (codigoContrato) where.codigoContrato = codigoContrato
            if (cliente_id) where.cliente = { cliente_id }
            if (sede_id) where.sedes = { sede_id }

            const contratos = await contratoRepository.find({
                relations: ["cliente", "sedes", "documentos"],
                where
            })


            if (!contratos || contratos.length === 0) return [null, "Contrato no encontrado"]

            return [contratos, null]
        }
        if (manager) return await execute(manager)

        return await AppDataSource.transaction(execute)
    } catch (error) {
        console.error("Error obteniendo contratos: ", error);
        if (Array.isArray(error)) {

            if (manager) throw error

            return error
        }

        if (manager) throw error

        return [null, "Error interno"]
    }
}

export async function getAnexoComercialService(anexo_id = null, sede_id = null, manager = null) {
    try {
        const execute = async (transactionManager) => {
            const anexoRepository = transactionManager.getRepository(ContratoAnexoSchema)
            const where = {}
            if (anexo_id) where.id_anexo = anexo_id
            if (sede_id) where.sedes = { sede_id: sede_id }

            const anexo = await anexoRepository.find({
                where,
                relations: ["contratoComercial", "sedes", "documentos"],
            })
            if (!anexo || anexo.length === 0) return [null, "Anexos no encontrados"]

            return [anexo, null]
        }
        if (manager) return await execute(manager)

        return await AppDataSource.transaction(execute)

    } catch (error) {
        console.error("Error obteniendo anexos: ", error);
        if (Array.isArray(error)) {

            if (manager) throw error

            return error
        }

        if (manager) throw error

        return [null, "Error interno"]
    }
}

function puedeIniciarContrato(contrato) {
    return (
        contrato.sedes.length > 0 &&
        contrato.cantidadMaxTrabajadores > 0
    );
}

export async function actualizarEstadosContratos() {
    try {
        const contratoRepository = AppDataSource.getRepository(Contrato);

        const contratos = await contratoRepository.find({
            relations: {
                sedes: true,
                documentos: true,
                // agrega las relaciones que necesite puedeIniciarContrato()
            }
        });

        const hoy = new Date();

        for (const contrato of contratos) {

            //El cron no los modifica
            if (contrato.estado === "SUSPENDIDO" ||
                contrato.estado === "CANCELADO" ||
                contrato.estado === "TERMINADO"
            ) {
                continue;
            }

            let nuevoEstado = contrato.estado;

            if (hoy < new Date(contrato.fechaInicio)) {
                // Aún no comienza
                nuevoEstado = "ESPERA";

            } else if (puedeIniciarContrato(contrato)) {
                // Ya puede comenzar
                nuevoEstado = "VIGENTE";

                // Ya debería haber comenzado pero aún no puede
            } else {
                nuevoEstado = "ATRASADO";
            }

            // Solo un contrato vigente puede terminar automáticamente
            if (contrato.estado === "VIGENTE" && hoy > new Date(contrato.fechaFinReal)) {
                nuevoEstado = "TERMINADO";
            }

            //Si hubo cambio de estado
            if (nuevoEstado !== contrato.estado) {
                contrato.estado = nuevoEstado;
                await contratoRepository.save(contrato);
            }
        }

        console.log("Estados de contratos actualizados.");
    } catch (error) {
        console.error(error);
    }
}

export async function getVistaContratosService(filtros = {}, manager = null) {
    try {
        const execute = async (transactionManager) => {

            const contratoRepository = transactionManager.getRepository(Contrato);

            const {
                contrato_id,
                codigoContrato,
                cliente_id,
                estado,
                sede_id
            } = filtros;

            const where = {};

            if (contrato_id) where.id_contrato_comercial = contrato_id;
            if (codigoContrato) where.codigoContrato = codigoContrato;
            if (cliente_id) where.cliente = { cliente_id };
            if (estado) where.estado = estado;
            if (sede_id) where.sedes = { sede_id };

            const contratos = await contratoRepository.find({
                where,
                relations: [
                    "cliente",
                    "sedes",
                    "documentos",
                    "anexos",
                    "anexos.sedes",
                    "anexos.documentos"
                ],
                order: {
                    createdAt: "DESC"
                }
            });

            if (!contratos.length)
                return [null, "No se encontraron contratos"];

            return [contratos, null];
        };

        if (manager) return await execute(manager);

        return await AppDataSource.transaction(execute);

    } catch (error) {
        console.error("Error obteniendo vista de contratos:", error);

        if (Array.isArray(error)) {
            if (manager) throw error;
            return error;
        }

        if (manager) throw error;

        return [null, "Error interno"];
    }
}

//NOTA: el contrato debería agregarse al mismo tiempo que se registra un nuevo cliente 