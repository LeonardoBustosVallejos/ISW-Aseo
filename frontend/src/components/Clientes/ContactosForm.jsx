import { Plus, Trash2 } from "lucide-react"
import "@styles/components/ContactosForm.css"
import Acordeon from "../Acordeon"
import { useEffect, useState } from "react"
import { formatRut } from "../../helpers/formatRut"

export default function Contactos({ contactos, onChange, level = 0, addContact = 'old', isRegister = true, isUpdate = false }) {
    const [openContacto, setOpenContacto] = useState(0)

    const getReference = (obj) => {
        let ref = obj

        for (const key of path) {
            ref = ref[key]
        }

        return ref
    }
    const formatPhone = (value) => {


        // si borran todo


        // mantener solo numeros después de +56
        let numbers = value
            .replace("+56", "")
            .replace(/\D/g, "")
            .slice(0, 9)
        if (!numbers || value === '') {
            return ''
        }
        return `+56${numbers}`
    }



    // agregar

    const addContacto = () => {

        onChange(prev => ([

            ...prev,

            {

                nombreContacto: "",
                contacto_rut: "",
                email: "",
                phone: "",
                tipoContacto: ""

            }

        ]));
    }

    // actualizar

    const updateContacto = (
        index,
        field,
        value
    ) => {

        onChange(prev =>

            prev.map((contacto, i) =>
                i === index ?
                    { ...contacto, [field]: value } : contacto
            )

        );
    }

    // eliminar

    const removeContacto = (index) => {

        onChange(prev =>

            prev.filter((_, i) =>

                i !== index

            )
        );
    }

    return (

        <div className="contactos-container">

            {/* titulo */}

            <div className="contactos-header">

                <h3 className="section-title">
                    Contactos
                </h3>

                <button
                    type="button"
                    onClick={addContacto}
                    className={`action-button ${addContact ? '' : 'oculto'}`}
                >

                    <Plus size={16} />
                    Agregar contacto

                </button>

            </div>

            {/* lista */}
            <div>

            </div>
            {contactos.map((contacto, index) => (

                <div className="multiple-acordeon">
                    {/* nombre */}
                    <Acordeon title={`${index + 1}. ${contacto.nombreContacto || '**Sin nombre'} ${contacto.contacto_rut || '**Sin Rut'} ${contacto.email || '**Sin email'}`}
                        level={level}
                        isOpen={openContacto === index}
                        onToggle={() => setOpenContacto(openContacto === index ? null : index)}
                        content={
                            <div key={index} className="contacto-card interior">

                                <div className="contacto-field">

                                    <label className="label">
                                        Nombre
                                        <span style={{ color: "red", marginLeft: "4px" }}>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        value={contacto.nombreContacto}
                                        onChange={(e) => updateContacto(index, "nombreContacto", e.target.value)}
                                        className="input" required
                                    />

                                </div>

                                {/* rut */}

                                <div className="contacto-field">

                                    <label className="label">
                                        RUT
                                        <span style={{ color: "red", marginLeft: "4px" }}>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        value={contacto.contacto_rut}
                                        onChange={(e) => updateContacto(index, "contacto_rut", formatRut(e.target.value))}
                                        className="input" required
                                    />

                                </div>

                                {/* email */}

                                <div className="contacto-field">

                                    <label className="label">
                                        Email
                                        <span style={{ color: "red", marginLeft: "4px" }}>*</span>
                                    </label>

                                    <input
                                        type="email"
                                        value={contacto.email}
                                        onChange={(e) => updateContacto(index, "email", e.target.value)}
                                        className="input" required
                                    />

                                </div>

                                {/* Telefono */}

                                <div className="contacto-field">

                                    <label className="label">Teléfono</label>

                                    <input
                                        type="tel"
                                        className="input"
                                        value={contacto.phone}
                                        onChange={(e) =>
                                            updateContacto(
                                                index,
                                                "phone",
                                                formatPhone(e.target.value)
                                            )
                                        }
                                        placeholder="+56912345678"
                                        onFocus={(e) => {
                                            if (!e.target.value.startsWith("+56")) {
                                                updateContacto(index, "phone", "+56")
                                            }
                                        }}
                                        pattern="^(?:\+56|56)?\s?(?:9\d{8}|[2-7]\d{8})$"
                                    />

                                </div>

                                {/* tipo */}

                                <div className="contacto-field">

                                    <label className="label">
                                        Tipo
                                        <span style={{ color: "red", marginLeft: "4px" }}>*</span>
                                    </label>

                                    <select
                                        value={contacto.tipoContacto}
                                        onChange={(e) => updateContacto(index, "tipoContacto", e.target.value)}
                                        className="input"
                                        disabled={contactos.length === 1}
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="PRINCIPAL">PRINCIPAL</option>
                                        <option value="SECUNDARIO">SECUNDARIO</option>

                                    </select>

                                </div>
                            </div>
                        }
                    />


                    {/* eliminar */}

                    <button
                        disabled={(contactos.length < 2 && isRegister) || isUpdate}
                        type="button"
                        onClick={() => removeContacto(index)}
                        className={`remove-button ${((contactos.length < 2 && isRegister) || isUpdate) ? "oculto" : ""}`}
                    >
                        <Trash2 size={16} />
                    </button>

                </div>
            ))
            }

        </div >
    )
}

