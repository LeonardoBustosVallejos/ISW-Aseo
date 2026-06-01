import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';
import { registerCliente } from '@services/clientes.service';
import Acordeon from '@components/acordeon';
import DocumentoRow from '../../components/Contrato/Documentos';
import SedeRow from '../../components/SedesForm';
import ContratoRow from '../../components/Contrato/ContratoComercialForm';
import AnexoRow from '../../components/Contrato/AnexoComercial';
import { Plus } from 'lucide-react';


/**
 * 
 * @returns body anidado con el cliente y supervisor
 */
const RegisterClienteForm = () => {
    const [openSection, setOpenSection] = useState('cliente');
    const [openContacto, setOpenContacto] = useState(null);
    const [errors, setErrors] = useState({});

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
                tipoSede: '',
                contactos: [{
                    nombreContacto: '',
                    contacto_rut: '',
                    email: '',
                    phone: '',
                    tipoContacto: '',
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
                tipoDocumento: '',
                fileKey: "contrato_pdf",
                file: null
            }
        ],
        anexos: [

        ]

    });


    const getSectionFromErrors = (errors) => {
        if (
            errors.nombreCliente ||
            errors.rutCliente ||
            errors.direccion ||
            errors.personalSolicitado
        ) {
            return "cliente";
        }

        if (
            errors.nombreContacto ||
            errors.contacto_rut ||
            errors.email ||
            errors.phone
        ) {
            return "contacto";
        }

        if (
            errors.nombreCompleto ||
            errors.rut ||
            errors.email ||
            errors.password
        ) {
            return "supervisor";
        }

        return null;
    };

    useEffect(() => {
        if (Object.keys(errors).length === 0) return;

        const section = getSectionFromErrors(errors);

        if (section === "cliente") {
            setOpenSection("cliente");
        }

        if (section === "contacto") {
            setOpenSection("cliente");   // 👈 contacto está dentro de cliente
            setOpenContacto("contacto");
        }

        if (section === "supervisor") {
            setOpenSection("supervisor");
        }
    }, [formData]);

    const setFieldError = (field, message) => {
        setErrors(prev => ({
            ...prev,
            [field]: message
        }));
    };


    const formatRut = (value) => {

        // dejar solo numeros y k
        let clean = value
            .replace(/[^0-9kK]/g, "")
            .toUpperCase()

        // si hay varias K, dejar solo una
        const hasK = clean.includes("K")

        // quitar todas las K
        clean = clean.replace(/K/g, "")

        // si habia K agregarla al final
        if (hasK) {
            clean += "K"
        }

        // máximo largo rut chileno
        clean = clean.slice(0, 9)

        // si está vacío
        if (clean.length === 0) return ""

        // separar cuerpo y dv
        const body = clean.slice(0, -1)
        const dv = clean.slice(-1)

        return `${body}-${dv}`
    }
    const handleChange = (field, value) => {


        setFormData((prev) => ({
            ...prev,
            cliente: {
                ...prev.cliente,

                [field]: value

            }
        }));
    };

    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            const response = await registerCliente(formData);
            if (response.status === 'Success') {
                showSuccessAlert('¡Registrado!', 'Usuario registrado exitosamente.');
                setTimeout(3000)
            } else if (response.status === 'Client error') {
                setErrors(response.details);
            }
        } catch (error) {
            console.error("Error al registrar un usuario: ", error);
            showErrorAlert('Cancelado', 'Ocurrió un error al registrarse.');
        }
    }

    return (
        <div className="container" style={{ height: "auto", minHeight: "100%", padding: "0 0" }}>
            <div className='form'>
                <h1>Registro de Cliente y Supervisor</h1>
                <form onSubmit={handleSubmit}>

                    {/* SECCIÓN CLIENTE */}
                    <Acordeon title={"Datos del Cliente"} isOpen={openSection === "cliente"}
                        required={true}
                        onToggle={() => {
                            setOpenSection(openSection === "cliente" ? null : "cliente")
                            setOpenContacto(null)
                        }}
                        content={
                            <div >

                                <div className="container_inputs">
                                    <label className="label">
                                        Nombre Empresa (Nombre de Fantasía)
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input type="text" name="nombreCliente" value={formData.cliente.nombreCliente}
                                        minLength={3}
                                        onChange={(e) => handleChange("nombreCliente", e.target.value)} className="input" required />
                                </div>

                                <div className="container_inputs">
                                    <label className="label">
                                        RUT de Empresa
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input type="text" name="rutCliente" value={formData.cliente.rutCliente}
                                        onChange={(e) => handleChange("rutCliente", formatRut(e.target.value))} className="input" placeholder="12345678-9" required />
                                </div>


                            </div>
                        } />

                    {/* SEDES */}
                    <Acordeon title="Sede" isOpen={openSection === "sedes"}
                        required={true}
                        onToggle={() => {
                            setOpenSection(openSection === "sedes" ? null : "sedes")
                            setOpenContacto(null)
                        }}
                        content={
                            <div>
                                {formData.sedes.map((sede, index) => (

                                    <SedeRow sede={sede}
                                        key={index}
                                        index={index}
                                        largo={formData.sedes.length}
                                        setFormData={setFormData}
                                        formatRut={formatRut}
                                        removeSede={(i) => {

                                            setFormData(prev => {
                                                const copia = structuredClone(prev)
                                                copia.sedes.splice(i, 1)
                                                return copia
                                            })
                                        }}
                                    />
                                ))}
                                <button
                                    type="button"
                                    onClick={() => {

                                        console.log(formData.sedes);
                                        setFormData(prev => ({

                                            ...prev,

                                            sedes: [

                                                ...prev.sedes,

                                                {
                                                    nombre_sede: '',
                                                    direccion: '',
                                                    personalSolicitado: '',
                                                    tipoSede: '',
                                                    contactos: [{
                                                        nombreContacto: '',
                                                        contacto_rut: '',
                                                        email: '',
                                                        phone: '',
                                                        tipoContacto: '',
                                                    }]
                                                }
                                            ]

                                        }))
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">

                                    <Plus size={16} />

                                    Agregar Sede
                                </button>
                            </div>
                        }

                    />
                    {/*CONTRATO */}
                    <Acordeon title="Contrato"
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
                            />
                        }
                    />
                    {/*ANEXOS */}
                    <Acordeon title="Anexo(s)"
                        isOpen={openSection === "anexo"}
                        onToggle={() => {
                            setOpenSection(openSection === "anexo" ? null : "anexo")
                            setOpenContacto(null)
                        }}
                        content={
                            <div>

                                {formData.anexos.map((anexo, index) => (

                                    <AnexoRow anexo={anexo}
                                        key={index}
                                        index={index}
                                        setFormData={setFormData}
                                        contrato={formData.contrato}
                                        removeAnexo={(i) => {

                                            setFormData(prev => {

                                                const copia =
                                                    structuredClone(prev)

                                                copia.anexos.splice(i, 1)

                                                return copia
                                            })
                                        }}
                                    />

                                )
                                )}
                                {/*Botón de agregar anexo */}
                                <button
                                    type="button"
                                    onClick={() => {

                                        setFormData(prev => ({

                                            ...prev,

                                            anexos: [

                                                ...prev.anexos,

                                                {
                                                    datos: {
                                                        numeroAnexo: "",
                                                        fechaInicio: formData.contrato.fechaInicio,
                                                        fechaFin: formData.contrato.fechaFinOriginal,
                                                        montoNuevo: formData.contrato.monto,
                                                        cantidadMinTrabajadores: formData.contrato.cantidadMinTrabajadores,
                                                        cantidadMaxTrabajadores: formData.contrato.cantidadMaxTrabajadores,
                                                        tipoJornada: formData.contrato.tipoJornada,
                                                        tipoAnexo: '',
                                                        detalles: '',
                                                        observacionesOperativas: '',
                                                        requiereGuardias: formData.contrato.requiereGuardias,
                                                        tamanoInstalacion: formData.contrato.tamanoInstalacion
                                                    },

                                                    documentos: [
                                                        {
                                                            nombrePersonalizado: '',
                                                            tipoDocumento: '',
                                                            fileKey: "anexo_pdf",
                                                            file: null
                                                        }
                                                    ]
                                                }
                                            ]
                                        }))
                                    }}
                                    className="bg-sky-900 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">

                                    <Plus size={16} />

                                    Agregar Anexo
                                </button>
                            </div>
                        }
                    />
                    <hr />

                    <div>
                        <span className={`error-message`}>
                            {errors.dataInfo ? `Error: ${errors.dataInfo}. ${errors.message}` : ''}
                        </span>
                    </div>
                    <hr />
                    <button type="submit">Registrar</button>
                </form>
            </div >
        </div >
    );
};

export default RegisterClienteForm