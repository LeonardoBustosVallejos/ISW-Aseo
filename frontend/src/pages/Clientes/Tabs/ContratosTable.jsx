import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import Header from "../../../components/misc/Header";
import AddButton from "../../../components/misc/add-button";
import { Table } from "../../../components/Tabla2";
import { formatDate, formatDateTime } from "../../../helpers/formatDate";
import Acordeon from "../../../components/Acordeon";
import { useState } from "react";
import { ArrowDownToLine, Trash2 } from "lucide-react";
import SedesTable from "./SedesTable";
import { Modal } from "../../../components/Modal";
import { descargarDocumento } from "../../../services/documentos.service";
import { AnexosArray } from "../../../components/Contrato/AnexoComercial";
import ContratoRow from "../../../components/Contrato/ContratoComercialForm";
import { SedesArray } from "../../../components/Clientes/SedesForm";
import { useNavigate } from "react-router-dom";

import SedesSelector from "../../../components/Clientes/SedesSelector";
import { useErrors } from "../../../hooks/errors";
import DataClienteOFilial from "../../../components/Clientes/DataClienteOFilialForm";
import { createNuevoAnexo, createNuevoContrato } from "../../../services/contratoComercial.service";
import { showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';

export function puedeAgregarAnexo(estado) { return ["VIGENTE", "SUSPENDIDO", "ESPERA", "ATRASADO"].includes(estado) }

export function puedeCrearContrato(estado) { return ['VIGENTE', 'ESPERA'].includes(estado) }


export default function ContratosTable({ contratos, cliente = null, sedes = null, filiales = null, estado, noTitle = false, title, isGeneral = false }) {

    const crearContratoBase = () => ({
        cliente_id: cliente.cliente_id,

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

        metadataDocumentos: [{
            nombrePersonalizado: '',
            tipoDocumento: 'CONTRATO',
            fileKey: 'contrato_pdf',
            file: null
        }],

        sedesSeleccionadas: [],
        nuevasSedes: [],

        filialesSeleccionadas: [],
        nuevasFiliales: [],

        anexos: []
    });

    const SEDE_BASE =
    {
        nombre_sede: '',
        direccion: '',
        personalSolicitado: '',
        rutSecundario: '',
        tipoSede: '',
        contactos: [{
            nombreContacto: '',
            contacto_rut: '',
            email: '',
            phone: '',
            tipoContacto: 'PRINCIPAL',
        }]
    }
    const FILIAL_BASE = {
        cliente: {
            nombreCliente: "",
            rutCliente: cliente.rutCliente
        },

        sedes: [
            {
                nombre_sede: "",
                direccion: "",
                personalSolicitado: 0,
                rutSecundario: "",
                tipoSede: "PRINCIPAL",
                contactos: [
                    {
                        nombreContacto: "",
                        contacto_rut: "",
                        email: "",
                        phone: "",
                        tipoContacto: "PRINCIPAL"
                    }
                ]
            }
        ]
    };

    const navigate = useNavigate();
    const { errorsObject, displayError, cleanObject, setErrors } = useErrors()

    //Para sub-pestañas de la tabla 
    const [openInfo, setOpenInfo] = useState(null)
    const [openDocumentos, setOpenDocumentos] = useState(null)
    const [openAnexos, setOpenAnexos] = useState(null)
    const [openSedes, setOpenSedes] = useState(null)

    //sedes, del cliente mayor, seleccionadas
    const [selectedSedes, setSelectedSedes] = useState([]);
    const [selectedFiliales, setSelectedFiliales] = useState([])

    //Acordeones de formularios
    const [openSelectSedes, setOpenSelecSedes] = useState(false)
    const [openFilial, setOpenFilial] = useState('')
    const [openSelectFiliales, setOpenSelectFiliales] = useState(false);
    const [openNewSedes, setOpenNewSedes] = useState(false)
    const [openNewFiliales, setOpenNewFiliales] = useState(false)
    const [openNewFilial, setOpenNewFilial] = useState('')

    //Cuál modal mostrar
    const [modal, setModal] = useState(null); // "contrato" | "anexo" | null
    const [openVerifModal, setOpenVerifModal] = useState(null)

    //Contrato sobre el cual se hará una accion
    const [selectedContrato, setSelectedContrato] = useState(null);


    //array donde se almacenarán las filiales en caso de abrir modales
    const [filialesForm, setFilialesForm] = useState([]);

    //Nuevas sedes para cliente principal
    const [newSedes, setNewSedes] = useState([]);

    //nuevos anexos
    const [newAnexos, setNewAnexos] = useState([]);

    //nuevas filiales
    const [newFiliales, setNewFiliales] = useState([]);

    const [newContrato, setNewContrato] = useState(crearContratoBase);


    const MAPA_COLORES_ESTADO = {
        ESPERA: "azul-gris",
        ATRASADO: "naranja",
        VIGENTE: "verde",
        SUSPENDIDO: "amarillo",
        TERMINADO: "gris",
        CANCELADO: "rojo"
    };



    const sedesRepresentante = (sedes ?? []).filter(
        s => s.cliente?.cliente_id === cliente.cliente_id
    );

    const addFilial = () => {

        setNewFiliales(prev => [
            ...prev,
            structuredClone(FILIAL_BASE)
        ]);

    };
    const removeFilial = (index) => {
        setNewFiliales(prev => prev.filter((_, i) => i !== index));
    };

    const handleView = (rut, cliente_id) => {
        navigate(`/cliente/rut/${rut}/id/${cliente_id}`)
    }
    const abrirModalContrato = () => {

        setSelectedContrato(null);

        setSelectedSedes([]);

        setFilialesForm(
            (filiales ?? []).map(f => ({
                ...f,
                selectedSedes: [],
                newSedes: []
            }))
        );
        setModal("contrato");
    }

    const abrirModalAnexo = (contrato) => {

        setSelectedContrato(contrato);

        setFilialesForm(
            (filiales ?? []).map(f => ({
                ...f,
                selectedSedes: [],
                newSedes: []
            }))
        );

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
        cleanObject()
        setModal(null);
        setSelectedContrato(null);

        setNewContrato(crearContratoBase());

        setNewAnexos([]);

        setSelectedSedes([]);
        setNewSedes([]);

        setSelectedFiliales([]);
        setFilialesForm([]);
        setNewFiliales([]);

        setOpenNewSedes(false);

        setOpenSelectFiliales(false);
        setOpenNewFiliales(false);

        setOpenFilial("");
        setOpenNewFilial(null);

        setOpenVerifModal(false);
    };

    const handleDownload = async (id_documento) => {
        try {
            const response = await descargarDocumento(id_documento)
        } catch (error) {
            console.error(error);
        }
    }
    const handleOpenVerif = (type) => {
        setOpenVerifModal(type)
    }
    const closeVerifModal = (e) => {
        e.preventDefault()
        setOpenVerifModal(null)
    }

    const submitNewContrato = async (e) => {
        try {

            const body = {

                cliente_id: newContrato.cliente_id,

                contrato: newContrato.contrato,

                metadataDocumentos: newContrato.metadataDocumentos,

                // Sedes existentes del representante
                sedesSeleccionadas: newContrato.sedesSeleccionadas,

                // Nuevas sedes del representante
                nuevasSedes: newSedes,

                // Filiales existentes
                filiales: filialesForm.map(f => ({

                    cliente_id: f.cliente_id,

                    // ids de sedes existentes seleccionadas
                    sedesSeleccionadas:
                        f.selectedSedes.map(s => s.sede_id),

                    // nuevas sedes de esa filial
                    nuevasSedes: f.newSedes

                })),

                // Filiales nuevas
                nuevasFiliales: newFiliales

            };

            const response = await createNuevoContrato(body.cliente_id, body)

            if (response.status === 'Success') {
                showSuccessAlert('¡Agregado!', 'Contrato agregado exitosamente.');
                setTimeout(3000)
                closeModal()
            } else if (response.status === 'Client error') {
                console.log(response);

                setErrors(response)
            }


        } catch (error) {

            console.error(error);
            showErrorAlert('Cancelado', 'Ocurrió un error al agregar.');
        }
    }

    const submitNewAnexo = async () => {
        try {
            const body = {

                contrato_id: selectedContrato.id_contrato_comercial,

                anexos: newAnexos,

                sedesSeleccionadas: selectedSedes.map(s => s.sede_id),

                nuevasSedes: newSedes,

                filiales: filialesForm.map(f => ({

                    cliente_id: f.cliente_id,

                    sedesSeleccionadas: f.selectedSedes.map(s => s.sede_id),

                    nuevasSedes: f.newSedes

                })),

                nuevasFiliales: newFiliales

            };


            const response = await createNuevoAnexo(body.contrato_id, body)

            if (response.status === 'Success') {
                showSuccessAlert('¡Agregado !', 'Usuario registrado exitosamente.');
                setTimeout(3000)
                closeModal()
            } else if (response.status === 'Client error') {
                console.log(response);

                setErrors(response)
            }


        } catch (error) {
            console.error(error);
            showErrorAlert('Cancelado', 'Ocurrió un error al agregar.');
        }
    }

    return (
        <>
            <Header title={title ? title : title || 'Contratos'}>
                {(!isGeneral ? <AddButton
                    text="Nuevo contrato"
                    onClick={abrirModalContrato}
                    hidden={cliente.tipoCliente !== 'EMPRESA'}
                    disabled={puedeCrearContrato(estado) || cliente.tipoCliente !== 'EMPRESA'}
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
                            <div className={`estado ${MAPA_COLORES_ESTADO[row.estado] || "gris"}`}>
                                {row.estado}
                            </div>
                        )
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
                                title="1.- Información del contrato"
                                isOpen={openInfo === row.id_contrato_comercial}
                                onToggle={() => setOpenInfo(openInfo === row.id_contrato_comercial ? null : row.id_contrato_comercial)}
                                content={infoCard({ row })
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
                                        {["VIGENTE", "SUSPENDIDO", "ESPERA", "ATRASADO"].includes(row.estado) && (
                                            <div style={{ marginBottom: 10 }}>
                                                <AddButton
                                                    text="Agregar anexo"
                                                    onClick={() => abrirModalAnexo(row)}
                                                    disabled={!puedeAgregarAnexo(row.estado) || cliente.tipoCliente !== 'EMPRESA'}
                                                />
                                            </div>
                                        )}

                                        {/* TABLA DE ANEXOS */}
                                        <TablaAnexos anexos={row.anexos}
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
                                        rowKey={"sede_id"}
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
                                                field: "nombreCliente",
                                                header: "Propietario",
                                                render: (_, row) => row.cliente.nombreCliente + '-' + row.cliente.tipoCliente

                                            },
                                            {
                                                field: "direccion",
                                                header: "Dirección",
                                                render: (_, row) => row.direccion

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
            {cliente && !isGeneral && (
                <Modal
                    title="Nuevo contrato"
                    open={modal === "contrato"}
                    onClose={closeModal}
                    isForm
                    footer={<span className={`error-message`}>
                        {displayError}
                    </span>}
                    onAcept={() => handleOpenVerif('newContrato')}
                >
                    <form>
                        <ContratoForm
                            contrato={newContrato}
                            setContrato={setNewContrato}

                            sedes={sedesRepresentante}

                            newSedes={newSedes}
                            setNewSedes={setNewSedes}

                            newFiliales={newFiliales}
                            setNewFiliales={setNewFiliales}

                            filialesForm={filialesForm}
                            setFilialesForm={setFilialesForm}

                            selectedSedes={selectedSedes}
                            setSelectedSedes={setSelectedSedes}
                        />

                    </form>
                </Modal>)}

            {/*Agregar Anexo */}
            <Modal
                title={`Nuevo Anexo `}
                subtitle={`${selectedContrato ? `${selectedContrato.codigoContrato}` : ""}`}
                open={modal === "anexo"}
                onClose={closeModal}
                isForm
                footer={<span className={`error-message`}>
                    {displayError}
                </span>}
                onAcept={() => handleOpenVerif('newAnexo')}
            >
                <form onSubmit={() => handleOpenVerif('newAnexo')}>
                    {/*FORMULARIO DE ANEXOS */}
                    <AnexosArray
                        anexos={newAnexos}
                        contrato={selectedContrato}
                        isUpdate
                        setFormData={setNewAnexos}
                    />
                    {/*SELECCIONAR SEDES */}
                    <Acordeon
                        title={`Seleccionar Sedes? (${selectedSedes.length} de ${sedesRepresentante.length} seleccionadas)`}
                        isOpen={openSelectSedes}
                        onToggle={() => setOpenSelecSedes(!openSelectSedes)}
                        content={

                            <SedesSelector
                                sedes={sedesRepresentante}
                                selected={selectedSedes}

                                setSelected={(rows) => {
                                    setSelectedSedes(rows);

                                    setNewContrato(prev => ({
                                        ...prev,
                                        sedesSeleccionadas: rows.map(r => r.sede_id)
                                    }));
                                }}
                            />
                        }
                    />
                    {/*NUEVAS SEDES DEL PRINCIPAL */}
                    <Acordeon
                        title={`Agregar Nuevas Sedes al Representante (${newSedes?.length ?? 0})`}
                        level={0}
                        isOpen={openNewSedes}
                        onToggle={() => setOpenNewSedes(!openNewSedes)}
                        content={
                            <SedesArray
                                sedes={newSedes}
                                setFormData={setNewSedes}
                                sedesPath={[]}
                                isRegister={false}
                                level={1}
                            />
                        }
                    />
                    {/*SELECCIONAR O AGREGAR SEDES A FILIALES */}
                    <Acordeon
                        title={`Agregar o Seleccionar Sedes a/de Filiales (${filialesForm.length})`}
                        level={0}
                        isOpen={openSelectFiliales}
                        onToggle={() => setOpenSelectFiliales(!openSelectFiliales)}
                        content={
                            <>
                                {filialesForm.map((filial, index) => (

                                    <Acordeon
                                        key={filial.cliente_id}
                                        level={1}
                                        isOpen={openFilial === filial.cliente_id}
                                        onToggle={() => setOpenFilial(openFilial === filial.cliente_id ? '' : filial.cliente_id)}
                                        title={`${filial.nombreCliente} (${filial.newSedes.length} nuevas sedes)`}
                                        content={
                                            <>
                                                <SedesSelector
                                                    sedes={filial.sedes}
                                                    selected={filial.selectedSedes}
                                                    setSelected={(rows) => {

                                                        setFilialesForm(prev => {

                                                            const copia = structuredClone(prev);

                                                            copia[index].selectedSedes = rows;

                                                            return copia;
                                                        });

                                                    }}
                                                />

                                                <br />

                                                <SedesArray
                                                    sedes={filial.newSedes}
                                                    newDoc
                                                    level={2}
                                                    setFormData={(updater) => {

                                                        setFilialesForm(prev => {

                                                            const copia = structuredClone(prev);

                                                            copia[index].newSedes =
                                                                typeof updater === "function"
                                                                    ? updater(copia[index].newSedes)
                                                                    : updater;

                                                            return copia;
                                                        });
                                                    }}
                                                    sedesPath={[]}
                                                />
                                            </>
                                        }
                                    />

                                ))}
                            </>
                        }
                    />
                    {/*NUEVAS FILIALES */}
                    <Acordeon title={'Agregar Filiales'}
                        isOpen={openNewFiliales}
                        onToggle={() => setOpenNewFiliales(!openNewFiliales)}
                        content={
                            <div>

                                {newFiliales.map((filial, index) => (
                                    <div className='multiple-acordeon'>

                                        <Acordeon
                                            key={index}
                                            isOpen={openNewFilial === index}
                                            onToggle={() => setOpenNewFilial(openNewFilial === index ? null : index)}
                                            required
                                            title={`Nueva Filial ${index + 1}`}
                                            level={1}
                                            content={
                                                <DataClienteOFilial
                                                    data={filial.cliente}
                                                    sedes={filial.sedes}
                                                    dataPath={["cliente"]}
                                                    sedesPath={["sedes"]}
                                                    setFormData={(updater) => {

                                                        setNewFiliales(prev => {

                                                            const copia = structuredClone(prev);

                                                            copia[index] =
                                                                typeof updater === "function"
                                                                    ? updater(copia[index])
                                                                    : updater;

                                                            return copia;
                                                        });

                                                    }}
                                                />
                                            }
                                        />
                                        {/*REMOVER FILIAL */}
                                        <button type="button"
                                            onClick={() => removeFilial(index)}
                                            className={`remove-button`}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                ))}
                                <AddButton
                                    text="Agregar Filial"
                                    onClick={addFilial}
                                />
                            </div>
                        }
                    />
                </form>
            </Modal>

            {/*MODAL DE CONFIRMACION */}
            <Modal open={openVerifModal}
                title={'AVISO'}
                onClose={(e) => closeVerifModal(e)}
                isForm={true}
                onAcept={(e) => {
                    openVerifModal === 'newContrato' ? submitNewContrato(e) :
                        openVerifModal === 'newAnexo' ? submitNewAnexo(e) : undefined

                    closeVerifModal(e)
                }}
            >
                <br />
                <br />
                <strong>

                    ¿Acepta que toda la informacion entregada es correcta?
                </strong>
                <br />
                <br />
            </Modal>
        </>
    )
}


function infoCard({ row }) {
    return (
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
                <strong>Fin original:</strong>
                <strong>{formatDate(row.fechaFinOriginal)}</strong>
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
            {/*
            <button className="action-button" onClick={() => handleView(row.cliente[0].rutCliente, row.cliente[0].cliente_id)}>
                <strong>Ir a informacion del cliente</strong>
            </button>
            */}
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


export function TablaAnexos({ anexos }) {

    const [openInfo, setOpenInfo] = useState(null)
    const [openSedes, setOpenSedes] = useState(null)
    const [openDocs, setOpenDocs] = useState(null)

    return (
        <Table
            rowKey="id_anexo"
            title={null}
            emptyMessage={'No hay anexos'}
            columns={[
                { field: "numeroAnexo", header: "N° Anexo", render: (_, row) => row.numeroAnexo },
                { field: "tipoAnexo", header: "Tipo" },
                { field: "fechaInicio", header: "Inicio", render: (_, row) => formatDate(row.fechaInicio) },
                { field: "fechaFin", header: "Fin", render: (_, row) => formatDate(row.fechaFin) },
            ]}
            data={anexos}
            renderExpanded={(row) => (
                <div className="info-card">

                    {/* INFO ANEXO */}
                    <Acordeon
                        title="Información del anexo"
                        isOpen={openInfo === row.id_anexo}
                        onToggle={() => setOpenInfo(openInfo === row.id_anexo ? null : row.id_anexo)}
                        content={
                            <>

                                <div className="info-label">
                                    <strong>Número:</strong>
                                    <strong>{row.numeroAnexo}</strong>
                                </div>

                                <div className="data-line" />
                                <div className="info-label">
                                    <strong>Tipo:</strong>
                                    <strong>{row.tipoAnexo}</strong>
                                </div>

                                <div className="data-line" />
                                <div className="info-label">
                                    <strong>Monto:</strong>
                                    <strong>{row.montoNuevo}</strong>
                                </div>
                                <div className="data-line" />

                                <div className="info-label">

                                    <strong>Trabajadores:</strong>
                                    <strong>{row.cantidadMinTrabajadores} - {row.cantidadMaxTrabajadores}</strong>
                                </div>
                                <div className="data-line" />

                                <div className="info-label">
                                    <strong>Jornada:</strong>
                                    <strong>{row.tipoJornada}</strong>
                                </div>
                                <div className="data-line" />



                                <div className="info-label">
                                    <strong>Sedes:</strong>
                                    <strong>{row.sedes?.length ?? 0}</strong>
                                </div>
                                <div className="data-line" />

                                <div className="info-label">
                                    <strong>Fecha de Creación:</strong>
                                    <strong>{formatDateTime(row.createdAt)}</strong>
                                </div>
                                <div className="data-line" />

                            </>
                        }
                    />

                    {/* DOCUMENTOS DEL ANEXO */}
                    <Acordeon
                        title={`Documentos (${row.documentos?.length ?? 0})`}
                        isOpen={openDocs === row.id_anexo}
                        onToggle={() => setOpenDocs(openDocs === row.id_anexo ? null : row.id_anexo)}
                        content={
                            row.documentos?.length ? (
                                <TablaDocumentos documentos={row.documentos} />
                            ) : (

                                'No hay documentos'
                            )
                        }
                    />

                    {/* SEDES DEL ANEXO */}
                    <Acordeon
                        title={`Sedes (${row.sedes?.length ?? 0})`}
                        isOpen={openSedes === row.id_anexo}
                        onToggle={() => setOpenSedes(openSedes === row.id_anexo ? null : row.id_anexo)}
                        content={
                            row.sedes?.length ? (
                                < SedesSelector sedes={row.sedes} noSelect />
                            ) : (

                                ' No hay sedes asociadas'
                            )
                        }
                    />

                </div>
            )}
        />
    )
}



function SedesFilialesArrayTable({ filiales = [], sedesSeleccionadas = [], setSelectedSedes }) {
    return (
        <>
            {
                filiales.map((filial, index) => (
                    <SedesArray sedes={filial.sedes}
                        setFormData={setSelectedSedes}
                        level={0}

                    />
                ))
            }
        </>
    )
}


function ContratoForm({
    contrato,
    setContrato,

    sedes = [],

    newSedes,
    setNewSedes,

    newFiliales,
    setNewFiliales,

    filialesForm,
    setFilialesForm,

    selectedSedes = [],
    setSelectedSedes,

    level = 0
}) {

    //const [selectedSedes, setSelectedSedes] = useState([]);
    const [selectedFiliales, setSelectedFiliales] = useState([]);

    const [openSelectSedes, setOpenSelectSedes] = useState(false);
    const [openNewSedes, setOpenNewSedes] = useState(false);

    const [openSelectFiliales, setOpenSelectFiliales] = useState(false);
    const [openFilial, setOpenFilial] = useState("");

    const [openNewFiliales, setOpenNewFiliales] = useState(false);
    const [openNewFilial, setOpenNewFilial] = useState(null);

    const addFilial = () => {

        setNewFiliales(prev => [
            ...prev,
            {
                cliente:
                {
                    nombreCliente: "",
                    rutCliente: ""
                },
                sedes: [{
                    nombre_sede: "",
                    direccion: "",
                    personalSolicitado: 0,
                    rutSecundario: "",
                    tipoSede: "PRINCIPAL",
                    contactos: [
                        {
                            nombreContacto: "",
                            contacto_rut: "",
                            email: "",
                            phone: "",
                            tipoContacto: "PRINCIPAL"
                        }
                    ]
                }]
            }
        ]);
    };

    const removeFilial = (index) => {

        setNewFiliales(prev => prev.filter((_, i) => i !== index));

    };

    return (
        <>
            {/*FORMULARIO CONTRATO */}
            <ContratoRow
                contrato={contrato.contrato}
                documentos={contrato.metadataDocumentos}
                setFormData={setContrato}
                level={level}
            />

            <br />

            {/*SELECCIONAR SEDES */}
            <Acordeon
                title={`Seleccionar Sedes (${contrato.sedesSeleccionadas.length} de ${sedes.length})`}
                isOpen={openSelectSedes}
                onToggle={() => setOpenSelectSedes(!openSelectSedes)}
                level={level}
                content={
                    <SedesSelector
                        sedes={sedes}
                        selected={selectedSedes}
                        setSelected={(rows) => {

                            setSelectedSedes(rows);

                            setContrato(prev => ({
                                ...prev,
                                sedesSeleccionadas: rows.map(r => r.sede_id)
                            }));

                        }}
                    />
                }
            />
            {/*NUEVAS SEDES DEL PRINCIPAL */}

            <Acordeon
                title={`Agregar Nuevas Sedes al Representante (${newSedes?.length ?? 0})`}
                isOpen={openNewSedes}
                onToggle={() => setOpenNewSedes(!openNewSedes)}
                level={level}
                content={
                    <SedesArray
                        newDoc
                        sedes={newSedes}
                        setFormData={setNewSedes}
                        sedesPath={[]}
                        isRegister={false}
                        level={level + 1}
                    />
                }
            />

            {/*SELECCIONAR O AGREGAR SEDES A FILIALES */}
            <Acordeon
                title={`Agregar o Seleccionar Sedes a/de Filiales (${filialesForm.length})`}
                level={level}
                disabled={filialesForm.length === 0}
                isOpen={openSelectFiliales}
                onToggle={() => setOpenSelectFiliales(!openSelectFiliales)}
                content={
                    <>
                        {filialesForm.map((filial, index) => (

                            <Acordeon
                                key={filial.cliente_id}
                                level={level + 1}
                                isOpen={openFilial === filial.cliente_id}
                                onToggle={() =>
                                    setOpenFilial(
                                        openFilial === filial.cliente_id
                                            ? ""
                                            : filial.cliente_id
                                    )
                                }
                                title={`${filial.nombreCliente} (${filial.newSedes.length} nuevas sedes)`}
                                content={
                                    <>
                                        {/* SEDES EXISTENTES */}
                                        <SedesSelector
                                            sedes={filial.sedes}
                                            selected={filial.selectedSedes}
                                            setSelected={(rows) => {
                                                //setSelectedSedes
                                                console.log(rows);
                                                setFilialesForm(prev => {

                                                    const copia = structuredClone(prev);
                                                    console.log(prev);

                                                    copia[index].selectedSedes = rows;

                                                    return copia;
                                                });

                                            }}
                                        />

                                        <br />

                                        {/* NUEVAS SEDES */}
                                        <SedesArray
                                            sedes={filial.newSedes}
                                            newDoc
                                            level={level + 2}
                                            sedesPath={[]}
                                            setFormData={(updater) => {

                                                setFilialesForm(prev => {

                                                    const copia = structuredClone(prev);

                                                    copia[index].newSedes =
                                                        typeof updater === "function"
                                                            ? updater(copia[index].newSedes)
                                                            : updater;

                                                    return copia;
                                                });

                                            }}
                                        />
                                    </>
                                }
                            />

                        ))}
                    </>
                }
            />

            {/*NUEVAS FILIALES */}
            <Acordeon
                title={`Agregar Filiales (${newFiliales.length})`}
                isOpen={openNewFiliales}
                onToggle={() => setOpenNewFiliales(!openNewFiliales)}
                content={
                    <>
                        {newFiliales.map((filial, index) => (

                            <div
                                className="multiple-acordeon"
                                key={index}
                            >

                                <Acordeon
                                    title={`Nueva Filial ${index + 1}`}
                                    level={level + 1}
                                    required
                                    isOpen={openNewFilial === index}
                                    onToggle={() =>
                                        setOpenNewFilial(
                                            openNewFilial === index
                                                ? null
                                                : index
                                        )
                                    }
                                    content={
                                        <DataClienteOFilial
                                            data={filial.cliente}
                                            sedes={filial.sedes}
                                            dataPath={["cliente"]}
                                            sedesPath={["sedes"]}
                                            level={level + 2}
                                            setFormData={(updater) => {

                                                setNewFiliales(prev => {

                                                    const copia = structuredClone(prev);

                                                    copia[index] =
                                                        typeof updater === "function"
                                                            ? updater(copia[index])
                                                            : updater;

                                                    return copia;

                                                });

                                            }}
                                        />
                                    }
                                />

                                {/*REMOVER FILIAL */}
                                <button type="button"
                                    onClick={() => removeFilial(index)}
                                    className={`remove-button`}>
                                    <Trash2 size={18} />
                                </button>

                            </div>

                        ))}

                        <br />

                        <AddButton
                            text="Agregar Filial"
                            onClick={addFilial}
                        />

                    </>
                }
            />
        </>
    );

}