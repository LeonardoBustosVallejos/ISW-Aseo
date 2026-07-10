import { useState } from 'react';
import useActivos from '@hooks/activos/useActivos';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import '@styles/resumen.css';
import Header from '../../components/misc/Header.jsx';
import ListaCompania from '../../components/ListaCompanias.jsx';
import Search from '../../components/Search.jsx';

const IconoCirculo = ({color}) => <svg width="22" height="22"><circle cx="11" cy="11" r="9" fill={color} stroke="#001F3F" strokeWidth="1" /></svg>;
const IconoTriangulo = ({color}) => <svg width="24" height="22"><polygon points="12,2 22,19 2,19" fill={color} stroke="#001F3F" strokeWidth="1" strokeLinejoin="round" /></svg>;

const ResumenRecursos = () => {
    const { user } = useAuth();
    const { resumen, loading, error } = useActivos();
    const navigate = useNavigate();
    const [busqueda, setBusqueda] = useState("");
    const rolRaw = user?.rol;
    const roleId = Number(rolRaw?.id || rolRaw?.rol_id || rolRaw?.role_id || rolRaw);
    const userRole = typeof rolRaw === 'string' ? rolRaw : rolRaw?.nombre || rolRaw?.rol || '';
    const isAdministrador = roleId === 1 || String(userRole).toLowerCase() === 'administrador';

    const irDetalles = (fila) => {
        navigate(`/recursos/detalles/${fila.sede_id}`, { state: { datosSucursal: fila } });
    };

    const datosReales = Array.isArray(resumen) ? resumen : [];
    const datosFiltrados = datosReales.filter(fila => {
        if (!isAdministrador) return true;
        
        const nombreCompania = (fila.compania || "").toLowerCase();
        const ubicacionCompania = (fila.ubicacion || "").toLowerCase();
        const idCliente = String(fila.id || "");
        const terminoBusqueda = busqueda.toLowerCase();
        return nombreCompania.includes(terminoBusqueda) || idCliente.includes(terminoBusqueda) || ubicacionCompania.includes(terminoBusqueda);
    });

    if (loading) return <div className="gestion-clientes"><h2 style={{color: "#003366"}}>Cargando recursos...</h2></div>;
    if (error) return <div className="gestion-clientes"><h2 style={{color: "red"}}>Error: {error}</h2></div>;

    return (
        <div className="gestion-clientes">
            <Header title={isAdministrador ? "Resumen de Recursos" : "Mi Sede"} />
            {isAdministrador && (
                <div className="filtros-clientes">
                    <Search 
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Ingrese Compañía a buscar..."
                    />
                </div>
            )}

            <ListaCompania 
                data={datosFiltrados} 
                onRowClick={irDetalles}
                emptyMessage={isAdministrador ? "No se encontraron compañías con esa búsqueda." : "Aún no tienes una sede asignada."}
                
                renderExtraContent={(fila) => (
                    <>
                        <div><strong>Estado Suministros</strong></div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            {fila.estadoSuministros?.includes('rojo') && <IconoCirculo color="#e63946"/>}
                            {fila.estadoSuministros?.includes('naranja') && <IconoCirculo color="#f4a261"/>}
                            {fila.estadoSuministros?.includes('verde') && <IconoCirculo color="#2a9d8f"/>}
                            {fila.alerta && <IconoTriangulo color="#e63946" />}
                        </div>
                    </>
                )}
            />
        </div>
    );
};

export default ResumenRecursos;