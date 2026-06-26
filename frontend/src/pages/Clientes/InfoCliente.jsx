import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getInfoCliente } from "../../services/clientes.service";
import '../../styles/infoCliente.css'
import { Archive, Briefcase, Building2, FileText, MapPin, Info } from "lucide-react";
import { formatDateTime } from "../../helpers/formatDate";
import Error404 from "../Error404.jsx";
import { Tab, Tabs } from "../../components/Tabs.jsx";
import Header from "../../components/misc/Header.jsx";

export default function InfoCliente() {
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true);

    const { cliente_id, rutCliente } = useParams();
    const [dataGeneral, setDataGeneral] = useState({
        cliente: {},
        filiales: [],
        contratos: [],
        anexos: [],
        sedes: [],
        documentos: []
    })
    const [infoCliente, setInfoCliente] = useState({})
    const [infoSedes, setInfoSedes] = useState([])
    const [estado, setEstado] = useState('')
    const [infoFiliales, setInfoFiliales] = useState([])
    const [infoContratos, setInfoContratos] = useState([])
    const [infoAnexos, setInfoAnexos] = useState([])
    const [infoDocumentos, setInfoDocumentos] = useState([])
    const [contactos, setContactos] = useState([])

    const [personal, setPersonal] = useState({
        solicitados: '',
        asignados: ''
    })
    useEffect(() => {
        const obtenerInfo = async () => {
            try {

                const response = await getInfoCliente(cliente_id, rutCliente)

                console.log(response);
                if (response.status !== "Success") {
                    throw (response || "Cliente no encontrado");
                }
                setDataGeneral(response.data)

            } catch (err) {
                setError(err)
            } finally {
                setLoading(false);
            }
        }
        obtenerInfo()

    }, [cliente_id])
    if (loading) {
        return <div>Cargando...</div>;
    }
    if (error) {
        return (
            <Error404 error={error.message} status={error.status} />
        );
    }

    return (
        <div className="info-cliente">
            <Header title={dataGeneral.cliente.nombreCliente} subtitle={
                <>
                    <strong>{'RUT: '}</strong>
                    {dataGeneral.cliente.rutCliente}
                    <strong>{' | '}</strong>
                    <strong>{'TIPO: '}</strong>
                    {dataGeneral.cliente.tipoCliente}
                </>}>

                <div className={`estado ${dataGeneral.estado === "ESPERA" ? "amarillo" :
                    dataGeneral.estado === "VIGENTE" ? "verde" : "rojo"}`}>
                    {dataGeneral.estado}
                </div>
            </Header>
            {/*
            <div className='info-header'>
                <div>

                    <h1 className="info-title">
                        {dataGeneral.cliente.nombreCliente}
                    </h1>
                    <h1 className="sub-tittle">
                        <strong>{'RUT: '}</strong>
                        {dataGeneral.cliente.rutCliente}
                        <strong>{' | '}</strong>
                        <strong>{'TIPO: '}
                        </strong>
                        {dataGeneral.cliente.tipoCliente}
                    </h1>
                </div>
                <div className={`estado ${dataGeneral.estado === "ESPERA" ? "amarillo" :
                    dataGeneral.estado === "VIGENTE" ? "verde" : "rojo"}`}>
                    {dataGeneral.estado}
                </div>
            </div>
            */}
            <div className="contadores">
                <div className="contador">
                    <div className="contador-simbol filiales">

                        <Building2 />
                    </div>
                    <div className="data-contador">
                        <div>
                            Filiales
                        </div>
                        <strong>{dataGeneral.filiales.length}</strong>
                    </div>
                </div>

                <div className="contador">
                    <div className="contador-simbol sedes">
                        <MapPin />
                    </div>
                    <div className="data-contador">
                        <div>
                            Sedes
                        </div>
                        <strong>{dataGeneral.sedes.length}</strong>
                    </div>
                </div>
                <div className="contador">
                    <div className="contador-simbol contratos">
                        <Archive />
                    </div>
                    <div className="data-contador">
                        <div>
                            Contratos
                        </div>
                        <strong>{dataGeneral.contratos.length}</strong>
                    </div>

                </div>

                <div className="contador">
                    <div className="contador-simbol anexos">
                        <FileText />
                    </div>
                    <div className="data-contador">
                        <div>
                            Anexos
                        </div>
                        <strong>{dataGeneral.anexos.length}</strong>
                    </div>
                </div>

                <div className="contador">
                    <div className="contador-simbol documentos">
                        <Briefcase />
                    </div>
                    <div className="data-contador">
                        <div>
                            Documentos
                        </div>
                        <strong>{dataGeneral.documentos.length}</strong>
                    </div>
                </div>

            </div>
            <div className="progress-bar">
                <div
                    className="progress-fill"
                    style={{
                        width: `${dataGeneral.solicitados > 0
                            ? (dataGeneral.asignados / dataGeneral.solicitados) * 100
                            : 0
                            }%`
                    }}
                />
            </div>

            <Tabs>
                <Tab titulo={'Resumen'}>
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
                                <strong>{'Total dde Anexos: '}</strong>
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
                </Tab>
                <Tab titulo={'Filiales'} disabled={dataGeneral.filiales.length < 1}>

                </Tab>
                <Tab titulo={'Sedes'}>
                    {'dsf'}
                </Tab>
                <Tab titulo={'Contactos'}>

                </Tab>
                <Tab titulo={'Contratos'}>

                </Tab>
                <Tab titulo={'Anexos'} disabled={dataGeneral.anexos.length < 1}>

                </Tab>
                <Tab titulo={'Documentos'}>

                </Tab>
            </Tabs>
        </div >
    )
}