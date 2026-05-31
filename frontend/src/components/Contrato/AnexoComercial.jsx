import { useState } from "react"
import {
    ChevronDown,
    Trash2
} from "lucide-react"

import Documentos from "./Documentos"

export default function AnexoRow({ anexo, index, setFormData, removeAnexo, contrato = null }) {

    const [open, setOpen] = useState(false)

    // actualizar datos del anexo
    const handleChange = (field, value) => {

        setFormData(prev => {

            const copia = structuredClone(prev)

            copia.anexos[index].datos[field] = value

            return copia
        })
    }

    return (

        <div
            className="
                border
                rounded-2xl
                overflow-hidden
                bg-white
                shadow-sm
                w-full
            "
        >

            {/* HEADER */}

            <div className=" grid grid-cols-1 md:grid-cols-3 xl:grid-cols-10 gap-4 items-end p-5  ">

                {/* numero */}

                <div className="xl:col-span-4 flex flex-col">

                    <label className="label">Nº Anexo
                        <span className="text-red-500 ml-1">*</span>
                    </label>

                    <input
                        type="text"
                        value={anexo?.datos?.numeroAnexo}
                        onChange={(e) => handleChange("numeroAnexo", e.target.value)}
                        className="input w-full"
                    />

                </div>

                {/* tipo de anexo*/}

                <div className="xl:col-span-4 flex flex-col">

                    <label className="label">
                        Tipo Anexo
                        <span className="text-red-500 ml-1">*</span>
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

                <div
                    className="
                        xl:col-span-2
                        md:col-span-1
                        flex
                        justify-end
                        gap-2
                    "
                >

                    {/* abrir */}

                    <button
                        type="button"
                        onClick={() => setOpen(!open)}
                        className="
                            bg-slate-100
                            hover:bg-slate-200
                            p-3
                            rounded-xl
                        "
                    >

                        <ChevronDown
                            className={`
                                transition-transform
                                ${open ? "rotate-180" : ""}
                            `}
                        />

                    </button>

                    {/* eliminar */}

                    <button
                        type="button"
                        onClick={() => removeAnexo(index)}
                        className="
                            bg-red-500
                            hover:bg-red-600
                            text-white
                            p-3
                            rounded-xl
                        "
                    >

                        <Trash2 size={18} />

                    </button>

                </div>

            </div>

            {/* BODY */}

            {open && (

                <div
                    className="
                        border-t
                        bg-slate-50
                        p-5
                        space-y-6
                    "
                >

                    {/* GRID */}

                    <div
                        className="
                            grid
                            grid-cols-1
                            md:grid-cols-2
                            gap-5
                        "
                    >
                        {/* inicio */}

                        <div >

                            <label className="label">Inicio</label>

                            <input
                                type="date"
                                value={anexo.datos?.fechaInicio}
                                onChange={(e) => handleChange("fechaInicio", e.target.value)}
                                className="input w-full"
                            />

                        </div>

                        {/* fin */}

                        <div >

                            <label className="label">Fin</label>

                            <input
                                type="date"
                                value={anexo?.datos?.fechaFin}
                                onChange={(e) => handleChange("fechaFin", e.target.value)}
                                className="input w-full"
                            />

                        </div>


                        {/* max trabajadores */}

                        <div >

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

                        <div>

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

                        <div>

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

                        <div>

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

                        <div>

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

                    <div className="flex items-center gap-3">

                        <input
                            type="checkbox"
                            checked={anexo?.datos?.requiereGuardias}
                            onChange={(e) => handleChange("requiereGuardias", e.target.checked)}
                        />

                        <label>
                            Requiere guardias
                        </label>

                    </div>

                    {/* observaciones + detalles */}

                    <div className="grid
                            grid-cols-1
                            lg:grid-cols-2
                            gap-5
                            items-start"
                    >

                        <div className="flex flex-col">

                            <label className="label">Observaciones</label>

                            <textarea
                                value={anexo?.datos?.observacionesOperativas}
                                onChange={(e) => handleChange("observacionesOperativas", e.target.value)}
                                className="
                                    input
                                    min-h-36
                                "
                            />

                        </div>

                        <div className="flex flex-col">

                            <label className="label">Detalles</label>

                            <textarea
                                value={anexo?.datos?.detalles}
                                onChange={(e) => handleChange("detalles", e.target.value)}
                                className="
                                    input
                                    min-h-36
                                "
                            />

                        </div>

                    </div>

                    {/* documentos */}

                    <Documentos
                        documentos={anexo.documentos}
                        setFormData={setFormData}
                        path={`anexos.${index}.documentos`}
                        tipo="ANEXO"
                    />

                </div>
            )}

        </div>
    )
}