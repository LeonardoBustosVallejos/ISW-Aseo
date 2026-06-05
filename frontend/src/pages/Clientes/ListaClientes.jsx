import { useEffect, useState } from "react"
import { listarClientesTope } from "../../services/clientes.service"
import "../../styles/listaClientes.css"
import { Link } from "react-router-dom"
const ListaClientes = () => {
    const [lista, setLista] = useState([])
    const [busqueda, setBusqueda] = useState("");
    const [estadoFiltro, setEstadoFiltro] = useState("");
    const [orden, setOrden] = useState("");
    useEffect(() => {
        const obtenerClientes = async () => {
            const response = await listarClientesTope()

            setLista(response.data.lista)
        }
        obtenerClientes()
    }, [])

    const clientesFiltrados = [...lista].filter((cliente) => {

        const texto = busqueda.toLowerCase();

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

        return coincideBusqueda && coincideEstado;
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

                default:
                    return 0;
            }
        });

    return (
        <div className="gestion-clientes">
            <div className="gestion-header">
                <h1 className="form-title">Lista de Empresas Representantes Legales</h1>

                <Link to="/cliente/registrar" className="btn-nuevo-cliente">+ Nuevo Cliente</Link>

            </div>
            <div className="filtros-clientes">

                <input
                    type="text"
                    placeholder="Buscar por nombre, dirección o contacto..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />

                <select
                    value={estadoFiltro}
                    onChange={(e) => setEstadoFiltro(e.target.value)}
                >
                    <option value="">Todos los estados</option>
                    <option value="ESPERA">Espera</option>
                    <option value="VIGENTE">Vigente</option>
                    <option value="FINALIZADO">Finalizado</option>
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

                    <div className="tabla-cliente fila-cliente" key={index}>

                        <div>{index + 1}</div>

                        <div>
                            <div>
                                <strong>{cliente.nombreCliente}</strong>
                            </div>
                            <div>
                                {cliente.rutCliente}
                            </div>
                            <div className={`estado ${cliente.contrato === "ESPERA" ? "amarillo" :
                                cliente.contrato === "VIGENTE" ? "verde" : "rojo"}`}>
                                {cliente.contrato}
                            </div>
                        </div>
                        <div>
                            <div><strong > Dirección</strong></div>
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

                        <div>
                            <div>

                                <strong>Contacto</strong>
                            </div>
                            <p>{cliente.nombreContacto}</p>
                            <p>{cliente.email}</p>
                            <p>{cliente.phone}</p>
                        </div>

                    </div >

                ))}
            </div>
        </div >
    )
}

export default ListaClientes