import { useEffect, useState } from "react"
import { listarClientesTope } from "../../services/clientes.service"
import "../../styles/listaClientes.css"
import { Link } from "react-router-dom"
import Header from "../../components/misc/Header"
const ListaClientes = () => {
    const [lista, setLista] = useState([])
    const [busqueda, setBusqueda] = useState("");
    const [estadoFiltro, setEstadoFiltro] = useState("");
    const [tipoCliente, setTipoCliente] = useState(null)
    const [orden, setOrden] = useState("");
    useEffect(() => {
        const obtenerClientes = async () => {
            const response = await listarClientesTope()

            setLista(response.data.lista)
        }
        obtenerClientes()
    }, [])

    const MAPA_COLORES_ESTADO = {
        ESPERA: "azul-gris",
        ATRASADO: "naranja",
        VIGENTE: "verde",
        SUSPENDIDO: "amarillo",
        TERMINADO: "gris",
        CANCELADO: "rojo"
    };

    const clientesFiltrados = [...lista].filter((cliente) => {

        const texto = busqueda.toLowerCase();
        const coincideTipo = !tipoCliente || tipoCliente === cliente.tipoCliente
        const coincideBusqueda =
            cliente.nombreCliente?.toLowerCase().includes(texto) ||
            cliente.rutCliente?.toLowerCase().includes(texto) ||
            cliente.direccionPrincipal?.toLowerCase().includes(texto) ||
            cliente.nombreContacto?.toLowerCase().includes(texto) ||
            cliente.email?.toLowerCase().includes(texto) ||
            cliente.phone?.toLowerCase().includes(texto);

        const coincideEstado =
            !estadoFiltro ||
            cliente.contrato === estadoFiltro;

        return coincideBusqueda && coincideEstado && coincideTipo;
    })
        .sort((a, b) => {

            switch (orden) {

                case "nombre-asc":
                    return a.nombreCliente.localeCompare(b.nombreCliente);

                case "nombre-desc":
                    return b.nombreCliente.localeCompare(a.nombreCliente);

                case "asignados-asc":
                    return a.asignados - b.asignados;

                case "asignados-desc":
                    return b.asignados - a.asignados;

                case "req-asc":
                    return a.solicitados - b.solicitados
                case "req-desc":
                    return b.solicitados - a.solicitados
                default:
                    return 0;
            }
        });

    return (
        <div className="gestion-clientes">
            <Header title={'Lista de Empresas Representantes Y Filiales'}>
                <Link to="/clientes/registrar" className="btn-nuevo-cliente">+ Nuevo Cliente</Link>
            </Header>
            <div className="filtros-clientes">

                <input
                    type="text"
                    placeholder="Buscar por nombre/dirección/contacto..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
                <select value={tipoCliente}
                    onChange={(e) => setTipoCliente(e.target.value)}
                >
                    <option value="">Todos los tipos</option>
                    <option value="EMPRESA">EMPRESA</option>
                    <option value="FILIAL">FILIAL</option>
                </select>
                <select
                    value={estadoFiltro}
                    onChange={(e) => setEstadoFiltro(e.target.value)}
                >
                    <option value="">Todos los estados</option>
                    <option value="ESPERA">Espera</option>
                    <option value="VIGENTE">Vigente</option>
                    <option value="SUSPENDIDO">Suspendido</option>
                    <option value="TERMINADO">Terminado</option>
                </select>

                <select
                    value={orden}
                    onChange={(e) => setOrden(e.target.value)}
                >
                    <option value="">Ordenar por</option>

                    <option value="nombre-asc">
                        Nombre ↑
                    </option>

                    <option value="nombre-desc">
                        Nombre ↓
                    </option>
                    <option value="req-asc">
                        Requeridos ↑
                    </option>

                    <option value="req-desc">
                        Requeridos ↓
                    </option>

                    <option value="asignados-asc">
                        Menor cobertura
                    </option>

                    <option value="asignados-desc">
                        Mayor cobertura
                    </option>
                </select>

            </div>
            <div className="tabla-clientes">

                {clientesFiltrados.map((cliente, index) => (

                    <Link to={`/cliente/rut/${cliente.rutCliente}/id/${cliente.cliente_id}`}>
                        <div className="tabla-cliente fila-cliente" key={index}>

                            <div>
                                <strong>{index + 1}</strong>
                            </div>

                            <div>
                                <div>
                                    <strong>{cliente.nombreCliente}</strong>
                                </div>
                                <div>
                                    {cliente.rutCliente}
                                </div>
                                <div>

                                    {cliente.tipoCliente}

                                </div>
                                <div className={`estado ${MAPA_COLORES_ESTADO[cliente.contrato] || "gris"}`}>
                                    {cliente.contrato}
                                </div>
                            </div>
                            <div>
                                <div><strong >Dirección Principal</strong></div>
                                <p>{cliente.direccionPrincipal}</p>
                            </div>

                            <div>
                                <div><strong>Personal</strong></div>
                                <div>
                                    <p>Personal Requerido: {cliente.solicitados}</p>

                                    <p>Personal Asignado: {cliente.asignados}</p>


                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{
                                                width: `${cliente.solicitados > 0
                                                    ? (cliente.asignados / cliente.solicitados) * 100
                                                    : 0
                                                    }%`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div >
                                <div>

                                    <strong>Contacto</strong>
                                </div>
                                <div >

                                    <div className="texto">{cliente.nombreContacto}</div>
                                    <div className="texto">{cliente.email}</div>
                                    <div className="texto">{cliente.phone}</div>
                                </div>
                            </div>

                        </div >
                    </Link>

                ))}
            </div>
        </div >
    )
}

export default ListaClientes