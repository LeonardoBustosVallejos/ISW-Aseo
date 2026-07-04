import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getInfoCliente } from "../../services/clientes.service";
import '../../styles/infoCliente.css'
import { Archive, Briefcase, Building2, FileText, MapPin, Info, Badge } from "lucide-react";
import { formatDateTime } from "../../helpers/formatDate";
import Error404 from "../Error404.jsx";
import { Tab, Tabs } from "../../components/Tabs.jsx";
import Header from "../../components/misc/Header.jsx";
import { Table } from "../../components/Tabla2.jsx";
import AddButton from "../../components/misc/add-button.jsx";
import SedesTable from "./Tabs/SedesTable.jsx";
import InfoGeneral from "./Tabs/InfoGeneral.jsx";
import ContactosTable from "./Tabs/ContactosTable.jsx";
import TabFiliales from "./Tabs/TabFiliales.jsx";

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
                    <InfoGeneral dataGeneral={dataGeneral} />
                </Tab>
                <Tab titulo={'Filiales'} disabled={dataGeneral.filiales.length < 1}>
                    <TabFiliales filiales={dataGeneral.filiales} />
                </Tab>
                <Tab titulo={'Sedes'}>
                    <SedesTable sedes={dataGeneral.sedes} />
                </Tab>
                <Tab titulo={'Contactos'}>
                    <ContactosTable contactos={dataGeneral.contactos} />
                </Tab>
                <Tab titulo={'Contratos'}>

                </Tab>
                <Tab titulo={'Anexos'} disabled={dataGeneral.anexos.length < 1}>

                </Tab>
                {/*
                
                    <Tab titulo={'Documentos'}>

                </Tab>
                */}
            </Tabs>
        </div >
    )
}