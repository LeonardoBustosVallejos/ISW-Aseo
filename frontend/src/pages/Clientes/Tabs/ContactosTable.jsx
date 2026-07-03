import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Table } from "../../../components/Tabla2";
import EditButton from "../../../components/misc/edit-button";
import { useState } from "react";

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
                    field: "phone",
                    header: "Teléfono"
                },
                {
                    field: "tipoContacto",
                    header: "Tipo"
                }]
            }

        >

        </Table>


    )
}