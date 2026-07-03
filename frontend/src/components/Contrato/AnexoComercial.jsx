import { useEffect, useState } from "react"
import {
    ChevronDown,
    Trash2
} from "lucide-react"
import Acordeon from '../Acordeon.jsx';
import Documentos from "./Documentos"
import "@styles/components/AnexoForm.css"
import AddButton from "../misc/add-button.jsx";

export default function AnexoRow({ anexo, index, setFormData, removeAnexo, contrato = null, level = 0, isRegister = false, largo = 1, isUpdate = false }) {

    const [open, setOpen] = useState(false)

    const [openAnexo, setOpenAnexo] = useState(null)
    const [openDocumento, setOpenDocumento] = useState('')

    // actualizar datos del anexo
    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            datos: {
                ...prev.datos,
                [field]: value
            }
        }));
    };

    return (
        <div className="multiple-acordeon">

            <Acordeon title={`${index + 1}. Anexo ${anexo.datos.numeroAnexo || 'Sin Identificar'}`}
                level={level + 1}
                required={true}
                isOpen={openAnexo === index}
                onToggle={() => setOpenAnexo(openAnexo === index ? null : index)}
                content={
                    <>
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

                                    <button type="button" className="checkbox-row" onClick={() => handleChange("requiereGuardias", !anexo.datos.requiereGuardias)}
                                        style={{ backgroundColor: 'transparent' }}>

                                        <input
                                            type="checkbox"
                                            checked={anexo?.datos?.requiereGuardias}
                                            onChange={(e) => handleChange("requiereGuardias", e.target.checked)}
                                        />

                                        <label>Requiere guardias</label>

                                    </button>

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
                            {/* eliminar */}

                        </div>
                        <br />
                        <Acordeon
                            level={level + 2}
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
                                    tipo="ANEXO"
                                />

                            }
                        />
                    </>
                }
            />
            <button
                type="button"
                onClick={() => removeAnexo(index)}
                className={`remove-button ${!isRegister && isUpdate && largo === 1 ? 'oculto' : ''}`}
                disabled={!isRegister && isUpdate && largo === 1}
            >

                <Trash2 size={18} />

            </button>
        </div>

    )
}

export function AnexosArray({ anexos, setFormData, anexosPath = ['anexos'], contrato = null, level = 0, isOpen, isRegister = false, isUpdate = false }) {
    useEffect(() => {
        if (anexos.length === 0 && isRegister && isUpdate) addAnexo()
    }, [anexos, isRegister])

    const getReference = (obj, path) =>
        path.reduce((ref, key) => ref[key], obj);
    const addAnexo = () => {

        setFormData(prev => ([
            ...prev,
            {
                datos: {
                    numeroAnexo: "",
                    fechaInicio: contrato?.fechaInicio ?? "",
                    fechaFin: contrato?.fechaFinOriginal ?? "",
                    montoNuevo: contrato?.monto ?? "",
                    cantidadMinTrabajadores: contrato?.cantidadMinTrabajadores ?? "",
                    cantidadMaxTrabajadores: contrato?.cantidadMaxTrabajadores ?? "",
                    tipoJornada: contrato?.tipoJornada ?? "",
                    tipoAnexo: "",
                    detalles: "",
                    observacionesOperativas: "",
                    requiereGuardias: contrato?.requiereGuardias ?? false,
                    tamanoInstalacion: contrato?.tamanoInstalacion ?? ""
                },
                documentos: [{
                    nombrePersonalizado: "",
                    tipoDocumento: "ANEXO",
                    fileKey: "anexo_pdf",
                    file: null
                }]
            }
        ]));
    };
    const updateAnexo = (index, updater) => {
        setFormData(prev => {
            const copia = structuredClone(prev);

            copia[index] = updater(copia[index]);

            return copia;
        });
    };
    const removeAnexo = (index) => {
        setFormData(prev => {
            const copia = structuredClone(prev);

            copia.splice(index, 1);

            return copia;
        });
    };
    return (<>

        {anexos.map((anexo, index) => (

            <AnexoRow anexo={anexo}
                key={index}
                index={index}
                setFormData={(updater) =>
                    updateAnexo(index, updater)
                }
                contrato={contrato}
                removeAnexo={() => removeAnexo(index)}
                isRegister={isRegister}
                largo={anexos.length}
                isUpdate={isUpdate}
            />

        )
        )}
        {/*Botón de agregar anexo */}
        <AddButton
            onClick={addAnexo}
            text={'Agregar Anexo'}
        />
    </>)
}