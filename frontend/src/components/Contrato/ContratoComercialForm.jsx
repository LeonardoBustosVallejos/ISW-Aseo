import { useState } from "react"
import { ChevronDown } from "lucide-react"
import Documentos from "./Documentos"
import "@styles/components/ContratoComercialForm.css"
import Acordeon from "../Acordeon"

export default function ContratoRow({ contrato, documentos, setFormData, level = 0 }) {

    const [open, setOpen] = useState(false)
    const [openDocumento, setOpenDocumento] = useState('')

    const handleChange = (
        field,
        value
    ) => {

        setFormData(prev => ({

            ...prev,

            contrato: {

                ...prev.contrato,

                [field]: value
            }

        }))
    }

    return (
        <>
            <div className="contrato-card">

                {/* HEADER */}

                <div className="contrato-header contrato-grid">

                    {/* inicio */}

                    <div className="contrato-field">

                        <label className="label">
                            Inicio
                            <span style={{ color: "red", marginLeft: "4px" }}>*</span>
                        </label>

                        <input
                            type="date"
                            value={contrato?.fechaInicio}
                            onChange={(e) => handleChange("fechaInicio", e.target.value)}
                            className="input "
                        />

                    </div>

                    {/* fin */}

                    <div className="contrato-field">

                        <label className="label">
                            Fin
                            <span style={{ color: "red", marginLeft: "4px" }}>*</span>
                        </label>

                        <input
                            type="date"
                            value={contrato?.fechaFinOriginal}
                            onChange={(e) => handleChange("fechaFinOriginal", e.target.value)}
                            className="input w-full"
                        />

                    </div>

                    {/* jornada */}

                    <div className="contrato-field">

                        <label className="label">
                            Jornada
                            <span style={{ color: "red", marginLeft: "4px" }}>*</span>
                        </label>

                        <select
                            value={contrato?.jornada}
                            onChange={(e) => handleChange("jornada", e.target.value)}
                            className="input w-full"
                        >
                            <option value="">Seleccionar</option>
                            <option value="COMPLETA">COMPLETA</option>
                            <option value="PARCIAL">PARCIAL</option>

                        </select>

                    </div>

                    {/* tipo jornada */}

                    <div className="contrato-field">

                        <label className="label">
                            Tipo Jornada
                            <span style={{ color: "red", marginLeft: "4px" }}>*</span>
                        </label>

                        <select
                            value={contrato.tipoJornada}
                            onChange={(e) => handleChange("tipoJornada", e.target.value)}
                            className="input w-full"
                        >
                            <option value="">Seleccionar</option>
                            <option value="DIURNA">DIURNA</option>
                            <option value="NOCTURNA">NOCTURNA</option>
                            <option value="MIXTA">MIXTA</option>
                            <option value="TURNOS">TURNOS</option>

                        </select>

                    </div>

                    {/* tamaño */}

                    <div className="contrato-field">

                        <label className="label">
                            Tamaño
                            <span style={{ color: "red", marginLeft: "4px" }}>*</span>
                        </label>

                        <select
                            value={contrato?.tamanoInstalacion}
                            onChange={(e) => handleChange("tamanoInstalacion", e.target.value)}
                            className="input w-full"
                        >
                            <option value="">Seleccionar</option>
                            <option value="PEQUENA">PEQUEÑA</option>
                            <option value="MEDIANA">MEDIANA</option>
                            <option value="GRANDE">GRANDE</option>
                            <option value="INDUSTRIAL">INDUSTRIAL</option>

                        </select>

                    </div>

                    {/* trabajadores */}

                    <div className="contrato-field">

                        <label className="label">
                            N° Mínimo Trabajadores
                            <span style={{ color: "red", marginLeft: "4px" }}>*</span>
                        </label>

                        <input
                            type="number"
                            min={1}
                            max={contrato.cantidadMaxTrabajadores || 1}
                            placeholder="1"
                            value={contrato?.cantidadMinTrabajadores}
                            onChange={(e) => handleChange("cantidadMinTrabajadores", e.target.value)}
                            className="input w-full"
                        />

                    </div>
                    <div className="contrato-field">

                        <label className="label">
                            N° Máximo Trabajadores
                            <span style={{ color: "red", marginLeft: "4px" }}>*</span>
                        </label>

                        <input
                            type="number"
                            min={contrato.cantidadMinTrabajadores || 1}
                            placeholder={contrato.cantidadMinTrabajadores || 1}
                            value={contrato?.cantidadMaxTrabajadores}
                            onChange={(e) => handleChange("cantidadMaxTrabajadores", e.target.value)}
                            className="input w-full"
                        />

                    </div>

                    {/* monto + botón */}
                    <div className="contrato-grid">

                        <div className="contrato-field">
                            <label className="label">
                                Monto
                                <span style={{ color: "red", marginLeft: "4px" }}>*</span>
                            </label>

                            <input
                                type="number"
                                min={0}
                                value={contrato?.monto}
                                onChange={(e) => handleChange("monto", e.target.value)}
                                className="input w-full"
                            />

                        </div>
                        <div className="contrato-actions">

                            <button
                                type="button"
                                onClick={() =>
                                    setOpen(!open)
                                }
                                className="expand-button"
                            >

                                <ChevronDown color="white" className={`${open ? "rotate" : ""}`} />

                            </button>

                        </div>
                    </div>

                </div>

                {/* BODY */}

                {open && (

                    <div className="contrato-body">

                        {/* textareas */}

                        <div className="contrato-grid">

                            {/* observaciones */}

                            <div className="contrato-field">

                                <label className="label">Observaciones</label>

                                <textarea
                                    value={contrato?.observacionesOperativas}
                                    onChange={(e) => handleChange("observacionesOperativas", e.target.value)}
                                    className="input textarea-large"
                                />

                            </div>

                            {/* detalles */}

                            <div className="contrato-field">

                                <label className="label">Detalles</label>

                                <textarea
                                    value={contrato?.detalles}
                                    onChange={(e) => handleChange("detalles", e.target.value)}
                                    className="input textarea-large"
                                />

                            </div>

                        </div>

                        {/* checkbox */}

                        <button type="button" className="checkbox-row" onClick={(e) => handleChange("requiereGuardias", !contrato.requiereGuardias)}
                            style={{ backgroundColor: 'transparent' }}
                        >

                            <input
                                type="checkbox"
                                checked={contrato?.requiereGuardias}

                            />

                            <label>
                                Requiere guardias
                            </label>

                        </button>


                    </div>
                )}
                {/* documentos */}

            </div>
            <br />
            <Acordeon
                title={`Documentos del contrato (${documentos.length})`}
                level={level + 1}
                required={true}
                isOpen={openDocumento === `contrato`}
                onToggle={() =>
                    setOpenDocumento(openDocumento === `contrato` ? null : `contrato`)
                }
                content={

                    <Documentos
                        documentos={documentos}
                        setDocumentos={(updater) =>
                            setFormData(prev => ({
                                ...prev,
                                metadataDocumentos: updater(prev.metadataDocumentos)
                            }))
                        }
                        path="metadataDocumentos"
                        tipo="CONTRATO"
                    />
                }
            />
        </>
    )
}