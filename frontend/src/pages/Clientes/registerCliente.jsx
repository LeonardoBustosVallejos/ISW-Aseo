import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';
import { registerCliente } from '@services/clientes.service';
import Acordeon from '@components/acordeon';
import ContratoRow from '@components/Contrato/ContratoComercialForm';
import AnexoRow from '@components/Contrato/AnexoComercial';
import { Trash2, TriangleAlert } from 'lucide-react';
import "@styles/registerCliente.css"
import DataClienteOFilial from '../../components/Clientes/DataClienteOFilialForm';
import AddButton from '../../components/misc/add-button';
import Header from '../../components/misc/Header';
import { Modal } from '../../components/Modal';
import { AnexosArray } from '../../components/Contrato/AnexoComercial';

/**
 * 
 * @returns body anidado con el cliente y supervisor
 */
const RegisterClienteForm = () => {
    const [openSection, setOpenSection] = useState('cliente');
    const [openContacto, setOpenContacto] = useState(null);
    const [openSedes, setOpenSedes] = useState(null);
    const [openFilial, setOpenFilial] = useState(null);
    const [errorsObject, setErrorsObject] = useState({});
    const [errorMessage, setErrorMessage] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [pendingSubmit, setPendingSubmit] = useState(false);

    /**Inicializar las variables/objetos base que son obligatorios para el registro */
    const [formData, setFormData] = useState({
        cliente: {
            nombreCliente: '',
            rutCliente: '',
            filiales: [],
        },
        sedes: [
            {
                nombre_sede: '',
                direccion: '',
                personalSolicitado: '',
                rutSecundario: '',
                tipoSede: 'PRINCIPAL',
                contactos: [{
                    nombreContacto: '',
                    contacto_rut: '',
                    email: '',
                    phone: '',
                    tipoContacto: 'PRINCIPAL',
                }]
            }
        ],
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
        anexos: []

    });




    const getSectionFromErrors = (errorsObject) => {
        if (
            errorsObject.nombreCliente ||
            errorsObject.rutCliente ||
            errorsObject.direccion ||
            errorsObject.personalSolicitado
        ) {
            return "cliente";
        }

        if (
            errorsObject.nombreContacto ||
            errorsObject.contacto_rut ||
            errorsObject.email ||
            errorsObject.phone
        ) {
            return "contacto";
        }

        if (
            errorsObject.nombreCompleto ||
            errorsObject.rut ||
            errorsObject.email ||
            errorsObject.password
        ) {
            return "supervisor";
        }

        return null;
    };

    useEffect(() => {
        if (Object.keys(errorsObject).length === 0) return;

        const section = getSectionFromErrors(errorsObject);

        if (section === "cliente") {
            setOpenSection("cliente");
        }
        if (section === "sedes") {
            setOpenSedes("sedes");
        }
        if (section === "contacto") {
            setOpenSection("cliente");   //contacto está dentro de cliente
            setOpenSedes("sedes");
            setOpenContacto("contacto");
        }

        if (section === "supervisor") {
            setOpenSection("supervisor");
        }
    }, [formData]);

    const setFieldError = (field, message) => {
        setErrorsObject(prev => ({
            ...prev,
            [field]: message
        }));
    };

    const addFilial = () => {
        setFormData(prev => ({
            ...prev,
            cliente: {
                ...prev.cliente,
                filiales: [
                    ...prev.cliente.filiales,
                    {
                        nombreCliente: "",
                        rutCliente: formData.cliente.rutCliente,
                        sedes: [
                            {
                                nombre_sede: "",
                                direccion: "",
                                personalSolicitado: "",
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
                    }
                ]
            }
        }));
    };
    const removeFilial = (index) => {

        setFormData(prev => {

            const copia = structuredClone(prev);

            copia.cliente.filiales.splice(index, 1);

            return copia;
        });

        if (openFilial === `${index + 1}`) {
            setOpenFilial(null);
        }
    };




    const handleSubmit = async (e) => {
        try {
            e.preventDefault();

            setModalOpen(false)

            const response = await registerCliente(formData);
            if (response.status === 'Success') {
                showSuccessAlert('¡Registrado!', 'Usuario registrado exitosamente.');
                setTimeout(3000)
            } else if (response.status === 'Client error') {
                handleErrors(response.details);
            }
        } catch (error) {
            console.error("Error al registrar un usuario: ", error);

            showErrorAlert('Cancelado', 'Ocurrió un error al registrarse.');
        }
    }
    const handleOpenModal = (e) => {
        e.preventDefault(); // evita que el formulario se envíe

        setPendingSubmit(true)
        setModalOpen(true)
    };
    const handleErrors = (e) => {
        if (e.dataInfo) {
            setErrorsObject(e)
        } else {
            setErrorMessage(e)
        }
    }
    return (
        <div className="form-container">
            <Header title={'Registro de Cliente'} />

            <form onSubmit={handleOpenModal} className="form-card form-content">

                {/* SECCIÓN CLIENTE */}
                <Acordeon title={"Datos del Cliente"} level={0} isOpen={openSection === "cliente"}
                    required={true}
                    onToggle={() => {
                        setOpenSection(openSection === "cliente" ? null : "cliente")
                        setOpenContacto(null)
                    }}
                    content={
                        <div className="">
                            <DataClienteOFilial
                                data={formData.cliente}
                                sedes={formData.sedes}
                                dataPath={["cliente"]}
                                sedesPath={["sedes"]}
                                setFormData={setFormData}


                            />
                        </div>
                    } />

                {/*CONTRATO */}
                <Acordeon title="Contrato" level={0}
                    isOpen={openSection === "contrato"}
                    onToggle={() => {
                        setOpenSection(openSection === "contrato" ? null : "contrato")
                        setOpenContacto(null)
                    }}
                    required={true}

                    content={

                        <ContratoRow
                            contrato={formData.contrato}
                            documentos={formData.metadataDocumentos}
                            setFormData={setFormData}
                            level={0}
                        />
                    }
                />
                {/*ANEXOS */}
                <Acordeon title={`Anexo(s) (${formData.anexos.length})`} level={0}
                    isOpen={openSection === "anexo"}
                    onToggle={() => {
                        setOpenSection(openSection === "anexo" ? null : "anexo")
                        setOpenContacto(null)
                    }}
                    content={
                        <AnexosArray
                            anexos={formData.anexos}
                            setFormData={(updater) => {
                                setFormData(prev => ({
                                    ...prev,
                                    anexos: updater(prev.anexos)
                                }));
                            }}
                            contrato={formData.contrato}
                            anexosPath={["anexos"]}
                            isRegister
                        />


                    }
                />
                {/*FILIALES */}
                <Acordeon title={`Filial(es) (${formData.cliente.filiales.length})`} level={0}
                    isOpen={openSection === "filiales"}
                    onToggle={() => {
                        setOpenSection(openSection === "filiales" ? null : "filiales")
                        setOpenFilial(null)
                    }}
                    content={
                        <div >
                            {formData.cliente.filiales.map((filial, index) => (
                                <div className='multiple-acordeon'>

                                    <Acordeon title={`${index + 1}. ${filial?.nombreCliente || "Sin nombre"}`} level={1}
                                        isOpen={openFilial === `${index + 1}`}
                                        onToggle={() => setOpenFilial(openFilial === `${index + 1}` ? null : `${index + 1}`)}
                                        content={

                                            <DataClienteOFilial
                                                data={filial}
                                                sedes={filial.sedes}
                                                dataPath={["cliente", "filiales", index]}
                                                sedesPath={["cliente", "filiales", index, "sedes"]}
                                                setFormData={setFormData}
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
                                onClick={addFilial}
                                text={'Agregar Filial'}
                            />
                        </div>
                    }
                />
                {/*

                    <button type='button' className='checkbox-row' onClick={() => {
                        setAceptado(prev => !prev)
                        
                    }} style={{ backgroundColor: 'transparent' }}>

                    <input type="checkbox" name="aceptado"
                        checked={aceptado}
                        />

                    <label className='label' style={{ cursor: 'pointer' }}>
                        Acepto que toda la informacion entregada es correcta
                        <span className='required' style={{ display: 'flex' }}>*<TriangleAlert /> </span>
                    </label>

            </button>
                */}

                <div>
                    <span className={`error-message`}>
                        {errorsObject.dataInfo ? `Error: ${errorsObject.dataInfo}. ${errorsObject.message}` : errorMessage}
                    </span>
                </div>
                <hr />
                <button type="button" className='submit-button' onClick={() => setModalOpen(true)}>Registrar</button>

                <Modal open={modalOpen}
                    title={'AVISO'}
                    onClose={() => setModalOpen(false)}
                    isForm={true}
                    onAcept={handleSubmit}

                >
                    ¿Acepta que toda la informacion entregada es correcta?
                </Modal>
            </form >

        </div >
    );
};

export default RegisterClienteForm