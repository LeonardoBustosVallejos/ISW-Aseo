import { Plus, Trash2 } from "lucide-react"
import "@styles/components/ContactosForm.css"
import Acordeon from "../Acordeon"
import { useState } from "react"

export default function Contactos({ contactos, setFormData, path, formatRut }) {

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
        if (!value.startsWith("+56")) {
            value = "+56"
        }

        // mantener solo numeros después de +56
        let numbers = value
            .replace("+56", "")
            .replace(/\D/g, "")
            .slice(0, 9)

        return `+56${numbers}`
    }

    // agregar

    const addContacto = () => {

        setFormData(prev => {

            const copia = structuredClone(prev)

            const ref = getReference(copia)

            ref.push({

                nombreContacto: "",
                contacto_rut: "",
                email: "",
                tipoContacto: "",
                phone: ""

            })

            return copia
        })
    }

    // actualizar

    const updateContacto = (
        index,
        field,
        value
    ) => {

        setFormData(prev => {

            const copia = structuredClone(prev)

            const ref = getReference(copia)

            ref[index][field] = value

            return copia
        })
    }

    // eliminar

    const removeContacto = (index) => {

        setFormData(prev => {

            const copia = structuredClone(prev)

            const ref = getReference(copia)

            ref.splice(index, 1)

            return copia
        })
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
                    className="add-button"
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
                        isOpen={openContacto === index}
                        onToggle={() => setOpenContacto(openContacto === index ? null : index)}
                        content={
                            <div key={index} className="contacto-card">

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
                        disabled={contactos.length <= 1}
                        type="button"
                        onClick={() => removeContacto(index)}
                        className={`remove-button ${contactos.length <= 1 ? "oculto" : ""}`}
                    >
                        <Trash2 size={16} />
                    </button>

                </div>
            ))
            }

        </div >
    )
}