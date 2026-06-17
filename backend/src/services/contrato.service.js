import Contrato from "../entity/contratos/contratoComercial.entity.js";
import { AppDataSource } from "../config/configDb.js";
import Clientes from "../entity/cliente.entity.js";
import User from "../entity/user.entity.js";
import Sedes from "../entity/sede.entity.js";
import { createErrorMessage } from "../cleaners/extras.js";
import { getClienteByService, getSedeByService } from "./cliente.service.js";
import { getTopJerarquía } from "./user.service.js";
import ContratoAnexoSchema from "../entity/contratos/contratoAnexo.entity.js";


export async function createContratoComercialService(data, cliente_id, manager = null) {
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
                cantidadMaxTrabajadores,
                tipoJornada,
                tamanoInstalacion,
                requiereGuardias,
                observacionesOperativas,
                sedes
            } = data

            // Validaciones básicas
            if (!fechaInicio || !fechaFinOriginal || !cliente_id) throw [null, createErrorMessage("contrato", "Datos incompletos")]


            // Validar fechas
            if (new Date(fechaInicio) >= new Date(fechaFinOriginal)) throw [null, createErrorMessage("fecha", "Fechas inválidas")]

            // Validar máximo trabajadores
            if (cantidadMaxTrabajadores && cantidadMaxTrabajadores <= 0) throw [null, createErrorMessage("trabajadores", "Cantidad máxima inválida")]


            // Buscar cliente
            const [clienteFound, errCliente] = await getClienteByService({ cliente_id }, transactionManager)

            if (errCliente) throw [null, errCliente]

            // Obtener cliente raíz
            const [representante, errRep] = await getTopJerarquía(clienteFound.cliente_id, transactionManager)

            if (errRep) throw [null, errRep]

            // Validar sedes
            let sedesEncontradas = []

            if (sedes?.length > 0) {

                for (const sede of sedes) {
                    const sedeFound = await sedeRepository.findOne({ where: sede })
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
                cantidadMaxTrabajadores: cantidadMaxTrabajadores || null,
                tipoJornada: tipoJornada || "DIURNA",
                tamanoInstalacion: tamanoInstalacion || null,
                requiereGuardias: requiereGuardias || false,
                observacionesOperativas: observacionesOperativas || null,
                cliente: { cliente_id: representante.cliente_id },
                sedes: sedesEncontradas
            })

            await contratoRepository.save(contrato)

            return [contrato, null]
        }

        if (manager)
            return await execute(manager)

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

export async function createContratoAnexoService(data, contrato_id, manager = null) {
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
            if (!numeroAnexo || !fechaInicio || !contrato_id) throw [null, createErrorMessage("anexo", "Datos incompletos")]

            // Buscar contrato
            const contrato = await contratoRepository.findOne({
                where: { id_contrato_comercial: contrato_id }
            })

            if (!contrato) throw [null, createErrorMessage("contrato", "Contrato no encontrado")]


            let sedesEncontradas = []
            if (sedes) {
                for (const sede of sedes) {
                    const sedeFound = await sedeRepository.findOne({
                        where: sede
                    })
                    if (!sedeFound) throw [null, createErrorMessage("sede", "Sede principal no encontrada para el cliente")]
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

            if (existe) throw [null, createErrorMessage("anexo", "Número de anexo ya registrado")]


            // Validar fechas
            if (fechaFin && new Date(fechaInicio) >= new Date(fechaFin)) throw [null, createErrorMessage("fecha", "Rango de fechas inválido")]


            // Validar trabajadores
            if (
                cantidadMinTrabajadores &&
                cantidadMaxTrabajadores &&
                cantidadMinTrabajadores > cantidadMaxTrabajadores
            ) throw [null, createErrorMessage("trabajadores", "Cantidad mínima no puede ser mayor a la máxima")]


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
                sedes: sedesEncontradas.length > 0 ? sedesEncontradas : null
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

//NOTA: el contrato debería agregarse al mismo tiempo que se registra un nuevo cliente o trabajador