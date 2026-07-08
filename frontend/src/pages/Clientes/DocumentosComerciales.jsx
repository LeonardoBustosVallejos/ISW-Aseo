import { useState } from "react";
import AddButton from "../../components/misc/add-button";
import Header from "../../components/misc/Header";
import { useEffect } from "react";
import { getContratosComerciales } from "../../services/documentos.service";
import ContratosTable, { TablaAnexos, TablaDocumentos } from "./Tabs/ContratosTable";
import { Table } from "../../components/Tabla2";
import Acordeon from "../../components/Acordeon";
import { formatDate, formatDateTime } from "../../helpers/formatDate";
import { useNavigate } from "react-router-dom";




export default function VistaDocumentosComerciales() {

    const navigate = useNavigate();
    const [openInfo, setOpenInfo] = useState(null)
    const [openDocumentos, setOpenDocumentos] = useState(null)
    const [openAnexos, setOpenAnexos] = useState(null)
    const [openSedes, setOpenSedes] = useState(null)
    const [openDocs, setOpenDocs] = useState(null)

    const [contratos, setContratos] = useState({})
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true);

    const MAPA_COLORES_ESTADO = {
        ESPERA: "azul-gris",
        ATRASADO: "naranja",
        VIGENTE: "verde",
        SUSPENDIDO: "amarillo",
        TERMINADO: "gris",
        CANCELADO: "rojo"
    };

    const handleView = (rut, cliente_id) => {
        navigate(`/cliente/rut/${rut}/id/${cliente_id}`)
    }

    useEffect(() => {
        const obtenerContratos = async () => {

            try {
                const response = await getContratosComerciales()
                if (response.status !== "Success") {
                    throw (response || "Contratos no encontrados");
                }
                setContratos(response.data)

            } catch (error) {
                console.log(error);

            } finally {
                setLoading(false);
            }
        }
        obtenerContratos()

    }, [])
    if (loading) {
        return <div>Cargando...</div>;
    }
    if (error) {
        return (
            <Error404 error={error.message} status={error.status} />
        );
    }

    return (<>
        <Table
            title={'Contratos Comerciales'}
            data={contratos}
            rowKey={'id_contrato_comercial'}
            columns={[
                {
                    field: "codigoContrato",
                    header: "Código"
                },
                {
                    field: "cliente",
                    header: "Cliente Representante",
                    render: (_, row) => row.cliente[0].nombreCliente || 'Error obteniendo'
                },
                {
                    field: "estado",
                    header: "Estado",
                    render: (_, row) => (
                        <div className={`estado ${MAPA_COLORES_ESTADO[row.estado] || "gris"}`}>
                            {row.estado}
                        </div>)
                },
                {
                    field: "fechaInicio",
                    header: "Inicio",
                    render: (_, row) => formatDate(row.fechaInicio)
                },
                {
                    field: "fechaFinReal",
                    header: "Fin",
                    render: (_, row) => formatDate(row.fechaFinReal)
                },
                {
                    field: "sedes",
                    header: "Sedes Involucradas",
                    render: (_, row) => row.sedes.length
                },
                {
                    field: "anexos",
                    header: "Anexos",
                    render: (_, row) => row?.anexos?.length
                },

            ]}
            renderExpanded={(row) => (
                <div className="contract-expanded">

                    {/* 1. INFORMACIÓN GENERAL */}
                    <div className="info-card">
                        <Acordeon
                            title="Información del contrato"
                            isOpen={openInfo === row.id_contrato_comercial}
                            onToggle={() => setOpenInfo(openInfo === row.id_contrato_comercial ? null : row.id_contrato_comercial)}
                            content={

                                <>
                                    <div className="info-label">
                                        <strong>Código:</strong>
                                        <strong>{row.codigoContrato}</strong>
                                    </div>
                                    <div className="data-line" />

                                    <div className="info-label">
                                        <strong>Estado:</strong>
                                        <strong>{row.estado}</strong>
                                    </div>
                                    <div className="data-line" />


                                    <div className="info-label">
                                        <strong>Cliente:</strong>
                                        <strong>{row.cliente[0]?.nombreCliente} - {row.cliente[0]?.rutCliente}</strong>
                                    </div>
                                    <div className="data-line" />


                                    <div className="info-label">
                                        <strong>Inicio:</strong>
                                        <strong>{formatDate(row.fechaInicio)}</strong>
                                    </div>
                                    <div className="data-line" />

                                    <div className="info-label">
                                        <strong>Fin:</strong>
                                        <strong>{formatDate(row.fechaFinReal)}</strong>
                                    </div>
                                    <div className="data-line" />


                                    <div className="info-label">
                                        <strong>Monto:</strong>
                                        <strong>${row.monto}</strong>
                                    </div>
                                    <div className="data-line" />


                                    <div className="info-label">
                                        <strong>Jornada:</strong>
                                        <strong>{row.jornada}</strong>
                                    </div>
                                    <div className="data-line" />

                                    <div className="info-label">
                                        <strong>Tipo jornada:</strong>
                                        <strong>{row.tipoJornada}</strong>
                                    </div>
                                    <div className="data-line" />

                                    <div className="info-label">
                                        <strong>Rango de trabajadores:</strong>
                                        <strong>{row.cantidadMinTrabajadores} - {row.cantidadMaxTrabajadores}</strong>
                                    </div>
                                    <div className="data-line" />

                                    <div className="info-label">
                                        <strong>Sedes:</strong>
                                        <strong>{row.sedes?.length ?? 0}</strong>
                                    </div>
                                    <div className="data-line" />
                                    <div className="info-label">
                                        <strong>Agregado:</strong>
                                        <strong>{formatDateTime(row.createdAt)}</strong>
                                    </div>
                                    <div className="data-line" />
                                    <div className="info-label">
                                        <strong>Última actualización:</strong>
                                        <strong>{formatDateTime(row.updatedAt)}</strong>
                                    </div>
                                    <div className="data-line" />
                                    <br />
                                    <button className="action-button" onClick={() => handleView(row.cliente[0].rutCliente, row.cliente[0].cliente_id)}>
                                        <strong>Ir a informacion del cliente</strong>
                                    </button>
                                </>
                            }
                        />
                    </div>

                    <br />

                    {/* 2. DOCUMENTOS */}
                    <div className="info-card">

                        <Acordeon
                            title={`Documentos (${row.documentos?.length ?? 0})`}
                            isOpen={openDocumentos === row.id_contrato_comercial}
                            onToggle={() => setOpenDocumentos(openDocumentos === row.id_contrato_comercial ? null : row.id_contrato_comercial)}
                            content={

                                <TablaDocumentos documentos={row.documentos} />

                            }
                        />
                    </div>
                    <br />

                    {/* 3. ANEXOS */}
                    <div className="info-card">

                        <Acordeon
                            title={`Anexos (${row.anexos?.length ?? 0})`}
                            isOpen={openAnexos === row.id_contrato_comercial}
                            onToggle={() => setOpenAnexos(openAnexos === row.id_contrato_comercial ? null : row.id_contrato_comercial)}
                            content={
                                <>
                                    {/* TABLA DE ANEXOS */}
                                    <TablaAnexos anexos={row.anexos}
                                    />

                                </>
                            }
                        />
                    </div>
                    <br />

                    {/* 4. SEDES */}
                    <div className="info-card">
                        <Acordeon title={`Sedes asociadas (${row.sedes.length})`}
                            isOpen={openSedes === row.id_contrato_comercial}
                            onToggle={() => setOpenSedes(openSedes === row.id_contrato_comercial ? null : row.id_contrato_comercial)}
                            content={
                                <Table

                                    emptyMessage="No existen sedes"
                                    rowKey="sede_id"
                                    noExpand
                                    columns={[
                                        {
                                            field: "nombre_sede",
                                            header: "Nombre",
                                            render: (_, row) => row.nombre_sede

                                        },
                                        {
                                            field: "tipoSede",
                                            header: "Tipo",


                                        },
                                        {
                                            field: "direccion",
                                            header: "Dirección",
                                            render: (_, row) => row.direccion

                                        },
                                        {
                                            field: "nombreCliente",
                                            header: "Propietario",
                                            render: (_, row) => row.cliente.nombreCliente + '-' + row.cliente.tipoCliente


                                        },
                                        {
                                            field: "personalSolicitado",
                                            header: "Personal Requerido"
                                        },
                                        {
                                            field: "personalAsignado",
                                            header: "Personal Asignado"
                                        }
                                    ]}
                                    data={row.sedes}
                                />
                            }
                        />

                    </div>
                </div>
            )}
        />
    </>)
}