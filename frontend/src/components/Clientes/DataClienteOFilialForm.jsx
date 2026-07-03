import { CirclePlus, Plus } from "lucide-react";
import Acordeon from "@components/acordeon";
import { SedeRow, SedesArray } from "./SedesForm";
import { useState } from "react";
import "@styles/registerCliente.css"
import AddButton from "../misc/add-button";
import { formatRut } from "../../helpers/formatRut";

export default function DataClienteOFilial({ data, sedes, dataPath, sedesPath, setFormData, level = 0 }) {
    const [openContacto, setOpenContacto] = useState(null);
    const [openSedes, setOpenSedes] = useState(null);

    const updateField = (field, value) => {

        setFormData(prev => {

            const copia = structuredClone(prev);

            let target = copia;

            for (const key of dataPath) {
                target = target[key];
            }

            target[field] = value;

            return copia;
        });
    };

    const addSede = () => {

        setFormData(prev => {

            const copia = structuredClone(prev);

            let target = copia;

            for (const key of sedesPath) {
                target = target[key];
            }

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
                    tipoContacto: ''
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

    function getReference(obj, path) {
        return path.reduce((ref, key) => ref[key], obj);
    }
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
            <div className="form-card interior">

                <div className="form-grid form-group">

                    <label className="label">
                        Nombre de Fantasía (Empresa)
                        <span style={{ color: "red", marginLeft: "4px" }}>*</span>
                    </label>
                    <input type="text" name="nombreCliente" value={data.nombreCliente}
                        minLength={3}
                        onChange={(e) => updateField("nombreCliente", e.target.value)}
                        className='input'
                        required />
                </div>

                <div className="form-group">

                    <label className="label">
                        RUT de Empresa
                        <span style={{ color: "red", marginLeft: "4px" }}>*</span>
                    </label>
                    <input type="text" name="rutCliente" value={data.rutCliente}
                        onChange={(e) => updateField("rutCliente", formatRut(e.target.value))} placeholder="12345678-9"
                        className='input'
                        required />
                </div>
            </div>
            <br />
            <Acordeon title={`Sedes (${sedes.length})`} level={level + 1} isOpen={openSedes === "sedes"}
                required={true}
                onToggle={() => {
                    setOpenSedes(openSedes === "sedes" ? null : "sedes")
                    setOpenContacto(null)
                }}
                content={
                    <SedesArray
                        sedes={sedes}
                        level={level}
                        setFormData={setFormData}
                        isRegister sedesPath={sedesPath}
                    />

                } />
        </div>
    );
}