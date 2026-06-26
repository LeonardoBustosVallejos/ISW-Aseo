import { useState } from 'react';
import useActivos from '@hooks/activos/useActivos';
import { useNavigate } from 'react-router-dom';
import '@styles/resumen.css';

const IconoCirculo = ({color}) => <svg width="22" height="22"><circle cx="11" cy="11" r="9" fill={color} stroke="#001F3F" strokeWidth="1" /></svg>;
const IconoTriangulo = ({color}) => <svg width="24" height="22"><polygon points="12,2 22,19 2,19" fill={color} stroke="#001F3F" strokeWidth="1" strokeLinejoin="round" /></svg>;

const ResumenRecursos = () => {
    const { resumen, loading, error } = useActivos();
    const navigate = useNavigate();
    const [busqueda, setBusqueda] = useState("");

    const irDetalles = (fila) => {
        navigate(`/recursos/detalles/${fila.sede_id}`, { state: { datosSucursal: fila } });
    };

    const datosReales = Array.isArray(resumen) ? resumen : [];
    const datosFiltrados = datosReales.filter(fila => {
        const nombreCompania = (fila.compania || "").toLowerCase();
        const idCliente = String(fila.id || "");
        const terminoBusqueda = busqueda.toLowerCase();

        return nombreCompania.includes(terminoBusqueda) || idCliente.includes(terminoBusqueda);
    });

    if (loading) return <div className="gestion-clientes"><h2 style={{color: "#003366"}}>Cargando recursos...</h2></div>;
    if (error) return <div className="gestion-clientes"><h2 style={{color: "red"}}>Error: {error}</h2></div>;

    return (
        <div className="gestion-clientes">
            <div className="gestion-header">
                <h1>Resumen de Recursos</h1>
            </div>

            <div className="filtros-clientes">
                <input
                    type="text"
                    placeholder="Ingrese Compañía a buscar..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>

            <div className="tabla-clientes">
                {datosFiltrados.map((fila, index) => (
                    <div 
                        className="tabla-cliente fila-recurso" 
                        key={`${fila.id}-${index}`}
                        onClick={() => irDetalles(fila)}
                    >
                        <div>{index + 1}</div>

                        <div>
                            <div>
                                <strong>{fila.compania}</strong>
                            </div>
                            <div>
                                {fila.id}
                            </div>
                        </div>

                        <div>
                            <div><strong>Ubicación</strong></div>
                            <p>{fila.ubicacion}</p>
                        </div>

                        <div>
                            <div><strong>Estado Suministros</strong></div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                {fila.estadoSuministros?.includes('rojo') && <IconoCirculo color="#e63946"/>}
                                {fila.estadoSuministros?.includes('naranja') && <IconoCirculo color="#f4a261"/>}
                                {fila.estadoSuministros?.includes('verde') && <IconoCirculo color="#2a9d8f"/>}
                                {fila.alerta && <IconoTriangulo color="#e63946" />}
                            </div>
                        </div>
                    </div>
                ))}

                {datosFiltrados.length === 0 && (
                    <div className="tabla-cliente">
                        <p style={{ textAlign: "center", color: "#666" }}>No se encontraron compañías con esa búsqueda.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumenRecursos;