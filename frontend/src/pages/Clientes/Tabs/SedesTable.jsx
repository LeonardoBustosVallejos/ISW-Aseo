import { useEffect, useState } from "react";
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';
import { Table } from "../../../components/Tabla2";
import AddButton from "../../../components/misc/add-button";
import { Modal } from "../../../components/Modal";
import { SedeRow, SedesArray } from "../../../components/Clientes/SedesForm";
import { ContactRound, Pencil, UserRoundPen, UserRoundPlus } from "lucide-react";
import EditButton from "../../../components/misc/edit-button";
import ContactosTable from "./ContactosTable";
import Contactos from "../../../components/Clientes/ContactosForm";
import Acordeon from "../../../components/Acordeon";
import Header from "../../../components/misc/Header";
import AnexoRow, { AnexosArray } from "../../../components/Contrato/AnexoComercial";
import { updateSede } from "../../../services/clientes.service";
export default function SedesTable({ sedes }) {

    const [open, setOpen] = useState('')
    const [accOpen, setAccOpen] = useState('old')

    const [newSedes, setNewSedes] = useState([{
        nombre_sede: '',
        direccion: '',
        personalSolicitado: '',
        tipoSede: '',
        contactos: [{
            nombreContacto: '',
            contacto_rut: '',
            email: '',
            phone: '',
            tipoContacto: ''
        }]
    }])
    const [anexos, setAnexos] = useState([{
        datos: {
            numeroAnexo: "",
            fechaInicio: '',
            fechaFin: '',
            montoNuevo: '',
            cantidadMinTrabajadores: '',
            cantidadMaxTrabajadores: '',
            tipoJornada: '',
            tipoAnexo: '',
            detalles: '',
            observacionesOperativas: '',
            requiereGuardias: '',
            tamanoInstalacion: ''
        },

        documentos: [
            {
                nombrePersonalizado: '',
                tipoDocumento: 'ANEXO',
                fileKey: "anexo_pdf",
                file: null
            }
        ]
    }])

    const [selected, setSelected] = useState({
        nombre_sede: '',
        direccion: '',
        personalSolicitado: '',
        tipoSede: '',
        contactos: [{
            nombreContacto: '',
            contacto_rut: '',
            email: '',
            phone: '',
            tipoContacto: ''
        }]
    })
    const [existingContacts, setExistingContacts] = useState([]);
    const [newContacts, setNewContacts] = useState(selected.contactos);

    const [pendingSubmit, setPendingSubmit] = useState(false);
    const [errorsObject, setErrorsObject] = useState({});
    const [errorMessage, setErrorMessage] = useState('')
    const [modalOpen, setModalOpen] = useState(false)


    const handleSubmit = async () => {
        try {
            console.log(existingContacts, newContacts);

        } catch (error) {
            console.log(error);

        }
    }

    const handleUpdateSede = async () => {
        try {

            setModalOpen(false)

            const response = await updateSede(selected.sede_id, selected)
            console.log(response);

            if (response.status === 'Success') {
                showSuccessAlert('Actualizado!', 'Datos actualizados ccon éxito')
            } else if (response.status === 'Client error') {
                handleErrors(response.details);
            }


        } catch (error) {
            console.error("Error al actualizar una sede: ", error);

            showErrorAlert('Cancelado', 'Ocurrió un error al Actualizar.');
        }
    }
    const handleUpdateContacto = async () => {
        try {
            console.log(existingContacts);

        } catch (error) {
            console.error("Error al actualizar una sed: ", error);

            showErrorAlert('Cancelado', 'Ocurrió un error al Actualizar.');

        }
    }

    const handleOpenModal = (e) => {
        e.preventDefault(); // evita que el formulario se envíe

        setPendingSubmit(true)
        setModalOpen(true)
    };
    const handleCloseModal = (e) => {
        e.preventDefault()

        setPendingSubmit(false)
        setModalOpen(false)
    }

    const handleErrors = (e) => {
        if (e.dataInfo) {
            setErrorsObject(e)
        } else {
            setErrorMessage(e)
        }
    }

    return (
        <>
            <Header title={'Sedes'}>
                {/*
                    <AddButton text={'Agregar Sedes'} onClick={() => {
                    setOpen('sedes')
                }} />
                */}
            </Header>
            <Table
                emptyMessage="No existen sedes"
                rowKey="sede_id"
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
                data={sedes}
                renderExpanded={(row) => (
                    <>
                        <div className="info-card">
                            <div className="info-label">
                                <strong>Propietario:</strong>
                                <strong>{row.cliente.nombreCliente + ' - ' + row.cliente.rutCliente || 'Sin Datos'}</strong>
                            </div>
                            <div className="data-line" />
                            <div className="info-label">
                                <strong>Rut secundario:</strong>
                                <strong>{row.rutSecundario || 'Sin Datos'}</strong>
                            </div>
                            <div className="data-line" />


                            <div className="info-label">
                                <strong>Contratos asociados a la sede:</strong>
                                <strong>{row.contratos.length}</strong>
                            </div>
                            <div className="data-line" />

                            <div className="info-label">
                                <strong>Anexos asociados a la sede:</strong>
                                <strong>{row.anexos}</strong>
                            </div>
                            <div className="data-line" />

                            <div className="info-label">
                                <strong>Historial:</strong>
                                <strong>{row.historial}</strong>
                            </div>
                            <div className="data-line" />
                            <div className="info-label">
                                <strong>Contactos:</strong>
                                <strong>{row.contactos.length}</strong>
                            </div>
                            <div className="data-line" />
                            <div className="add-buttons">
                                <button className="action-button"
                                    onClick={() => setOpen('newContactos')}>
                                    <ContactRound />
                                    Agregar Contacto(s)
                                </button>
                                <button className="action-button">
                                    <UserRoundPlus />
                                    Asignar Trabajador(es)
                                </button>
                            </div>
                            <Table
                                title='Contactos'
                                emptyMessage="No existen contactos"
                                rowKey={'contacto_id'}
                                data={row.contactos}
                                columns={
                                    [{
                                        field: "nombreContacto",
                                        header: "Nombre"
                                    },
                                    {
                                        field: "contacto_rut",
                                        header: "RUT"
                                    },
                                    {
                                        field: "email",
                                        header: "Correo"
                                    },
                                    {
                                        field: "phone",
                                        header: "Teléfono"
                                    },
                                    {
                                        field: "tipoContacto",
                                        header: "Tipo"
                                    }]
                                }

                            >

                            </Table>
                        </div>
                    </>
                )}
                actions={(row) => (
                    <>
                        <button className="action-button"
                            onClick={() => {
                                setSelected(row);
                                setExistingContacts(row.contactos);
                                setNewContacts([{
                                    nombreContacto: '',
                                    contacto_rut: '',
                                    email: '',
                                    phone: '',
                                    tipoContacto: ''
                                }]);
                                setOpen('updateSede');
                            }} >
                            <UserRoundPen />
                        </button>
                    </>
                )}
            />

            {/*Agregar Sedes con Anexo */}
            <Modal
                title={'Agregar Sedes'}
                open={open === 'sedes'}
                onClose={() => setOpen('')}
                isForm
                footer={


                    <span className={`error-message`}>
                        {errorsObject?.dataInfo ? `Error: ${errorsObject?.dataInfo}. ${errorsObject?.message}` : errorMessage}
                    </span>

                }
            >
                <form action="">

                    <SedesArray sedes={newSedes} setFormData={setNewSedes}
                        sedesPath={[]} />
                    <br />
                    <Acordeon title={`Anexo(s)`} level={0}
                        isOpen={accOpen === "anexo"}
                        onToggle={() => {
                            setAccOpen(accOpen === "anexo" ? null : "anexo")
                        }}
                        content={
                            <AnexosArray
                                anexos={anexos}
                                setFormData={setAnexos}
                                anexosPath={[]}
                                isUpdate={true} />
                        }
                    />

                </form>
            </Modal>


            {/*Actualizar Contactos + Sede */}
            <form onSubmit={handleOpenModal}>
                <Modal
                    open={open === 'updateSede'}
                    title={selected?.nombre_sede}
                    subtitle={selected.direccion}
                    onClose={() => setOpen('')}
                    errorMessage={errorMessage}
                    errorsObject={errorsObject}
                    isForm={true}

                >
                    <SedeRow sede={selected} onChange={setSelected} isUpdate />
                    <Acordeon title={`Contactos Actuales (${selected.contactos.length})`}
                        isOpen={accOpen === 'updateSede'}
                        onToggle={() => accOpen === 'updateSede' ? setAccOpen('') : setAccOpen('updateSede')}
                        content={

                            <Contactos
                                level={1}
                                contactos={existingContacts}
                                onChange={setExistingContacts}
                                addContact={false}
                                isRegister={false}
                                isUpdate
                            />

                        }
                    />


                </Modal>
            </form>

            {/*Agregar Contactos */}
            <Modal
                title={'Nuevos Contactos'}
                open={open === 'newContactos'}
                onClose={() => setOpen('')}
                isForm={true}
                errorMessage={errorMessage}
                errorsObject={errorsObject}>
                <form onSubmit={handleOpenModal}>
                    <Contactos
                        level={1}
                        contactos={selected.contactos}
                        onChange={(updater) =>
                            setSelected(prev => ({
                                ...prev,
                                contactos: updater(prev.contactos)
                            }))
                        }
                        isRegister={true}
                        isUpdate={false}
                    />
                </form>
            </Modal>
            <Modal title={'AVISO'} isForm
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false)
                    setPendingSubmit(false)
                }}
                onAcept={(e) => {
                    if (open === "updateSede") {
                        handleUpdateSede(e);
                    } else {
                        handleSubmit(e);
                    }
                }}
            >
                ¿Confirmar cambios?
            </Modal>

        </>
    )
}