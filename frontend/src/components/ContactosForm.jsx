import { Plus, Trash2 } from "lucide-react"

export default function Contactos({ contactos, setFormData, path, formatRut }) {

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

    const formatPhone = (value) => {
        // si borran todo
        if (!value.startsWith("+56")) {
            value = "+56"
        }

        // mantener solo numeros después de +56
        let numbers = value
            .replace("+56", "")
            .replace(/\D/g, "")
            .slice(0, 9)

        return `+56${numbers}`
    }

    // agregar

    const addContacto = () => {

        setFormData(prev => {

            const copia = structuredClone(prev)

            const ref = getReference(copia)

            ref.push({

                nombreContacto: "",
                contacto_rut: "",
                email: "",
                tipoContacto: "",
                phone: ""

            })

            return copia
        })
    }

    // actualizar

    const updateContacto = (
        index,
        field,
        value
    ) => {

        setFormData(prev => {

            const copia = structuredClone(prev)

            const ref = getReference(copia)

            ref[index][field] = value

            return copia
        })
    }

    // eliminar

    const removeContacto = (index) => {

        setFormData(prev => {

            const copia = structuredClone(prev)

            const ref = getReference(copia)

            ref.splice(index, 1)

            return copia
        })
    }

    return (

        <div className="space-y-4">

            {/* titulo */}

            <div className="flex justify-between items-center">

                <h3 className="font-semibold text-lg">
                    Contactos
                </h3>

                <button
                    type="button"
                    onClick={addContacto}
                    className="
                        bg-blue-600
                        hover:bg-blue-700
                        text-white
                        px-4
                        py-2
                        rounded-lg
                        flex
                        items-center
                        gap-2
                    "
                >

                    <Plus size={16} />
                    Agregar contacto

                </button>

            </div>

            {/* lista */}

            {contactos.map((contacto, index) => (

                <div
                    key={index}
                    className="
                        grid
                        grid-cols-1
                        md:grid-cols-12
                        gap-4
                        items-end
                        border
                        rounded-xl
                        p-4
                        bg-white
                    "
                >

                    {/* nombre */}

                    <div className="md:col-span-3 flex flex-col">

                        <label className="label">
                            Nombre
                            <span className="text-red-500 ml-1">*</span>
                        </label>

                        <input
                            type="text"
                            value={contacto.nombreContacto}
                            onChange={(e) => updateContacto(index, "nombreContacto", e.target.value)}
                            className="input" required
                        />

                    </div>

                    {/* rut */}

                    <div className="md:col-span-2 flex flex-col">

                        <label className="label">
                            RUT
                            <span className="text-red-500 ml-1">*</span>
                        </label>

                        <input
                            type="text"
                            value={contacto.contacto_rut}
                            onChange={(e) => updateContacto(index, "contacto_rut", formatRut(e.target.value))}
                            className="input" required
                        />

                    </div>

                    {/* email */}

                    <div className="md:col-span-2 flex flex-col">

                        <label className="label">
                            Email
                            <span className="text-red-500 ml-1">*</span>
                        </label>

                        <input
                            type="email"
                            value={contacto.email}
                            onChange={(e) => updateContacto(index, "email", e.target.value)}
                            className="input" required
                        />

                    </div>

                    {/* Telefono */}

                    <div className="md:col-span-2 flex flex-col">

                        <label className="label">
                            Teléfono
                        </label>

                        <input
                            type="tel"
                            className="input"
                            value={contacto.phone}
                            onChange={(e) =>
                                updateContacto(
                                    index,
                                    "phone",
                                    formatPhone(e.target.value)
                                )
                            }
                            placeholder="+56912345678"
                            onFocus={(e) => {
                                if (!e.target.value.startsWith("+56")) {
                                    updateContacto(index, "phone", "+56")
                                }
                            }}
                            pattern="^(?:\+56|56)?\s?(?:9\d{8}|[2-7]\d{8})$"
                        />

                    </div>

                    {/* tipo */}

                    <div className="md:col-span-2 flex flex-col">

                        <label className="label">
                            Tipo
                            <span className="text-red-500 ml-1">*</span>
                        </label>

                        <select
                            value={contacto.tipoContacto}
                            onChange={(e) => updateContacto(index, "tipoContacto", e.target.value)}
                            className="input"
                        >
                            <option value="">Seleccionar</option>
                            <option value="PRINCIPAL">PRINCIPAL</option>
                            <option value="SECUNDARIO">SECUNDARIO</option>

                        </select>

                    </div>

                    {/* eliminar */}

                    <div className="col-span-1 flex justify-end">

                        <button
                            disabled={contactos.length <= 1}
                            type="button"
                            onClick={() => removeContacto(index)}
                            className={`bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg ${contactos.length <= 1 ? "hidden" : ""}`}
                        >
                            <Trash2 size={16} />
                        </button>

                    </div>

                </div>
            ))
            }

        </div >
    )
}