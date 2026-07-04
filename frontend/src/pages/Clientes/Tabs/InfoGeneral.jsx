import { Card } from "primereact/card";
import { TabPanel } from "primereact/tabview";
import { formatDateTime } from "../../../helpers/formatDate";


export default function InfoGeneral({ dataGeneral }) {
    return (
        <div className="info-grid">


            <div className="info-card">
                <div className="card-tittle">

                </div>
                <div className="info-label">
                    <strong>{'Nombre: '}</strong>
                    {dataGeneral.cliente.nombreCliente}
                </div>
                <div className="data-line" />
                <div className="info-label">
                    <strong>{'RUT: '}</strong>
                    {dataGeneral.cliente.rutCliente}
                </div>
                <div className="data-line" />
                <div className="info-label">
                    <strong>{'Tipo de Cliente: '}</strong>
                    {dataGeneral.cliente.tipoCliente}
                </div>
                <div className="data-line" />
                <div className="info-label">
                    <strong>{'Fecha de Registro: '}</strong>
                    {formatDateTime(dataGeneral.cliente.createdAt)}
                </div>
                <div className="data-line" />
                <div className="info-label">
                    <strong>{'Última Actualización: '}</strong>
                    {formatDateTime(dataGeneral.cliente.updatedAt)}
                </div>
                <div className="data-line" />
            </div>


            <div className="info-card">

                <div className="info-label">
                    <strong>{'Total de Sedes: '}</strong>
                    <strong>{dataGeneral.sedes.length}</strong>
                </div>
                <div className="data-line" />
                <div className="info-label">
                    <strong>{'Total de Contratos: '}</strong>
                    <strong>{dataGeneral.contratos.length}</strong>
                </div>
                <div className="data-line" />
                <div className="info-label">
                    <strong>{'Total de Anexos: '}</strong>
                    <strong>{dataGeneral.anexos.length}</strong>
                </div>
                <div className="data-line" />
                <div className="info-label">
                    <strong>{'Total de Documentos: '}</strong>
                    <strong>{dataGeneral.documentos.length}</strong>
                </div>
                <div className="data-line" />
                <div className="info-label">
                    <strong>{'Total de Filiales: '}</strong>
                    <strong>{dataGeneral.filiales.length}</strong>
                </div>
                <div className="data-line" />
            </div>
        </div>
    )
}