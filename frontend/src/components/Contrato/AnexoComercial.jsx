import { useState } from "react"
import {
    ChevronDown,
    Trash2
} from "lucide-react"
import Acordeon from '../Acordeon.jsx';
import Documentos from "./Documentos"
import "@styles/components/AnexoForm.css"

export default function AnexoRow({ anexo, index, setFormData, removeAnexo, contrato = null }) {

    const [open, setOpen] = useState(false)

    const [openAnexo, setOpenAnexo] = useState(null)
    const [openDocumento, setOpenDocumento] = useState('')

    // actualizar datos del anexo
    const handleChange = (field, value) => {

        setFormData(prev => {

            const copia = structuredClone(prev)

            copia.anexos[index].datos[field] = value

            return copia
        })
    }

    return (
        <div className="multiple-acordeon">

            <Acordeon title={`${index + 1}. Anexo ${anexo.datos.numeroAnexo || 'Sin Identificar'}`}
                required={true}
                isOpen={openAnexo === index}
                onToggle={() => setOpenAnexo(openAnexo === index ? null : index)}
                content={

                    <div className="anexo-card">
                        {/* HEADER */}

                        <div className="anexo-header ">

                            {/* numero */}

                            <div className="anexo-field">

                                <label className="label">Nº Anexo
                                    <span style={{ color: "red", marginLeft: "4px" }}>*</span>
                                </label>

                                <input
                                    type="text"
                                    value={anexo?.datos?.numeroAnexo}
                                    onChange={(e) => handleChange("numeroAnexo", e.target.value)}
                                    className="input w-full"
                                />

                            </div>

                            {/* tipo de anexo*/}

                            <div className="anexo-field">

                                <label className="label">
                                    Tipo Anexo
                                    <span style={{ color: "red", marginLeft: "4px" }}>*</span>
                                </label>

                                <select
                                    value={anexo?.datos.tipoAnexo}
                                    onChange={(e) => handleChange("tipoAnexo", e.target.value)}
                                    className="input w-full"
                                    required
                                >
                                    <option value="">Seleccionar</option>
                                    <option value="RENOVACION">RENOVACIÓN</option>
                                    <option value="AUMENTO_PERSONAL">AUMENTO PERSONAL</option>
                                    <option value="REDUCCION_PERSONAL">REDUCCIÓN PERSONAL</option>
                                    <option value="CAMBIO_MONTO">CAMBIO MONTO</option>
                                    <option value="SERVICIO_ADICIONAL">SERVICIO ADICIONAL</option>
                                    <option value="OTRO">OTRO</option>

                                </select>

                            </div>


                            {/* botones */}

                            <div className="action-buttons">

                                {/* abrir */}

                                <button
                                    type="button"
                                    onClick={() => setOpen(!open)}
                                    className="expand-button"
                                >

                                    <ChevronDown color="white" className={`${open ? "rotate" : ""}`}
                                    />

                                </button>



                            </div>

                        </div>

                        {/* BODY */}

                        {open && (

                            <div className="anexo-body">

                                {/* GRID */}

                                <div className="anexo-grid">
                                    {/* inicio */}

                                    <div className="anexo-field">

                                        <label className="label">Inicio</label>

                                        <input
                                            type="date"
                                            value={anexo.datos?.fechaInicio}
                                            onChange={(e) => handleChange("fechaInicio", e.target.value)}
                                            className="input w-full"
                                        />

                                    </div>

                                    {/* fin */}

                                    <div className="anexo-field">

                                        <label className="label">Fin</label>

                                        <input
                                            type="date"
                                            value={anexo?.datos?.fechaFin}
                                            onChange={(e) => handleChange("fechaFin", e.target.value)}
                                            className="input w-full"
                                        />

                                    </div>


                                    {/* max trabajadores */}

                                    <div className="anexo-field">

                                        <label className="label">Máx Trabajadores</label>

                                        <input
                                            type="number"
                                            min={0}
                                            value={anexo?.datos?.cantidadMaxTrabajadores}
                                            onChange={(e) => handleChange("cantidadMaxTrabajadores", e.target.value)}
                                            className="input w-full"
                                        />

                                    </div>

                                    {/* monto */}

                                    <div className="anexo-field">

                                        <label className="label">Monto Nuevo</label>

                                        <input
                                            type="number"
                                            min={0}
                                            value={anexo?.datos?.montoNuevo}
                                            onChange={(e) => handleChange("montoNuevo", e.target.value)}
                                            className="input w-full"
                                        />

                                    </div>

                                    {/* jornada */}

                                    <div className="anexo-field">

                                        <label className="label">Tipo Jornada</label>

                                        <select
                                            value={anexo?.datos?.tipoJornada}
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

                                    <div className="anexo-field">

                                        <label className="label">Tamaño Instalación</label>

                                        <select
                                            value={anexo?.datos?.tamanoInstalacion}
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

                                    {/* min trabajadores */}

                                    <div className="anexo-field">

                                        <label className="label">Min Trabajadores</label>

                                        <input
                                            type="number"
                                            min={0}
                                            value={anexo?.datos?.cantidadMinTrabajadores}
                                            onChange={(e) => handleChange("cantidadMinTrabajadores", e.target.value)}
                                            className="input w-full"
                                        />

                                    </div>

                                </div>

                                {/* guardias */}

                                <div className="checkbox-row">

                                    <input
                                        type="checkbox"
                                        checked={anexo?.datos?.requiereGuardias}
                                        onChange={(e) => handleChange("requiereGuardias", e.target.checked)}
                                    />

                                    <label>Requiere guardias</label>

                                </div>

                                {/* observaciones + detalles */}

                                <div className="textarea-grid">

                                    <div className="anexo-field">

                                        <label className="label">Observaciones</label>

                                        <textarea
                                            value={anexo?.datos?.observacionesOperativas}
                                            onChange={(e) => handleChange("observacionesOperativas", e.target.value)}
                                            className="input textarea-large"
                                        />

                                    </div>

                                    <div className="anexo-field">

                                        <label className="label">Detalles</label>

                                        <textarea
                                            value={anexo?.datos?.detalles}
                                            onChange={(e) => handleChange("detalles", e.target.value)}
                                            className="input textarea-large"
                                        />

                                    </div>

                                </div>


                            </div>
                        )}
                        {/* documentos */}
                        <Acordeon
                            title={`Documentos Anexo ${anexo?.datos?.numeroAnexo || index + 1} (${anexo.documentos.length})`}
                            required={true}
                            isOpen={openDocumento === `anexo${index}`}
                            onToggle={() =>
                                setOpenDocumento(openDocumento === `anexo${index}` ? null : `anexo${index}`)
                            }
                            content={
                                <Documentos
                                    documentos={anexo.documentos}
                                    setFormData={setFormData}
                                    path={`anexos.${index}.documentos`}
                                    tipo="ANEXO"
                                />

                            }
                        />
                        {/* eliminar */}

                    </div>
                }
            />
            <button
                type="button"
                onClick={() => removeAnexo(index)}
                className="remove-button"
            >

                <Trash2 size={18} />

            </button>
        </div>

    )
}