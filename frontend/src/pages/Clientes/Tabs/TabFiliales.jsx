
import { Eye } from "lucide-react";
import { Table } from "../../../components/Tabla2";
import { useNavigate } from "react-router-dom";
import { formatDate, formatDateTime } from "../../../helpers/formatDate";
import SedesTable from "./SedesTable";
import Acordeon from "../../../components/Acordeon";
import { useState } from "react";

export default function TabFiliales({ filiales, noTitle = false }) {
    const navigate = useNavigate();
    const [sedeOpen, setSedesOpen] = useState(false)
    const handleView = (rut, cliente_id) => {
        navigate(`/cliente/rut/${rut}/id/${cliente_id}`)
    }
    return (
        <Table
            title={noTitle ? '' : 'Filiales'}
            emptyMessage="No existen filiales"
            rowKey={'cliente_id'}
            columns={[
                {
                    field: "nombreCliente",
                    header: "Nombre"
                },
                {
                    field: "rutCliente",
                    header: "RUT"
                },
                {
                    field: "solicitados",
                    header: 'Personal Requerido'
                },
                {
                    field: "asignados",
                    header: 'Personal Asignado'
                },
                {
                    field: "updatedAt",
                    header: 'Adicion'
                },
            ]}
            data={filiales}
            renderExpanded={(row) => (
                <>
                    <div className="info-card">



                        <div className="info-label">
                            <strong>Representante Legal:</strong>
                            <strong>{row.clientePadre.nombreCliente + ' - ' + row.clientePadre.rutCliente || 'Sin Datos'}</strong>
                        </div>
                        <div className="data-line" />

                        <div className="info-label">
                            <strong>Nombre:</strong>
                            <strong>{row.nombreCliente || 'Sin Datos'}</strong>
                        </div>
                        <div className="data-line" />

                        <div className="info-label">
                            <strong>Rut de la filial:</strong>
                            <strong>{row.rutCliente || 'Sin Datos'}</strong>
                        </div>
                        <div className="data-line" />

                        <div className="info-label">
                            <strong>Teléfono de contacto:</strong>
                            <strong>{row.phone || 'Sin Datos'}</strong>
                        </div>
                        <div className="data-line" />

                        <div className="info-label">
                            <strong>Personal total requerido:</strong>
                            <strong>{row.solicitados || 'Sin Datos'}</strong>
                        </div>
                        <div className="data-line" />

                        <div className="info-label">
                            <strong>Personal total asignado:</strong>
                            <strong>{row.asignados}</strong>
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
                        <br />
                        <Acordeon
                            isOpen={sedeOpen}
                            onToggle={() => setSedesOpen(sedeOpen ? false : true)}
                            title={`Sedes (${row.sedes.length})`}
                            content={
                                <SedesTable noTitle
                                    sedes={row.sedes}
                                />
                            } />
                    </div>
                </>
            )}
            actions={(row) => (<>
                <button className="action-button" onClick={() => handleView(row.rutCliente, row.cliente_id)}>
                    <Eye />
                </button>
            </>)}
        />


    )
}