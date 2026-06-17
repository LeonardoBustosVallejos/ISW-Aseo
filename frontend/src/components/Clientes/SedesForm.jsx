import { useState } from "react"
import {
    ChevronDown,
    Trash2,
    Plus
} from "lucide-react"

import Contactos from "./ContactosForm"
import "@styles/components/SedesForm.css"
import Acordeon from "../Acordeon"

export default function SedeRow({ sede, setFormData, path, removeSede, index, largo, formatRut }) {

    const [open, setOpen] = useState(false)
    const [openContactos, setOpenContactos] = useState(null)
    const [openSede, setOpenSede] = useState(index)

    const getReference = (obj) => {
        let ref = obj

        for (const key of path) {
            ref = ref[key]
        }

        return ref
    }

    const handleChange = (field, value) => {
        setFormData(prev => {
            const copia = structuredClone(prev)

            const sedeRef = getReference(copia)

            sedeRef[field] = value

            return copia
        })
    }

    return (
        <div className="multiple-acordeon">
            <Acordeon title={`${index + 1}. Sede ${sede.direccion || 'Sin Dirección'}`}
                isOpen={openSede === index}
                onToggle={() => setOpenSede(openSede === index ? null : index)}
                content={
                    <div >

                        {/* HEADER */}

                        <div className="sede-header">



                            {/* direccion */}

                            <div className="form-group sede-direccion">

                                <label className="label">
                                    Dirección
                                    <span style={{ color: "red", marginLeft: "4px" }}>*</span>
                                </label>

                                <input type="text"
                                    value={sede?.direccion}
                                    onChange={(e) => handleChange("direccion", e.target.value)}
                                    className="input"
                                />

                            </div>

                            {/* tipo */}

                            <div className="form-group">

                                <label className="label">
                                    Tipo
                                    <span style={{ color: "red", marginLeft: "4px" }}>*</span>
                                </label>

                                <select
                                    value={sede?.tipoSede}
                                    onChange={(e) => handleChange("tipoSede", e.target.value)}
                                    className="input"
                                >
                                    <option value="">Seleccionar</option>
                                    <option value="PRINCIPAL">PRINCIPAL</option>
                                    <option value="SUCURSAL">SUCURSAL</option>
                                    <option value="FILIAL">FILIAL</option>

                                </select>

                            </div>

                            {/* personal */}

                            <div className="form-group">

                                <label className="label">
                                    Personal
                                    <span style={{ color: "red", marginLeft: "4px" }}>*</span>
                                </label>

                                <input
                                    type="number"
                                    min={0}
                                    value={sede?.personalSolicitado}
                                    onChange={(e) => handleChange("personalSolicitado", e.target.value)}
                                    className="input"
                                />

                            </div>

                            {/* botones */}

                            <div className="action-buttons">

                                {/* abrir */}

                                <button
                                    type="button"
                                    onClick={() => setOpen(!open)}
                                    className="expand-button"
                                >

                                    <ChevronDown color="white"
                                        className={`${open ? "rotate" : ""}`}
                                    />

                                </button>


                            </div>
                        </div>

                        {/* BODY */}

                        {open && (

                            <div
                                className="card-body"
                            >
                                {/* nombre */}
                                <div className="sede-body-grid">

                                    <div className="form-group">

                                        <label className="label">Nombre Sede</label>

                                        <input type="text"
                                            value={sede?.nombre_sede}
                                            onChange={(e) => handleChange("nombre_sede", e.target.value)}
                                            className="input"
                                        />

                                    </div>
                                    <div className="form-group">
                                        <label className="label">
                                            RUT Secundario
                                            <span className="text-red-500 ml-1"></span>
                                        </label>
                                        <input type="text" name="rutCliente" value={sede.rut_secundario}
                                            onChange={(e) => handleChange("rut_secundario", formatRut(e.target.value))} className="input" placeholder="12345678-9" />
                                    </div>
                                </div>


                            </div>
                        )}

                        <Acordeon
                            title={`Contactos de Sede ${sede?.nombre_sede || index + 1} (${sede.contactos.length})`} level={3}
                            required={true}
                            isOpen={openContactos === index}
                            onToggle={() => setOpenContactos(openContactos === index ? null : index)}
                            content={

                                <Contactos
                                    contactos={sede.contactos}
                                    setFormData={setFormData}
                                    path={[...path, "contactos"]}
                                    formatRut={formatRut}
                                />
                            }
                        />

                    </div>
                }
            />
            {/* eliminar */}

            <button
                type="button"
                onClick={() => removeSede(index)}
                disabled={largo === 1}
                className={`remove-button ${largo === 1 ? "oculto" : ""}`}

            >

                <Trash2 size={18} />
            </button>
        </div>

    )
}