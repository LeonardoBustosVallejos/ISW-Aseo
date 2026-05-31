import { useState } from "react"
import {
    Plus,
    Trash2,
    ChevronDown,
    ChevronUp
} from "lucide-react"

export default function Documentos({ documentos, setFormData, path, tipo }) {

    const [openIndex, setOpenIndex] = useState(null)
    // navegar objeto usando path
    const [nombreIgual, setNombreIgual] = useState({})

    const tiposDocumento = {

        CONTRATO: [
            "CONTRATO",
            "PDF_FIRMADO",
            "RESPALDO"
        ],

        ANEXO: [
            "ANEXO",
            "PDF_FIRMADO",
            "RESPALDO"
        ]
    }

    const getReference = (obj) => {

        let ref = obj

        const keys = path.split(".")

        for (const key of keys) {

            if (!isNaN(key)) {
                ref = ref[Number(key)]
            } else {
                ref = ref[key]
            }
        }

        return ref
    }


    // agregar contrato/anexo
    const addDocumento = () => {

        setFormData(prev => {

            const copia = structuredClone(prev)
            const ref = getReference(copia)
            ref.push({

                nombrePersonalizado: '',
                tipoDocumento: '',
                fileKey: tipo === "ANEXO" ? "anexo_pdf" : "contrato_pdf",
                file: null

            })

            return copia
        })
    }

    // eliminar contrato/anexo
    const removeDocumento = (index) => {

        setFormData(prev => {

            const copia = structuredClone(prev)
            const ref = getReference(copia)
            ref.splice(index, 1)

            return copia
        })
    }

    // agregar archivo
    const addArchivo = () => {

        setFormData(prev => {

            const copia = structuredClone(prev)

            const ref = getReference(copia)

            ref.push({
                nombrePersonalizado: "",
                tipoDocumento: "",
                file: null
            })

            return copia
        })
    }

    // actualizar archivo
    const updateArchivo = (fileIndex, field, value) => {
        console.log(field, value);

        setFormData(prev => {

            const copia = structuredClone(prev)

            const ref = getReference(copia)

            ref[fileIndex][field] = value

            return copia
        })
    }

    // eliminar archivo
    const removeArchivo = (fileIndex) => {

        setFormData(prev => {

            const copia = structuredClone(prev)

            const ref = getReference(copia)

            ref.splice(fileIndex, 1)

            return copia
        })
    }

    return (

        <div className="space-y-4">
            {/**
             * Recorrer el array de documentos 
             */}


            <div className="border rounded-2xl overflow-hidden bg-white shadow-sm">

                <div className="border-t bg-slate-50 p-4 space-y-6">

                    {/* DOCUMENTOS */}

                    <div className="space-y-4">

                        <div className="flex justify-between items-center">

                            <h3 className="font-semibold text-lg label">Documentos</h3>

                            <button type="button"
                                onClick={() => addArchivo()}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">

                                <Plus size={16} />
                                Agregar archivo
                            </button>

                        </div>

                        {documentos.map((archivo, fileIndex) => (

                            <div key={fileIndex} className="grid grid-cols-12 gap-3 items-end border rounded-xl bg-white p-4 ">
                                {/* file */}

                                <div className="col-span-4 flex flex-col">

                                    <label className="label">
                                        Archivo
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>

                                    <input type="file" required
                                        id={`file-${fileIndex}-${tipo}`}
                                        accept=".pdf"
                                        onChange={(e) => {
                                            const file = e.target.files[0]

                                            updateArchivo(fileIndex, "file", file)


                                            if (nombreIgual[fileIndex] && archivo.file) {
                                                updateArchivo(fileIndex, "nombrePersonalizado", file.name)
                                            }


                                        }}
                                        className="hidden input" />
                                    <label htmlFor={`file-${fileIndex}-${tipo}`}
                                        className="input truncate"
                                    >
                                        {archivo?.file?.name ? archivo.file.name : "Seleccionar Archivo"}
                                    </label>
                                </div>
                                <div className="col-span-4 flex flex-col">
                                    <div className="flex flex-row gap-3">
                                        <label className="label">
                                            Nombre
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <div>
                                            <input type="checkbox" id={`name-${fileIndex}-${tipo}`}
                                                checked={nombreIgual[fileIndex] || false}
                                                onChange={(e) => {
                                                    const checked = e.target.checked

                                                    setNombreIgual(prev => ({
                                                        ...prev, [fileIndex]: checked
                                                    }))

                                                    if (checked && archivo.file) {
                                                        updateArchivo(
                                                            fileIndex,
                                                            "nombrePersonalizado",
                                                            archivo.file.name
                                                        )
                                                    }
                                                }}
                                            />
                                            <label htmlFor={`name-${fileIndex}-${tipo}`}>¿Mismo del archivo?</label>
                                        </div>
                                    </div>
                                    <input type="text" required
                                        value={archivo.nombrePersonalizado}
                                        disabled={nombreIgual[fileIndex]}
                                        onChange={(e) => updateArchivo(fileIndex, "nombrePersonalizado", e.target.value)}
                                        className="input " />
                                </div>

                                <div className="col-span-3 flex flex-col">

                                    <label className="label">
                                        Tipo
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>

                                    <select
                                        required
                                        value={archivo.tipoDocumento}
                                        onChange={(e) => updateArchivo(fileIndex, "tipoDocumento", e.target.value)}
                                        className="input"
                                    >

                                        {tiposDocumento[tipo]?.map(opcion => (

                                            <option
                                                key={opcion}
                                                value={opcion}
                                            >
                                                {opcion}
                                            </option>

                                        ))}

                                    </select>

                                </div>



                                {/* eliminar */}

                                <div className={`col-span-1 flex justify-end `}>

                                    <button type="button"
                                        onClick={() => removeArchivo(fileIndex)}
                                        className={`bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg ${documentos.length === 1 ? "hidden" : ""}`}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}

                    </div>

                </div>



            </div>


            {/* agregar contrato */}
            {
                <button
                    type="button"
                    onClick={addDocumento}
                    className=" bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl flex items-center gap-2"
                >

                    <Plus size={18} />
                    Agregar documento
                </button>
            }
        </div>
    )
}