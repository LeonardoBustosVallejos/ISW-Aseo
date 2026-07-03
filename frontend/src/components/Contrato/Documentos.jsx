import { useEffect, useState } from "react"
import {
    Plus,
    Trash2,
    ChevronDown,
    ChevronUp
} from "lucide-react"
import "@styles/components/Documentos.css"
import AddButton from "../misc/add-button"

export default function Documentos({ documentos, setFormData, tipo, }) {

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


    // agregar contrato/anexo
    const addDocumento = () => {
        setFormData(prev => ({
            ...prev,
            documentos: [
                ...prev.documentos,
                {
                    nombrePersonalizado: '',
                    tipoDocumento: '',
                    fileKey: 'anexo_pdf',
                    file: null
                }
            ]
        }));
    }

    // eliminar contrato/anexo


    // actualizar archivo
    const updateArchivo = (fileIndex, field, value) => {
        setFormData(prev => {
            const copia = structuredClone(prev);

            copia.documentos[fileIndex][field] = value;

            return copia;
        });
    };
    // eliminar archivo
    const removeArchivo = (fileIndex) => {
        setFormData(prev => {
            const copia = structuredClone(prev);

            copia.documentos.splice(fileIndex, 1);

            return copia;
        });
    };

    return (

        <div className="adjuntar-documentos">
            <div className="document-card">
                <div className="document-body">
                    <div className="document-header">

                        <h3 className="document-title">Documentos</h3>

                        <AddButton
                            onClick={addDocumento}
                            text={'Agregar Documento'}
                        />

                    </div>

                    {documentos.map((archivo, fileIndex) => (

                        <div key={fileIndex} className="document-row">

                            {/* ARCHIVO */}

                            <div className="form-group">

                                <label className="label">
                                    Archivo
                                    <span style={{ color: "red", marginLeft: "4px" }}>*</span>
                                </label>

                                <input
                                    type="file"
                                    required
                                    id={`file-${fileIndex}-${tipo}`}
                                    accept=".pdf"
                                    onChange={(e) => {

                                        const file = e.target.files[0]

                                        updateArchivo(
                                            fileIndex,
                                            "file",
                                            file
                                        )

                                        if (
                                            nombreIgual[fileIndex]
                                            && file
                                        ) {
                                            updateArchivo(
                                                fileIndex,
                                                "nombrePersonalizado",
                                                file.name
                                            )
                                        }
                                    }}
                                    hidden
                                />

                                <label htmlFor={`file-${fileIndex}-${tipo}`} className="input file-selector">
                                    {archivo?.file?.name ? archivo.file.name : "Seleccionar archivo"}
                                </label>

                            </div>

                            {/* NOMBRE */}

                            <div className="form-group">

                                <div className="label-row">

                                    <label className="label">
                                        Nombre
                                        <span style={{ color: "red", marginLeft: "4px" }}>*</span>
                                    </label>

                                    <div className="checkbox-container">

                                        <input
                                            type="checkbox"
                                            id={`name-${fileIndex}-${tipo}`}
                                            checked={
                                                nombreIgual[fileIndex] || false
                                            }
                                            onChange={(e) => {

                                                const checked = e.target.checked

                                                setNombreIgual(prev => ({ ...prev, [fileIndex]: checked }))

                                                if (checked && archivo.file) {
                                                    updateArchivo(
                                                        fileIndex,
                                                        "nombrePersonalizado",
                                                        archivo.file.name
                                                    )
                                                }
                                            }}
                                        />

                                        <label htmlFor={`name-${fileIndex}-${tipo}`}
                                            className="checkbox-label">
                                            ¿Mismo del archivo?
                                        </label>

                                    </div>

                                </div>

                                <input
                                    type="text"
                                    required
                                    value={
                                        archivo.nombrePersonalizado
                                    }
                                    disabled={
                                        nombreIgual[fileIndex]
                                    }
                                    onChange={(e) =>
                                        updateArchivo(
                                            fileIndex,
                                            "nombrePersonalizado",
                                            e.target.value
                                        )
                                    }
                                    className="input"
                                />

                            </div>

                            {/* TIPO */}

                            <div className="form-group">

                                <label className="label">
                                    Tipo
                                    <span style={{ color: "red", marginLeft: "4px" }}>*</span>
                                </label>

                                <select
                                    required
                                    value={archivo.tipoDocumento}
                                    onChange={(e) =>
                                        updateArchivo(
                                            fileIndex,
                                            "tipoDocumento",
                                            e.target.value
                                        )
                                    }
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

                            {/* ELIMINAR */}

                            <button type="button"
                                onClick={() => removeArchivo(fileIndex)}
                                className={`remove-button ${documentos.length === 1 ? "oculto" : ""}`}>

                                <Trash2 size={16} />

                            </button>

                        </div>

                    ))}

                </div>

            </div>
            <AddButton
                onClick={addDocumento}
                text={'Agregar Documento'}
            />

        </div>
    )
}