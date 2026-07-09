import { useEffect, useState } from "react"
import {
    ChevronDown,
    Trash2,
    Plus
} from "lucide-react"

import Contactos from "./ContactosForm"
import "../../styles/components/SedesForm.css"
import Acordeon from "../Acordeon"
import { formatRut } from "../../helpers/formatRut"
import AddButton from "../misc/add-button"

export function SedeRow({ sede, onChange, removeSede, index = 0, largo = 1, level = 0, isRegister = true, isUpdate = false, newDoc = false }) {

    const [open, setOpen] = useState(false)
    const [openContactos, setOpenContactos] = useState(0)
    const [openSede, setOpenSede] = useState(index)



    const handleChange = (field, value) => {
        onChange(prev => ({

            ...prev,

            [field]: value

        }));
    }

    return (
        <div className="multiple-acordeon">
            <Acordeon title={`${index + 1}. Sede ${sede.direccion || 'Sin Dirección'}`}
                level={level}
                required
                isOpen={openSede === index}
                onToggle={() => setOpenSede(openSede === index ? null : index)}
                content={
                    <div className="">
                        <div className="form-card">

                            {/* HEADER */}

                            <div className="sede-header">



                                {/* direccion */}

                                <div className="form-group sede-direccion">

                                    <label className="label">
                                        Dirección
                                        <span style={{ color: "red", marginLeft: "4px" }}>*</span>
                                    </label>

                                    <input
                                        disabled={!isRegister || isUpdate}
                                        type="text"
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
                                        disabled={!isRegister || isUpdate}
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

                                <div className="action-buttons oculto">

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



                            <div
                                className="card-body"
                            >
                                {/* nombre */}
                                <div className="sede-body-grid">

                                    <div className="form-group">

                                        <label className="label">Nombre Sede
                                            <span className="required">*</span>
                                        </label>

                                        <input
                                            disabled={!isRegister}
                                            type="text"
                                            value={sede?.nombre_sede}
                                            onChange={(e) => handleChange("nombre_sede", e.target.value)}
                                            className="input"
                                            required
                                        />

                                    </div>
                                    <div className="form-group">
                                        <label className="label">
                                            RUT Secundario
                                        </label>
                                        <input
                                            disabled={!isRegister && !isUpdate}
                                            type="text" name="rutCliente" value={sede.rutSecundario}
                                            onChange={(e) => handleChange("rutSecundario", formatRut(e.target.value))} className="input" placeholder="12345678-9" />
                                    </div>
                                </div>


                            </div>
                        </div>
                        <br />
                        <div className={`${isUpdate ? 'oculto' : ''}`}>

                            <Acordeon
                                title={`Contactos de Sede ${sede?.nombre_sede || index + 1} (${sede.contactos.length})`}
                                level={level + 1}
                                required={true}
                                isOpen={openContactos === index}
                                onToggle={() => setOpenContactos(openContactos === index ? null : index)}
                                content={
                                    <div className="form-card">

                                        <Contactos
                                            contactos={sede.contactos}
                                            level={level + 2}
                                            onChange={(updater) => {
                                                onChange(prev => ({
                                                    ...prev,
                                                    contactos: updater(prev.contactos)
                                                }));

                                            }}

                                        />
                                    </div>

                                }
                            />
                        </div>

                    </div>
                }
            />
            {/* eliminar */}

            <button
                type="button"
                onClick={() => removeSede(index)}
                disabled={largo === 1 && !newDoc}
                className={`remove-button ${largo === 1 && !newDoc ? "oculto" : ""}`}

            >

                <Trash2 size={18} />
            </button>
        </div>

    )
}


export function SedesArray({ sedes, sedesPath = ['sedes'], setFormData, level = 0, isRegister = false, newDoc = false }) {
    function getReference(obj, path) {
        return path.reduce((ref, key) => ref[key], obj);
    }


    useEffect(() => {

        if (
            sedes.length === 1 &&
            sedes[0].tipoSede !== "PRINCIPAL"
            && !isRegister
        ) {

            setFormData(prev => [
                {
                    ...prev[0],
                    tipoSede: "PRINCIPAL"
                }
            ]);

        }
        if (sedes.length === 0) {
            addSede
        }
    }, [sedes.length]);

    const addSede = () => {

        setFormData(prev => {

            const copia = structuredClone(prev);


            const target = sedesPath?.length
                ? getReference(copia, sedesPath)
                : copia;

            target.push({
                nombre_sede: '',
                direccion: '',
                personalSolicitado: '',
                tipoSede: '',
                contactos: [{
                    nombreContacto: '',
                    contacto_rut: '',
                    email: '',
                    phone: '',
                    tipoContacto: 'PRINCIPAL'
                }]
            });

            return copia;
        });
    };
    const removeSede = (index) => {

        setFormData(prev => {

            const copia = structuredClone(prev);

            let target = copia;

            for (const key of sedesPath) {
                target = target[key];
            }

            target.splice(index, 1);

            return copia;
        });
    };
    const updateSede = (index, updater) => {
        setFormData(prev => {
            const copia = structuredClone(prev);

            const sedesRef = getReference(copia, sedesPath);

            sedesRef[index] = updater(sedesRef[index]);

            return copia;
        });
    };
    return (
        <div>
            {sedes.map((sede, index) => (
                <>
                    <div className="form-card interior">
                        <SedeRow sede={sede}
                            level={level + 1}
                            key={`${index}`}
                            index={index}
                            largo={sedes.length}
                            onChange={(updater) =>
                                updateSede(index, updater)}
                            removeSede={(i) => removeSede(i)}
                            newDoc={newDoc}
                        />
                    </div>
                    <br />
                </>
            ))}
            <AddButton
                onClick={addSede}
                text={'Agregar Sede'}
            />
        </div>
    )
}