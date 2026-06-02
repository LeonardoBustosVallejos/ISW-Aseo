import { useState } from 'react';
import useActivos from '@hooks/activos/useActivos';
import '@styles/resumen.css';

const IconoCirculo = ({color}) => <svg width="22" height="22"><circle cx="11" cy="11" r="9" fill={color} stroke="#001F3F" strokeWidth="1" /></svg>;
const IconoTriangulo = ({color}) => <svg width="24" height="22"><polygon points="12,2 22,19 2,19" fill={color} stroke="#001F3F" strokeWidth="1" strokeLinejoin="round" /></svg>;

const ResumenRecursos = () => {
    const { resumen, loading, error } = useActivos();
    const [busqueda, setBusqueda] = useState("");

    const datosReales = Array.isArray(resumen) ? resumen : [];
    const datosFiltrados = datosReales.filter(fila => {
        const nombreCompania = (fila.compania || "").toLowerCase();
        const idCliente = String(fila.id || "");
        const terminoBusqueda = busqueda.toLowerCase();

        return nombreCompania.includes(terminoBusqueda) || idCliente.includes(terminoBusqueda);
    });

    const filasVacias = Math.max(0, 8 - datosFiltrados.length);

    if (loading) return <div className="resumen-container"><h2 style={{color: "#002b5e"}}>Cargando clientes...</h2></div>;
    if (error) return <div className="resumen-container"><h2 style={{color: "red"}}>Error: {error}</h2></div>;

    return (
        <main>
            <h2 className="resumen-title">Resumen de Recursos</h2>
            <div className="search-box">
                <input 
                    type="text" 
                    className="search-input"
                    placeholder="Ingrese Compañía a buscar..." 
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
                <button className="search-btn">Buscar</button>
            </div>

            <div className="table-container">
                <table className="resumen-table">
                    <thead>
                        <tr>
                            <th style={{ width: "5%"}}>N</th>
                            <th style={{width: "15%"}}>RUT</th>
                            <th style={{width: "30%"}}>Compañías</th>
                            <th style={{width: "20%"}}>Estado Suministros</th>
                            <th style={{width: "30%"}}>Ubicación</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datosFiltrados.map((fila, index) => (
                            <tr key={`${fila.id}-${index}`}>
                                <td><strong>{index + 1}</strong></td>
                                <td className="td-id">{fila.id}</td>
                                <td>{fila.compania}</td>
                                <td>
                                    <div className="icon-container">
                                        {fila.estadoSuministros?.includes('rojo') && <IconoCirculo color="#e63946"/>}
                                        {fila.estadoSuministros?.includes('naranja') && <IconoCirculo color="#f4a261"/>}
                                        {fila.estadoSuministros?.includes('verde') && <IconoCirculo color="#2a9d8f"/>}
                                        {fila.alerta && <IconoTriangulo color="#e63946" />}
                                    </div>
                                </td>
                                <td>{fila.ubicacion}</td>
                            </tr>
                        ))}
                        {Array.from({length: filasVacias}).map((_, i) => (
                            <tr key={`vacia-${i}`}>
                                <td style={{padding: "24px"}} />
                                <td /><td /><td /><td />
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
};

export default ResumenRecursos;