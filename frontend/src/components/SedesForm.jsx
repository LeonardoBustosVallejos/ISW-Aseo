import { useState } from "react"
import {
    ChevronDown,
    Trash2,
    Plus
} from "lucide-react"

import Contactos from "./ContactosForm"

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

        <div className=" border rounded-2xl overflow-hidden bg-white shadow-sm w-full">

            {/* HEADER */}

            <div className=" grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 ">



                {/* direccion */}

                <div className="md:col-span-5 flex flex-col">

                    <label className="label">
                        Dirección
                        <span className="text-red-500 ml-1">*</span>
                    </label>

                    <input type="text"
                        value={sede?.direccion}
                        onChange={(e) => handleChange("direccion", e.target.value)}
                        className="input"
                    />

                </div>

                {/* tipo */}

                <div className="md:col-span-3 flex flex-col">

                    <label className="label">
                        Tipo
                        <span className="text-red-500 ml-1">*</span>
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

                <div className="md:col-span-2 flex flex-col">

                    <label className="label">
                        Personal
                        <span className="text-red-500 ml-1">*</span>
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

                <div
                    className="md:col-span-2
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
                            bg-sky-900
                            hover:bg-sky-800
                            p-3
                            rounded-xl
                        "
                    >

                        <ChevronDown color="white"
                            className={`
                                transition-transform
                                ${open ? "rotate-180" : ""}
                            `}
                        />

                    </button>

                    {/* eliminar */}

                    <button
                        type="button"
                        onClick={() => removeSede(index)}
                        disabled={largo === 1}
                        className={`bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl ${largo === 1 ? "hidden" : ""}`}

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
                        space-y-5
                    "
                >
                    {/* nombre */}
                    <div className="grid
                            grid-cols-1
                            lg:grid-cols-2
                            gap-5
                            items-start">

                        <div className="flex flex-col">

                            <label className="label">Nombre Sede</label>

                            <input type="text"
                                value={sede?.nombre_sede}
                                onChange={(e) => handleChange("nombre_sede", e.target.value)}
                                className="input"
                            />

                        </div>
                        <div className="flex flex-col">
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