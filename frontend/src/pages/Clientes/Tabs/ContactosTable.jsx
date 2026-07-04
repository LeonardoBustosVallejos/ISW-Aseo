import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Table } from "../../../components/Tabla2";
import EditButton from "../../../components/misc/edit-button";
import { useState } from "react";
import { ContactRound, UserRoundPlus } from "lucide-react";
import { formatDate, formatDateTime } from "../../../helpers/formatDate";

export default function ContactosTable({ contactos }) {
    const [open, setOpen] = useState(false)
    const [selected, setSelected] = useState(
        {
            nombreContacto: '',
            contacto_rut: '',
            email: '',
            phone: '',
            tipoContacto: ''
        }
    )

    return (

        <Table
            title='Contactos'
            emptyMessage="No existen contactos"
            rowKey={'contacto_id'}
            data={contactos}
            columns={
                [{
                    field: "nombreContacto",
                    header: "Nombre"
                },
                {
                    field: "contacto_rut",
                    header: "RUT"
                },
                {
                    field: "email",
                    header: "Correo"
                },
                {
                    field: "tipoContacto",
                    header: "Tipo"
                }]
            }
            renderExpanded={(row) => (
                <>
                    <div className="info-card">



                        <div className="info-label">
                            <strong>Cliente representante:</strong>
                            <strong>{row.cliente.nombreCliente + ' - ' + row.cliente.rutCliente || 'Sin Datos'}</strong>
                        </div>
                        <div className="data-line" />

                        <div className="info-label">
                            <strong>Contacto de sede:</strong>
                            <strong>{row.sede.nombre_sede + ' - ' + row.sede.rutSecundario || 'Sin Datos'}</strong>
                        </div>
                        <div className="data-line" />

                        <div className="info-label">
                            <strong>Nombre:</strong>
                            <strong>{row.nombreContacto || 'Sin Datos'}</strong>
                        </div>
                        <div className="data-line" />
                        <div className="info-label">
                            <strong>Rut del contacto:</strong>
                            <strong>{row.contacto_rut || 'Sin Datos'}</strong>
                        </div>
                        <div className="data-line" />

                        <div className="info-label">
                            <strong>Correo de contacto:</strong>
                            <strong>{row.email}</strong>
                        </div>
                        <div className="data-line" />

                        <div className="info-label">
                            <strong>Teléfono de contacto:</strong>
                            <strong>{row.phone || 'Sin Datos'}</strong>
                        </div>
                        <div className="data-line" />

                        <div className="info-label">
                            <strong>Tipo de contacto:</strong>
                            <strong>{row.tipoContacto}</strong>
                        </div>
                        <div className="data-line" />

                        <div className="info-label">
                            <strong>Fecha de Registro:</strong>
                            <strong>{formatDate(row.createdAt)}</strong>
                        </div>
                        <div className="data-line" />

                        <div className="info-label">
                            <strong>Última actualización:</strong>
                            <strong>{formatDateTime(row.updatedAt)}</strong>
                        </div>
                        <div className="data-line" />
                    </div>
                </>
            )}

        >

        </Table>


    )
}