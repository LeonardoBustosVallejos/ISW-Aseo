import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import useDetallesActivos from "@hooks/activos/useDetalles.jsx";
import '@styles/detalles.css';
import Header from '@components/misc/Header.jsx';

const DetallesCliente = () => {
    const { sede_id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [activoSeleccionado, setActivoSeleccionado] = useState(null);
    const datosSucursal = location.state?.datosSucursal || {};
    const { activosFijos, historial, fechaContrato, loading, error } = useDetallesActivos(sede_id, datosSucursal.id);
    const agruparActivos = (activos) => {
        const grupos = {};
        activos.forEach(activo => {
            const nombre = activo.nombre || "Sin nombre";
            if (!grupos[nombre]) {
                grupos[nombre] = [];
            }
            grupos[nombre].push(activo);
        });
        return grupos;
    };

    const formatearFecha = (fechaIso) => {
        if (!fechaIso) return "--/--/--";
        const fecha = new Date(fechaIso);
        return fecha.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: '2-digit' });
    };

    if (loading) {
        return <div className="detalles-container"><h2 style={{color: "#002b5e"}}>Cargando base de datos...</h2></div>;
    }

    if (error) {
        return <div className="detalles-container"><h2 style={{color: "red"}}>{error}</h2></div>;
    }
    
    const activosAgrupados = agruparActivos(activosFijos);
    const solicitudesPendientes = activosFijos.filter(activo => activo.recepcion_confirmada === false);

    return (
        <div className="detalles-container">
            <Header title={datosSucursal.compania || "Compañía Desconocida"} subtitle={
                <>
                    <strong>{'RUT: '}</strong>
                    {datosSucursal.id || datosSucursal.rut || "Sin RUT"}
                    <strong>{' | '}</strong>
                    <strong>{'Ubicación: '}</strong>
                    {datosSucursal.ubicacion || datosSucursal.direccion || "Ubicación no registrada"}
                </>}>
            </Header>

            <div className="detalles-grid">
                
                {/* COLUMNA IZQUIERDA */}
                <div className="columna-izq">
                    <div className="info-card" style={{ marginBottom: '20px' }}>
                        <h3>Activos Fijos</h3>
                        {Object.keys(activosAgrupados).length === 0 ? (
                            <p>No se encontraron activos fijos para esta sede en la Base de Datos.</p>
                        ) : (
                            <div className="activos-grid">
                                {Object.entries(activosAgrupados).map(([nombreGrupo, listaActivos]) => (
                                    <div 
                                        key={nombreGrupo} 
                                        className="activo-item" 
                                        style={{ cursor: "pointer" }}
                                        onClick={() => setActivoSeleccionado({ nombre: nombreGrupo, lista: listaActivos })}
                                    >
                                        <img src="https://cdn-icons-png.flaticon.com/512/883/883074.png" alt="Icono" />
                                        <strong>{nombreGrupo}</strong>
                                        <p style={{ color: "gray", fontSize: "0.9rem" }}>Cantidad: {listaActivos.length}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="info-card" style={{ marginBottom: '20px' }}>
                        <h3>Solicitudes Pendientes</h3>
                        {solicitudesPendientes.length === 0 ? (
                            <p style={{ color: "gray", marginTop: "10px" }}>No hay recepciones pendientes.</p>
                        ) : (
                            solicitudesPendientes.map(solicitud => (
                                <div key={solicitud.activo_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: '10px' }}>
                                    <span style={{ fontSize: '0.95rem' }}>
                                        Recepción de {solicitud.nombre} ({solicitud.codigo_inventario})
                                    </span>
                                    <strong>Pendiente 🔴</strong>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* COLUMNA DERECHA */}
                <div className="columna-der">
                    <div className="info-card" style={{ marginBottom: '20px' }}>
                        <h3>Historial de Movimientos</h3>
                        
                        {historial.length === 0 ? (
                            <p style={{ color: "gray" }}>No hay movimientos registrados para esta sede.</p>
                        ) : (
                            <div className="historial-scroll-container">
                                <ul className="lista-sencilla">
                                    {historial.map((mov, index) => (
                                        <li key={mov.movimiento_id} style={{ marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #f0f0f0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                                                <span className="fecha-etiqueta">{formatearFecha(mov.fecha)}</span>
                                                {index === 0 && (
                                                    <span className="badge-ultimo">Último</span>
                                                )}
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#333' }}>{mov.descripcion}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    
                    <div className="info-card">
                        <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "15px", color: "#333", fontSize: "1rem", fontWeight: "normal" }}>Duración Contrato</h3>
                        <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#002b5e' }}>
                            {fechaContrato || "Indefinido"}
                        </p>
                    </div>
                </div>

            </div>

            {/* Modal */}
            {activoSeleccionado && (
                <div className="modal-overlay" onClick={() => setActivoSeleccionado(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="btn-cerrar-modal" onClick={() => setActivoSeleccionado(null)}>✖</button>
                        <h3 style={{ color: "#002b5e", borderBottom: "2px solid #eee", paddingBottom: "10px" }}>
                            Detalles de {activoSeleccionado.nombre}
                        </h3>
                        
                        <div className="modal-lista">
                            {activoSeleccionado.lista.map((act, index) => (
                                <div key={act.codigo_inventario || act.id || index} className="modal-item">
                                    <p><strong>ID:</strong> {act.codigo_inventario || act.id || "No asignado"}</p>
                                    <p><strong>Estado:</strong> {act.estado || "No definido"}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetallesCliente;