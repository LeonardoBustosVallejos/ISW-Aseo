import { useEffect, useState } from "react";
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';
import { Table } from "../../../components/Tabla2";
import AddButton from "../../../components/misc/add-button";
import { Modal } from "../../../components/Modal";
import { SedeRow, SedesArray } from "../../../components/Clientes/SedesForm";
import { ContactRound, Pencil, Trash2, UserRoundPen, UserRoundPlus } from "lucide-react";
import EditButton from "../../../components/misc/edit-button";
import ContactosTable from "./ContactosTable";
import Contactos from "../../../components/Clientes/ContactosForm";
import Acordeon from "../../../components/Acordeon";
import Header from "../../../components/misc/Header";
import AnexoRow, { AnexosArray } from "../../../components/Contrato/AnexoComercial";
import { createContactos, updateContactos, updateSede } from "../../../services/clientes.service";
import { useErrors } from "../../../hooks/errors";
import { formatDate, formatDateTime } from "../../../helpers/formatDate";
export default function SedesTable({ sedes, noTitle = false }) {

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
    const [selectedId, setSelectedId] = useState(0)
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

    const [modalOpen, setModalOpen] = useState(false)
    const { errorsObject, setErrors, cleanObject, displayError } = useErrors()

    const handleUpdateSede = async () => {
        try {

            const response = await updateSede(selected.sede_id, selected)

            if (response.status === 'Success') {
                showSuccessAlert('Actualizado!', 'Datos actualizados con éxito.\nRecargue la página para ver los cambios')
                setTimeout(3000)
            } else if (response.status === 'Client error') {

                setErrors(response);
            }





        } catch (error) {
            console.error("Error al actualizar una sede: ", error);

            showErrorAlert('Cancelado', 'Ocurrió un error al Actualizar.');
        }
    }
    const handleUpdateContact = async () => {
        try {
            const response = await updateContactos(existingContacts)

            if (response.status === 'Success') {
                showSuccessAlert('Actualizado!', 'Datos actualizados con éxito. \nRecargue la página para ver los cambios')
                setTimeout(3000)
            } else if (response.status === 'Client error') {

                setErrors(response);
            }


        } catch (error) {
            console.error("Error al actualizar contactos: ", error);

            showErrorAlert('Cancelado', 'Ocurrió un error al Actualizar.');

        }
    }
    const handleCreateContact = async () => {
        try {

            const response = await createContactos(newContacts, selectedId)

            if (response.status === 'Success') {
                showSuccessAlert('Actualizado!', 'Datos actualizados con éxito. \nRecargue la página para ver los cambios')
                setTimeout(3000)
            } else if (response.status === 'Client error') {

                setErrors(response);
            }
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
    const closeConfirmModal = (e) => {
        e.preventDefault()
        setPendingSubmit(false)
        setModalOpen(false)
    }
    const closeFormModal = (e) => {
        e.preventDefault()
        setPendingSubmit(false)
        setModalOpen(false)
        cleanObject()
        setOpen('')
    }
    console.log(displayError);

    return (
        <>
            <Table
                title={noTitle ? '' : 'Sedes'}
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
                            <div className="info-label">
                                <strong>Fecha de Registro:</strong>
                                <strong>{formatDate(row.createdAt)}</strong>
                            </div>
                            <div className="data-line" />

                            <div className="info-label">
                                <strong>Última actualización:</strong>
                                <strong>{formatDateTime(row.updatedAt)}</strong>
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
                                        field: "tipoContacto",
                                        header: "Tipo"
                                    }]
                                }
                                actions={cont => (
                                    <div className="table-actions">
                                        <button className="action-button"
                                            onClick={() => {
                                                console.log(row.contactos);

                                                setExistingContacts([cont]);
                                                setOpen('updateContact');
                                            }} >
                                            <UserRoundPen />
                                        </button>
                                        <button type="button"

                                            className={`remove-button ${row.contactos.length < 2 ? 'oculto' : ''}`} disabled={row.contactos.length < 2}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                )}
                                renderExpanded={(cont) => (<div className="info-card">


                                    <div className="info-label">
                                        <strong>Nombre:</strong>
                                        <strong>{cont.nombreContacto || 'Sin Datos'}</strong>
                                    </div>
                                    <div className="data-line" />
                                    <div className="info-label">
                                        <strong>Rut del contacto:</strong>
                                        <strong>{cont.contacto_rut || 'Sin Datos'}</strong>
                                    </div>
                                    <div className="data-line" />

                                    <div className="info-label">
                                        <strong>Correo de contacto:</strong>
                                        <strong>{cont.email}</strong>
                                    </div>
                                    <div className="data-line" />

                                    <div className="info-label">
                                        <strong>Teléfono de contacto:</strong>
                                        <strong>{cont.phone || 'Sin Datos'}</strong>
                                    </div>
                                    <div className="data-line" />

                                    <div className="info-label">
                                        <strong>Tipo de contacto:</strong>
                                        <strong>{cont.tipoContacto}</strong>
                                    </div>
                                    <div className="data-line" />

                                    <div className="info-label">
                                        <strong>Fecha de registro:</strong>
                                        <strong>{formatDateTime(cont.createdAt)}</strong>
                                    </div>
                                    <div className="data-line" />

                                    <div className="info-label">
                                        <strong>Última actualización:</strong>
                                        <strong>{formatDateTime(cont.updatedAt)}</strong>
                                    </div>
                                    <div className="data-line" />
                                </div>)}
                            >

                            </Table>
                        </div>
                    </>
                )}
                actions={(row) => (
                    <>
                        <EditButton onClick={() => {
                            setSelected(row);
                            setSelectedId(row.sede_id)
                            setExistingContacts(row.contactos);
                            setNewContacts([{
                                nombreContacto: '',
                                contacto_rut: '',
                                email: '',
                                phone: '',
                                tipoContacto: ''
                            }]);
                            setOpen('updateSede');
                        }} />

                    </>
                )}
            />


            {/*Actualizar Contactos + Sede */}
            <Modal
                open={open === 'updateSede'}
                title={selected?.nombre_sede}
                subtitle={selected.direccion}
                onClose={closeFormModal}
                isForm={true}
                onAcept={handleOpenModal}
                footer={
                    <span className={`error-message`}>
                        {displayError}
                    </span>
                }
            >
                <form>
                    <SedeRow sede={selected} onChange={setSelected} isUpdate />
                    <Acordeon title={`Contactos Actuales (${selected.contactos.length})`}
                        isOpen={accOpen === 'updateSede'}
                        onToggle={() => accOpen === 'updateSede' ? setAccOpen('') : setAccOpen('updateSede')}
                        content={

                            <Contactos
                                level={1}
                                contactos={selected.contactos}
                                onChange={(updater) =>
                                    setSelected(prev => ({
                                        ...prev,
                                        contactos: updater(prev.contactos)
                                    }))}
                                addContact={false}
                                isRegister={false}
                                isUpdate
                            />

                        }
                    />
                </form>


            </Modal>

            {/*Actualizar UN contacto */}
            <Modal
                open={open === 'updateContact'}
                title={'Actualizar Contacto'}
                subtitle={selected.direccion}
                onClose={closeFormModal}
                isForm={true}
                onAcept={handleOpenModal}
                footer={
                    <span className={`error-message`}>
                        {displayError}
                    </span>
                }
            >
                <form >

                    <Contactos
                        contactos={existingContacts}
                        onChange={setExistingContacts}
                        addContact={false}
                        isRegister={false}
                        isUpdate
                    />



                </form>
            </Modal>

            {/*Agregar Contactos */}
            <Modal
                title={'Nuevos Contactos'}
                open={open === 'newContactos'}
                onClose={() => setOpen('')}
                isForm={true}
                onAcept={handleOpenModal}
                footer={
                    <span className={`error-message`}>
                        {displayError}
                    </span>
                }
            >
                <form>
                    <Contactos
                        level={1}
                        contactos={newContacts}
                        onChange={setNewContacts}
                        isAparte={true}
                    />
                </form>
            </Modal>

            {/*AVISO DE CONFIRMACION */}
            <Modal title={'AVISO'} isForm
                open={modalOpen}
                onClose={(e) => {
                    closeConfirmModal(e)
                }}
                onAcept={(e) => {
                    if (open === "updateSede") {
                        handleUpdateSede(e);
                    } else if (open === "updateContact") {
                        handleUpdateContact(e);
                    } else if (open === 'newContactos') {
                        handleCreateContact(e)
                    }
                    closeConfirmModal(e)
                }}
            >
                ¿Confirmar cambios?
            </Modal>

        </>
    )
}