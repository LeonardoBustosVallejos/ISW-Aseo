import { useState } from "react"
import {
    ChevronDown,
    Trash2,
    Plus
} from "lucide-react"

import Contactos from "./ContactosForm"
import "@styles/components/SedesForm.css"

export default function SedeRow({ sede, setFormData, removeSede, index, largo, formatRut }) {

    const [open, setOpen] = useState(false)

    const handleChange = (field, value) => {

        setFormData(prev => {

            const copia = structuredClone(prev)

            copia.sedes[index][field] = value

            return copia
        })
    }

    return (

        <div className=" card">

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
                    <Contactos
                        contactos={sede.contactos}
                        setFormData={setFormData}
                        path={`sedes.${index}.contactos`}
                        formatRut={formatRut}
                    />

                </div>
            )}



        </div>
    )
}