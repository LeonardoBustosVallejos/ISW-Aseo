import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import Header from "../../../components/misc/Header";
import AddButton from "../../../components/misc/add-button";
import { Table } from "../../../components/Tabla2";
import { formatDate, formatDateTime } from "../../../helpers/formatDate";
import Acordeon from "../../../components/Acordeon";
import { useState } from "react";
import { ArrowDownToLine } from "lucide-react";
import SedesTable from "./SedesTable";
import { Modal } from "../../../components/Modal";
import { descargarDocumento } from "../../../services/documentos.service";
import { AnexosArray } from "../../../components/Contrato/AnexoComercial";
import ContratoRow from "../../../components/Contrato/ContratoComercialForm";
import { SedesArray } from "../../../components/Clientes/SedesForm";

export function puedeAgregarAnexo(estado) { return ["VIGENTE", "SUSPENDIDO", "ATRASADO"].includes(estado) }

export function puedeCrearContrato(estado) { return estado !== 'VIGENTE' }


export default function ContratosTable({ contratos, cliente = null, estado, noTitle = false, title, isGeneral = false }) {

    const [openInfo, setOpenInfo] = useState(null)
    const [openDocumentos, setOpenDocumentos] = useState(null)
    const [openAnexos, setOpenAnexos] = useState(null)
    const [openSedes, setOpenSedes] = useState(null)
    const [openDocs, setOpenDocs] = useState(null)


    const [openVerifModal, setOpenVerifModal] = useState(false)

    const [modal, setModal] = useState(null); // "contrato" | "anexo" | null

    const [selectedContrato, setSelectedContrato] = useState(null);

    const [newSedes, setNewSedes] = useState([]);
    const [newAnexos, setNewAnexos] = useState([]);

    const [newContrato, setNewContrato] = useState({
        contrato: {
            fechaInicio: '',
            fechaFinOriginal: '',
            monto: '',
            jornada: '',
            tipoJornada: '',
            cantidadMinTrabajadores: '',
            cantidadMaxTrabajadores: '',
            tamanoInstalacion: '',
            requiereGuardias: false,
            detalles: '',
            observacionesOperativas: '',
        },
        metadataDocumentos: [
            {
                nombrePersonalizado: '',
                tipoDocumento: 'CONTRATO',
                fileKey: "contrato_pdf",
                file: null
            }
        ],
    })

    const abrirModalContrato = () => {
        setSelectedContrato(null); // es un contrato nuevo
        setModal("contrato");
    };

    const abrirModalAnexo = (contrato) => {

        setSelectedContrato(contrato);

        setNewAnexos([
            {
                datos: {
                    numeroAnexo: "",
                    fechaInicio: contrato.fechaInicio,
                    fechaFin: contrato.fechaFinOriginal,
                    montoNuevo: contrato.monto,
                    cantidadMinTrabajadores: contrato.cantidadMinTrabajadores,
                    cantidadMaxTrabajadores: contrato.cantidadMaxTrabajadores,
                    tipoJornada: contrato.tipoJornada,
                    tipoAnexo: "",
                    detalles: "",
                    observacionesOperativas: "",
                    requiereGuardias: contrato.requiereGuardias,
                    tamanoInstalacion: contrato.tamanoInstalacion
                },
                documentos: [
                    {
                        nombrePersonalizado: "",
                        tipoDocumento: "ANEXO",
                        fileKey: "anexo_pdf",
                        file: null
                    }
                ]
            }
        ]);

        setModal("anexo");
    };


    const closeModal = () => {
        setModal(null);
        setSelectedContrato(null);
        setNewAnexos([]);
    };

    const handleDownload = async (id_documento) => {
        try {
            const response = await descargarDocumento(id_documento)
        } catch (error) {

        }
    }
    console.log(selectedContrato);

    return (
        <>
            <Header title={title ? title : title || 'Contratos'}>
                {(!isGeneral ? <AddButton
                    text="Nuevo contrato"
                    onClick={abrirModalContrato}
                    disabled={!puedeCrearContrato(estado)}
                /> : '')}
            </Header>
            <Table
                title={!noTitle && "Contratos"}
                data={contratos}
                rowKey={'id_contrato_comercial'}
                columns={[
                    {
                        field: "codigoContrato",
                        header: "Código"
                    },
                    {
                        field: "cliente",
                        header: "Cliente",
                        render: (_, row) => row.cliente.nombreCliente
                    },
                    {
                        field: "estado",
                        header: "Estado",
                        render: (_, row) => (
                            <div className={`estado ${row.estado === "ESPERA" ? "amarillo" :
                                row.estado === "VIGENTE" ? "verde" : "rojo"}`}>
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
                        render: (_, row) => row.sedes.length || 'Sin datos'
                    },
                    {
                        field: "anexos",
                        header: "Anexos",
                        render: (_, row) => row?.anexos?.length || 'Sin datos'
                    },
                    {
                        /*
                        field: "documentos",
                        header: "Documentos",
                        //render: ( row) => row.documentos.length
                    */
                    }
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
                                            <strong>{row.cliente?.nombreCliente} - {row.cliente.rutCliente}</strong>
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
                                    <div>

                                        {/* BOTÓN CONDICIONAL */}
                                        {["VIGENTE", "SUSPENDIDO", "ATRASADO"].includes(row.estado) && (
                                            <div style={{ marginBottom: 10 }}>
                                                <AddButton
                                                    text="Agregar anexo"
                                                    onClick={() => abrirModalAnexo(row)}
                                                    disabled={!puedeAgregarAnexo(row.estado)}
                                                />
                                            </div>
                                        )}

                                        {/* TABLA DE ANEXOS */}
                                        <Table
                                            rowKey="id_anexo"
                                            title={null}
                                            emptyMessage={'No hay anexos'}
                                            columns={[
                                                { field: "numeroAnexo", header: "N° Anexo" },
                                                { field: "tipoAnexo", header: "Tipo" },
                                                { field: "fechaInicio", header: "Inicio" },
                                                { field: "fechaFin", header: "Fin" },
                                            ]}
                                            data={row.anexos}
                                            renderExpanded={(anexo) => (
                                                <div className="info-card">

                                                    {/* INFO ANEXO */}
                                                    <Acordeon
                                                        title="Información del anexo"
                                                        content={
                                                            <>

                                                                <p><strong>Número:</strong> {anexo.numeroAnexo}</p>
                                                                <p><strong>Tipo:</strong> {anexo.tipoAnexo}</p>
                                                                <p><strong>Monto:</strong> {anexo.montoNuevo}</p>

                                                                <p>
                                                                    <strong>Trabajadores:</strong>{" "}
                                                                    {anexo.cantidadMinTrabajadores} - {anexo.cantidadMaxTrabajadores}
                                                                </p>

                                                                <p>
                                                                    <strong>Jornada:</strong> {anexo.tipoJornada}
                                                                </p>

                                                                <p>
                                                                    <strong>Sedes:</strong>{" "}
                                                                    {anexo.sedes?.length ?? 0}
                                                                </p>
                                                            </>
                                                        }
                                                    />

                                                    {/* DOCUMENTOS DEL ANEXO */}
                                                    <Acordeon
                                                        title={`Documentos (${anexo.documentos?.length ?? 0})`}
                                                        content={
                                                            anexo.documentos?.length ? (
                                                                <TablaDocumentos documentos={anexo.documentos} />
                                                            ) : (
                                                                <p>No hay documentos</p>
                                                            )
                                                        }
                                                    />

                                                    {/* SEDES DEL ANEXO */}
                                                    <Acordeon
                                                        title={`Sedes (${anexo.sedes?.length ?? 0})`}
                                                        content={
                                                            anexo.sedes?.length ? (
                                                                <ul>
                                                                    {anexo.sedes.map((s) => (
                                                                        <li key={s.sede_id}>
                                                                            {s.nombre_sede} - {s.direccion}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            ) : (
                                                                <p>No hay sedes asociadas</p>
                                                            )
                                                        }
                                                    />

                                                </div>
                                            )}
                                        />

                                    </div>
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
                                        title={noTitle ? '' : 'Sedes'}
                                        emptyMessage="No existen sedes"
                                        rowKey="sede_id"
                                        noExpand
                                        columns={[
                                            {
                                                field: "nombre_sede",
                                                header: "Nombre"
                                            },
                                            {
                                                field: "tipoSede",
                                                header: "Tipo",

                                            },
                                            {
                                                field: "direccion",
                                                header: "Dirección"
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
            {/*Nuevo Contrato */}
            {cliente && !isGeneral && (<Modal
                title="Nuevo contrato"
                open={modal === "contrato"}
                onClose={closeModal}
                isForm
            >
                <form>

                    <ContratoRow
                        cliente={cliente}
                        onSuccess={closeModal}
                    />
                    <SedesArray
                        sedes={newSedes}
                        setFormData={setNewSedes}
                        contrato
                    />
                </form>
            </Modal>)}

            {/*Agregar Anexo */}
            <Modal
                title={`Nuevo Anexo ${selectedContrato ? `- ${selectedContrato.codigoContrato}` : ""}`}
                open={modal === "anexo"}
                onClose={closeModal}
                isForm
            >
                <form>
                    <AnexosArray
                        anexos={newAnexos}
                        contrato={selectedContrato}
                        isUpdate
                        setFormData={setNewAnexos}
                    />

                </form>
            </Modal>
        </>
    )
}


export function TablaDocumentos({ documentos }) {
    return (
        <Table
            rowKey="id_documento"
            emptyMessage={'No hay documentos asociados'}
            columns={[
                { field: "nombreArchivo", header: "Nombre del archivo" },

                { field: "tipoDocumento", header: "Tipo" },
                { field: "createdAt", header: "Fecha de registro" },
                { field: "extension", header: "Extensión" },
            ]}
            data={documentos}
            actions={(doc) => (
                <button className="action-button" onClick={() => descargarDocumento(doc.id_documento)}>
                    <ArrowDownToLine />
                </button>
            )}
            renderExpanded={doc => (
                <div className="info-card">



                    <div className="info-label">
                        <strong>Nombre:</strong>
                        <strong>{doc.nombreArchivo}</strong>
                    </div>
                    <div className="data-line" />

                    <div className="info-label">
                        <strong>Nombre original:</strong>
                        <strong>{doc.nombreOriginal}</strong>
                    </div>
                    <div className="data-line" />

                    <div className="info-label">
                        <strong>Tipo:</strong>
                        <strong>{doc.tipoDocumento}</strong>
                    </div>
                    <div className="data-line" />

                    <div className="info-label">
                        <strong>Fecha subida:</strong>
                        <strong>{formatDateTime(doc.createdAt)}</strong>
                    </div>


                    <div className="data-line" />




                </div>
            )}
        />
    )
}