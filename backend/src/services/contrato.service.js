import Contrato from "../entity/contratos/contratoComercial.entity.js";
import { AppDataSource } from "../config/configDb.js";
import Clientes from "../entity/cliente.entity.js";
import User from "../entity/user.entity.js";
import Sedes from "../entity/sede.entity.js";
import { createErrorMessage } from "../cleaners/extras.js";
import { getClienteByService, getSedeByService, registerClienteJerarquicoService, registerSedesJerarquicoService, updateClienteRelacionesService, updateRelacionesContratoYAnexoService } from "./cliente.service.js";
import { getTopJerarquía } from "./user.service.js";
import ContratoAnexoSchema from "../entity/contratos/contratoAnexo.entity.js";
import { createMultipleDocumentosService } from "./archivo.service.js";
import ClienteSchema from "../entity/cliente.entity.js";
import { In } from "typeorm"
import { calcularPersonalTotal, obtenerLimitePersonalContrato } from "../helpers/personal.helper.js";


export async function createContratoComercialService(data, documentos, cliente_id, manager = null) {
    try {
        const execute = async (transactionManager) => {

            const contratoRepository = transactionManager.getRepository(Contrato)
            const clienteRepository = transactionManager.getRepository(Clientes)
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

            if (!documentos || documentos.length === 0)
                throw [null, createErrorMessage("Contrato", "Debe incluir documentos")]

            if (!fechaInicio || !fechaFinOriginal || !cliente_id)
                throw [null, createErrorMessage("Contrato", "Datos incompletos")]

            if (new Date(fechaInicio) >= new Date(fechaFinOriginal))
                throw [null, createErrorMessage("Fechas de contrato", "Fechas inválidas")]

            if (
                cantidadMinTrabajadores &&
                cantidadMaxTrabajadores &&
                (cantidadMaxTrabajadores - cantidadMinTrabajadores < 0)
            )
                throw [null, createErrorMessage("Contrato", "Cantidad mínima no puede ser mayor a la máxima")]

            const [clienteFound, errCliente] =
                await getClienteByService({ cliente_id }, transactionManager)

            if (errCliente) throw [null, errCliente]

            // Obtener cliente raíz
            const [representante, errRep] = await getTopJerarquía(clienteFound.cliente_id, transactionManager)

            if (errRep) throw [null, errRep]

            let sedesEntities = []
            /*
            if (sedes?.length > 0) {

                sedesEntities = await sedeRepository.findBy({
                    sede_id: sedes
                })

                if (sedesEntities.length !== sedes.length) {
                    throw [null, createErrorMessage("Sede", "Una o más sedes no existen")]
                }

            } else {

                const sedePrincipal = await sedeRepository.findOne({
                    where: {
                        cliente: { cliente_id },
                        tipo_sede: "PRINCIPAL"
                    }
                })

                if (!sedePrincipal)
                    throw [null, createErrorMessage("Sede", "Sede principal no encontrada")]

                sedesEntities = [sedePrincipal]
            }
            */
            const fechaActual = new Date()
            const estado = fechaActual >= new Date(fechaInicio) ? "VIGENTE" : "ESPERA"

            const contrato = contratoRepository.create({
                codigoContrato: `COM-${representante.cliente_id}-${Date.now()}`,
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
                cliente: [representante],

                sedes: sedesEntities
            })

            const resContrato = await contratoRepository.save(contrato)
            //console.log(contrato);

            //Continuar con los archivos/documentos
            let documentosCreados = [];

            const [docsContrato, errDocs] =
                await createMultipleDocumentosService(
                    documentos,
                    { id_contrato_comercial: resContrato.id_contrato_comercial },
                    transactionManager
                )

            if (errDocs) throw [null, errDocs]

            documentosCreados = docsContrato

            return [{ ...resContrato, documentos: documentosCreados }, null]
        }

        if (manager) return await execute(manager)

        return await AppDataSource.transaction(execute)

    } catch (error) {

        console.error("Error creando contrato:", error)

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

            if (!numeroAnexo || !fechaInicio || !contrato_id)
                throw [null, createErrorMessage(`Anexo ${index}`, "Datos incompletos")]

            const contrato = await contratoRepository.findOne({
                where: { id_contrato_comercial: contrato_id },
                relations: ["sedes"]
            })

            if (!contrato)
                throw [null, createErrorMessage("Contrato", "Contrato no encontrado")]

            let sedesEntities = []
            /*
                        if (sedes?.length > 0) {
            
                            sedesEntities = await sedeRepository.findBy({
                                sede_id: In(sedes)
                            })
            
                            if (sedesEntities.length !== sedes.length) {
                                throw [null, createErrorMessage("Sede", "Sede no encontrada")]
                            }
                        }
            */
            const existe = await anexoRepository.findOne({
                where: {
                    numeroAnexo,
                    contratoComercial: { id_contrato_comercial: contrato_id }
                }
            })

            if (existe)
                throw [null, createErrorMessage(`Anexo ${index}`, "Número de anexo ya registrado")]

            if (fechaFin && new Date(fechaInicio) >= new Date(fechaFin))
                throw [null, createErrorMessage(`Anexo ${index}`, "Rango de fechas inválido")]

            if (
                cantidadMinTrabajadores &&
                cantidadMaxTrabajadores &&
                (cantidadMaxTrabajadores - cantidadMinTrabajadores < 0)
            )
                throw [null, createErrorMessage(`Anexo ${index}`, "Cantidad mínima no puede ser mayor a la máxima")]

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

                sedes: sedesEntities
            })

            const savedAnexo = await anexoRepository.save(anexo)


            let contratoActualizado = false

            if (fechaFin && new Date(fechaFin) > new Date(contrato.fechaFinReal)) {
                contrato.fechaFinReal = fechaFin
                contratoActualizado = true
            }

            if (montoNuevo && montoNuevo !== contrato.monto) {
                contrato.monto = montoNuevo
                contratoActualizado = true
            }

            if (cantidadMinTrabajadores !== contrato.cantidadMinTrabajadores) {
                contrato.cantidadMinTrabajadores = cantidadMinTrabajadores
                contratoActualizado = true
            }

            if (cantidadMaxTrabajadores !== contrato.cantidadMaxTrabajadores) {
                contrato.cantidadMaxTrabajadores = cantidadMaxTrabajadores
                contratoActualizado = true
            }

            if (jornada && jornada !== contrato.jornada) {
                contrato.jornada = jornada
                contratoActualizado = true
            }

            if (tipoJornada && tipoJornada !== contrato.tipoJornada) {
                contrato.tipoJornada = tipoJornada
                contratoActualizado = true
            }

            if (tamanoInstalacion && tamanoInstalacion !== contrato.tamanoInstalacion) {
                contrato.tamanoInstalacion = tamanoInstalacion
                contratoActualizado = true
            }

            if (requiereGuardias !== undefined) {
                contrato.requiereGuardias = requiereGuardias
                contratoActualizado = true
            }

            if (observacionesOperativas) {
                contrato.observacionesOperativas = observacionesOperativas
                contratoActualizado = true
            }

            if (detalles) {
                contrato.detalles = detalles
                contratoActualizado = true
            }

            if (contratoActualizado) {
                await contratoRepository.save(contrato)
            }

            return [savedAnexo, null]
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

                const sedesFinal = datos.sedes?.length ? datos.sedes : sedes

                const [anexoCreado, errAnexo] =
                    await createContratoAnexoService(
                        { ...datos, sedes: sedesFinal },
                        id_contrato_comercial,
                        transactionManager,
                        index
                    )

                if (errAnexo) throw [null, errAnexo]

                let documentosAnexo = []

                if (Array.isArray(anexoData.documentos) && anexoData.documentos.length > 0) {

                    const [docsAnexo, errDocsAnexo] =
                        await createMultipleDocumentosService(
                            anexoData.documentos,
                            { anexo_id: anexoCreado.id_anexo },
                            transactionManager
                        )

                    if (errDocsAnexo) throw [null, errDocsAnexo]

                    documentosAnexo = docsAnexo
                }

                anexosCreados.push({
                    ...anexoCreado,
                    documentos: documentosAnexo
                })

                index++
            }

            return [anexosCreados, null]
        }

        if (manager) return await execute(manager)

        return await AppDataSource.transaction(execute)

    } catch (error) {

        console.error("Error creando anexos", error)

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

            const qb = contratoRepository
                .createQueryBuilder("contrato")
                .leftJoinAndSelect("contrato.cliente", "cliente")
                .leftJoinAndSelect("contrato.sedes", "sede")
                .leftJoinAndSelect("sede.cliente", "clienteSede")
                .leftJoinAndSelect("contrato.documentos", "documento")
                .leftJoinAndSelect("contrato.anexos", "anexo")
                .leftJoinAndSelect("anexo.sedes", "anexoSede")
                .leftJoinAndSelect("anexo.documentos", "anexoDocumento")
                .where("cliente.tipoCliente <> :tipoCliente", { tipoCliente: "FILIAL" })
                .orderBy("contrato.createdAt", "DESC");

            if (contrato_id) {
                qb.andWhere("contrato.id_contrato_comercial = :contrato_id", {
                    contrato_id
                });
            }

            if (codigoContrato) {
                qb.andWhere("contrato.codigoContrato = :codigoContrato", {
                    codigoContrato
                });
            }

            if (estado) {
                qb.andWhere("contrato.estado = :estado", {
                    estado
                });
            }

            if (cliente_id) {
                qb.andWhere("cliente.cliente_id = :cliente_id", {
                    cliente_id
                });
            }

            if (sede_id) {
                qb.andWhere("sede.sede_id = :sede_id", {
                    sede_id
                });
            }

            const contratos = await qb.getMany();

            if (!contratos.length)
                return [null, "No se encontraron contratos"];

            return [contratos, null];
        };

        if (manager)
            return await execute(manager);

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


export async function createContratoClienteExistenteService(data, cliente_id, manager = null) {
    try {
        const execute = async (transactionManager) => {
            const {
                contrato,
                metadataDocumentos = [],
                anexos = [],

                nuevasSedes = [],
                sedesSeleccionadas = [],

                filiales = [],
                nuevasFiliales = []
            } = data

            /*
            1. Cliente, ver que exista
            */
            const [cliente, errCliente] = await getClienteByService(
                { cliente_id: cliente_id },
                transactionManager
            )
            if (errCliente) throw [null, errCliente]

            const totalPersonal = calcularPersonalNuevoContratoExistente(
                nuevasSedes,
                filiales,
                nuevasFiliales
            );

            const limitePersonal = obtenerLimitePersonalContrato(
                contrato,
                anexos
            );

            if (limitePersonal > 0 && totalPersonal > limitePersonal) throw [null, createErrorMessage("Contrato", `La estimación de personal (${totalPersonal}) excede el máximo permitido (${limitePersonal}).`)];


            //Agregar los ids y que no se reptan
            let sedes_ids = [...sedesSeleccionadas]
            let clientes_ids = [cliente.cliente_id]
            /*
            2. Registrar sedes nuevas
            */
            let sedesNuevas = []
            if (Array.isArray(nuevasSedes) && nuevasSedes.length > 0) {

                const [sedesCreadas, errSedes] = await registerSedesJerarquicoService(
                    nuevasSedes,
                    cliente_id,
                    transactionManager
                )
                if (errSedes) throw [null, errSedes]

                sedes_ids.push(...sedesCreadas.map(s => s.sede_id));
                sedesNuevas = sedesCreadas
                console.log('=>Nuevas sedes creadas');

            }


            /*
            3. Registrar sedes a filiales
            */
            let sedesFiliales = []
            for (const filial of filiales) {

                let sedesFilial = [...filial.sedesSeleccionadas];
                clientes_ids.push(filial.cliente_id)


                if (Array.isArray(filial.nuevasSedes) && filial.nuevasSedes.length > 0) {
                    const [nuevas, err] = await registerSedesJerarquicoService(
                        filial.nuevasSedes,
                        filial.cliente_id,
                        transactionManager
                    )

                    if (err) throw [null, err];


                    sedesFilial.push(
                        ...nuevas.map(s => s.sede_id)
                    );
                    sedesFiliales.push(...nuevas)
                }

                sedes_ids.push(...sedesFilial);

            }
            /*
            4. Crear nuevas filiales
            */
            let filialesCreadas = []

            for (const filial of nuevasFiliales) {
                const [filialCreada, errFilial] = await registerClienteJerarquicoService(filial.cliente, filial.sedes, [], [], cliente_id, transactionManager)
                if (errFilial) throw [null, errFilial]
                filialesCreadas.push(filialCreada)
                clientes_ids.push(filialCreada.cliente_id)
                sedes_ids.push(...filialCreada.sedes.map(s => s.sede_id))
            }
            if (filialesCreadas.length > 0) console.log('=>Nuevas filiales creadas');


            /*
            5.- Crear contrato
            */
            const [contratoCreado, errContrato] = await createContratoComercialService(
                contrato,
                metadataDocumentos,
                cliente_id,
                transactionManager
            );
            if (errContrato) throw [null, errContrato];
            console.log('=>Contrato creado');

            //Dejar los ids sin que se repita ninguno
            sedes_ids = [...new Set(sedes_ids)];
            clientes_ids = [...new Set(clientes_ids)];

            /*
            6.- Agrega relaciones con clientes y filiales
            */
            for (const id of clientes_ids) {
                const [, errRelacion] = await updateClienteRelacionesService(
                    id,
                    { contratos: [contratoCreado.id_contrato_comercial] },
                    transactionManager
                )
                if (errRelacion) throw [null, errRelacion]
            }
            console.log('=>Relaciones agregadas con éxito');


            /*
            7.- Agregar relaciones con las sedes
            */
            const [contratoActualizado, errRelacionesContrato] = await updateRelacionesContratoYAnexoService(
                contratoCreado.id_contrato_comercial,
                [],
                sedes_ids,
                transactionManager)
            if (errRelacionesContrato) throw [null, errRelacionesContrato]
            console.log('=>Sedes relacionadas');


            //throw [null, createErrorMessage('Contrato', 'intencional')]

            return [{
                cliente,
                contrato: contratoCreado,
                sedes: [
                    ...sedesNuevas,
                    ...sedesFiliales
                ],
                filiales: filialesCreadas
            }, null];

        }

        if (manager) return await execute(manager)

        return await AppDataSource.transaction(execute)

    } catch (error) {

        if (Array.isArray(error)) {
            console.error(error[1]);
            if (manager) throw error
            return error
        }

        console.error(error)

        if (manager) throw error

        return [null, "Error interno del servidor"]

    }
}


export async function agregarAnexosAClienteService(
    cliente_id,
    anexos = [],
    manager = null
) {
    try {

        const execute = async (transactionManager) => {

            const clienteRepository = transactionManager.getRepository(Cliente);

            const anexoRepository = transactionManager.getRepository(ContratoAnexoSchema);

            const cliente = await clienteRepository.findOne({
                where: { cliente_id },
                relations: ["anexos"]
            });

            if (!cliente)
                throw [null, createErrorMessage("cliente", "Cliente no encontrado")];

            const anexosIds = Array.isArray(anexos)
                ? anexos
                : [anexos];

            if (anexosIds.length === 0)
                return [cliente, null];

            const anexosEncontrados = await anexoRepository.find({
                where: {
                    id_anexo: In(anexosIds)
                }
            });

            if (anexosEncontrados.length !== anexosIds.length)
                throw [null, createErrorMessage("anexo", "Uno o más anexos no existen")];

            const actuales = cliente.anexos || [];

            const mapa = new Map(
                actuales.map(a => [a.id_anexo, a])
            );

            for (const anexo of anexosEncontrados) {
                mapa.set(
                    anexo.id_anexo,
                    anexo
                );
            }

            cliente.anexos = [...mapa.values()];

            await clienteRepository.save(cliente);

            return [cliente, null];
        };

        if (manager) return await execute(manager);

        return await AppDataSource.transaction(execute);

    } catch (error) {

        if (Array.isArray(error)) {

            if (manager)
                throw error;

            return error;
        }

        console.error(error);

        if (manager)
            throw error;

        return [null, "Error interno"];
    }
}

export const getFechaContratodeCliente = async (clienteId) => {
    try {
        const contratoRepository = AppDataSource.getRepository("ContratoComercial");
        const contrato = await contratoRepository.findOne({
            where: { cliente: { id: clienteId } },
            select: ["fechaFinReal"]
        });

        return contrato ? contrato.fechaFinReal : null;
    } catch (error) {
        console.error(`Error al obtener la fecha del contrato para el cliente ${clienteId}:`, error);
        throw error;
    }
};

export function calcularPersonalNuevoContratoExistente(
    nuevasSedes = [],
    filiales = [],
    nuevasFiliales = []
) {

    const filialesCalculo = [

        // Filiales existentes
        ...filiales.map(f => ({
            sedes: f.nuevasSedes,
            filiales: []
        })),

        // Filiales nuevas
        ...nuevasFiliales.map(f => ({
            sedes: f.sedes,
            filiales: f.filiales || []
        }))
    ];

    return calcularPersonalTotal(
        nuevasSedes,
        filialesCalculo
    );
}