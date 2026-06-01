import { useState } from "react"
import { ChevronDown } from "lucide-react"
import Documentos from "./Documentos"

export default function ContratoRow({ contrato, documentos, setFormData, }) {

    const [open, setOpen] =
        useState(false)

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

        <div
            className="
                w-full
                border
                rounded-2xl
                overflow-hidden
                bg-white
                shadow-sm
            "
        >

            {/* HEADER */}

            <div
                className="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    xl:grid-cols-2
                    gap-4
                    p-4
                    items-end
                "
            >

                {/* inicio */}

                <div className="flex flex-col">

                    <label className="label">
                        Inicio
                        <span className="text-red-500 ml-1">*</span>
                    </label>

                    <input
                        type="date"
                        value={contrato?.fechaInicio}
                        onChange={(e) => handleChange("fechaInicio", e.target.value)}
                        className="input "
                    />

                </div>

                {/* fin */}

                <div className="flex flex-col">

                    <label className="label">
                        Fin
                        <span className="text-red-500 ml-1">*</span>
                    </label>

                    <input
                        type="date"
                        value={contrato?.fechaFinOriginal}
                        onChange={(e) => handleChange("fechaFinOriginal", e.target.value)}
                        className="input w-full"
                    />

                </div>

                {/* jornada */}

                <div className="flex flex-col">

                    <label className="label">
                        Jornada
                        <span className="text-red-500 ml-1">*</span>
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

                <div className="flex flex-col">

                    <label className="label">
                        Tipo Jornada
                        <span className="text-red-500 ml-1">*</span>
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

                <div className="flex flex-col">

                    <label className="label">
                        Tamaño
                        <span className="text-red-500 ml-1">*</span>
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

                <div className="flex flex-col">

                    <label className="label">
                        N° Mínimo Trabajadores
                        <span className="text-red-500 ml-1">*</span>
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
                <div className="flex flex-col">

                    <label className="label">
                        N° Máximo Trabajadores
                        <span className="text-red-500 ml-1">*</span>
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

                <div
                    className="
                        flex
                        items-end
                        gap-3
                    "
                >

                    <div className="flex-1 flex flex-col">

                        <label className="label">
                            Monto
                            <span className="text-red-500 ml-1">*</span>
                        </label>

                        <input
                            type="number"
                            min={0}
                            value={contrato?.monto}
                            onChange={(e) => handleChange("monto", e.target.value)}
                            className="input w-full"
                        />

                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setOpen(!open)
                        }
                        className="
                            h-[46px]
                            w-[46px]
                            flex
                            items-center
                            justify-center
                            bg-sky-900
                            hover:bg-sky-800
                            rounded-xl
                            shrink-0
                        "
                    >

                        <ChevronDown color="white"
                            className={`
                                transition-transform
                                duration-300
                                ${open ? "rotate-180" : ""}
                            `}
                        />

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

                    {/* textareas */}

                    <div
                        className="
                            grid
                            grid-cols-1
                            lg:grid-cols-2
                            gap-5
                            items-start
                        "
                    >

                        {/* observaciones */}

                        <div className="flex flex-col">

                            <label className="label">Observaciones</label>

                            <textarea
                                value={contrato?.observacionesOperativas}
                                onChange={(e) => handleChange("observacionesOperativas", e.target.value)}
                                className="
                                    input
                                    min-h-[140px]
                                    resize-none
                                "
                            />

                        </div>

                        {/* detalles */}

                        <div className="flex flex-col">

                            <label className="label">Detalles</label>

                            <textarea
                                value={contrato?.detalles}
                                onChange={(e) => handleChange("detalles", e.target.value)}
                                className="
                                    input
                                    min-h-[140px]
                                    resize-none
                                "
                            />

                        </div>

                    </div>

                    {/* checkbox */}

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                        "
                    >

                        <input
                            type="checkbox"
                            checked={contrato?.requiereGuardias}
                            onChange={(e) => handleChange("requiereGuardias", e.target.checked)}
                            className="h-5 w-5"
                        />

                        <label className="label m-0">
                            Requiere guardias
                        </label>

                    </div>

                    {/* documentos */}

                    <Documentos
                        documentos={documentos}
                        setFormData={setFormData}
                        path="metadataDocumentos"
                        tipo="CONTRATO"
                    />

                </div>
            )}

        </div>
    )
}