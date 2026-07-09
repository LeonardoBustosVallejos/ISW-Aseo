import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { getSolicitudById, updateSolicitud } from '@services/solicitud.service';
//para ver si este commit funciona

export default function SolicitudInfo() {
    const { id } = useParams();
    const { user } = useAuth();
    const [solicitud, setSolicitud] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionMessage, setActionMessage] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const cargarInformacion = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await getSolicitudById(id);
                if (!response?.success) {
                    throw new Error(response?.message || 'No se pudo cargar la solicitud');
                }

                setSolicitud(response.data);
            } catch (err) {
                setError(err.message || 'Ocurrió un error inesperado');
            } finally {
                setLoading(false);
            }
        };

        cargarInformacion();
    }, [id]);

    if (loading) {
        return <div style={{ padding: '2rem' }}>Cargando información de la solicitud...</div>;
    }

    if (error) {
        return <div style={{ padding: '2rem', color: '#b91c1c' }}>{error}</div>;
    }

    const camposSolicitud = Object.entries(solicitud || {}).filter(([key]) => !['id', 'createdAt', 'updatedAt'].includes(key));

    const rolRaw = user?.rol;
    const userRole = typeof rolRaw === 'string'
        ? rolRaw
        : rolRaw?.nombre || rolRaw?.rol || rolRaw?.nombreRol || rolRaw?.role || '';
    const roleId = Number(rolRaw?.id || rolRaw?.rol_id || rolRaw?.role_id || rolRaw);
    const lowerRole = String(userRole).toLowerCase();
    const isAdministrador = lowerRole === 'administrador' || roleId === 1;

    const handleUpdateSolicitudEstado = async (nuevoEstado) => {
        if (!solicitud?.id_solicitud && !solicitud?.id) {
            setActionMessage({ type: 'error', text: `No hay una solicitud válida para ${nuevoEstado === 'Aceptada' ? 'aceptar' : 'rechazar'}.` });
            return;
        }

        setIsSubmitting(true);
        setActionMessage({ type: '', text: '' });

        try {
            const solicitudId = solicitud.id_solicitud ?? solicitud.id;
            const response = await updateSolicitud(solicitudId, {
                ...solicitud,
                estado_solicitud: nuevoEstado
            });

            if (!response?.success) {
                throw new Error(response?.message || `No se pudo ${nuevoEstado === 'Aceptada' ? 'aceptar' : 'rechazar'} la solicitud`);
            }

            setSolicitud((prev) => prev ? { ...prev, estado_solicitud: nuevoEstado } : prev);
            setActionMessage({ type: 'success', text: `Solicitud ${nuevoEstado === 'Aceptada' ? 'aceptada' : 'rechazada'} correctamente.` });
        } catch (err) {
            setActionMessage({ type: 'error', text: err.message || `Ocurrió un error al ${nuevoEstado === 'Aceptada' ? 'aceptar' : 'rechazar'} la solicitud.` });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAcceptSolicitud = () => handleUpdateSolicitudEstado('Aceptada');
    const handleRejectSolicitud = () => handleUpdateSolicitudEstado('Rechazada');

    return (
        <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '0.5rem' }}>Información de la solicitud</h1>
            <p style={{ marginTop: 0, color: '#4b5563' }}>Detalle de la solicitud seleccionada.</p>

            <section style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0 }}>Datos de la solicitud</h2>
                    {isAdministrador && (
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                type="button"
                                onClick={handleRejectSolicitud}
                                disabled={isSubmitting || solicitud?.estado_solicitud === 'Rechazada' || solicitud?.estado_solicitud === 'Aceptada'}
                                style={{
                                    padding: '0.7rem 1rem',
                                    border: 'none',
                                    borderRadius: '6px',
                                    backgroundColor: solicitud?.estado_solicitud === 'Rechazada' ? '#dc2626' : '#ef4444',
                                    color: '#fff',
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    opacity: isSubmitting ? 0.7 : 1,
                                    fontWeight: 600
                                }}
                            >
                                {isSubmitting ? 'Procesando...' : solicitud?.estado_solicitud === 'Rechazada' ? 'Rechazada' : 'Rechazar'}
                            </button>
                            <button
                                type="button"
                                onClick={handleAcceptSolicitud}
                                disabled={isSubmitting || solicitud?.estado_solicitud === 'Aceptada'}
                                style={{
                                    padding: '0.7rem 1rem',
                                    border: 'none',
                                    borderRadius: '6px',
                                    backgroundColor: solicitud?.estado_solicitud === 'Aceptada' ? '#16a34a' : '#2563eb',
                                    color: '#fff',
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    opacity: isSubmitting ? 0.7 : 1,
                                    fontWeight: 600
                                }}
                            >
                                {isSubmitting ? 'Procesando...' : solicitud?.estado_solicitud === 'Aceptada' ? 'Aceptada' : 'Aceptar'}
                            </button>
                        </div>
                    )}
                </div>

            </div>

            {/* Modales */}
            <Modal
                open={modalActivosOpen}
                onClose={() => {
                    setModalActivosOpen(false);
                    setArticuloSeleccionado(null);
                }}
                title={articuloSeleccionado ? "Confirmar Cantidad" : "Inventario de Activos Fijos (Bodega)"}
                subtitle={articuloSeleccionado ? "" : "Selecciona los equipos que enviarás a la sede"}
                width="700px"
            >
                <div className="modal-body-padding">
                    
                    {!articuloSeleccionado && (
                        <div className="table-wrapper">
                            {loading ? (
                                <p className="modal-loading">Cargando stock...</p>
                            ) : (
                                <table className="modal-table">
                                    <thead>
                                        <tr>
                                            <th>Equipo / Maquinaria</th>
                                            <th style={{ textAlign: 'center' }}>Stock Disponible</th>
                                            <th style={{ textAlign: 'center' }}>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stockActivos && stockActivos.length > 0 ? (
                                            stockActivos.map((activo, index) => {
                                                const cantidadEnLista = articulosDespacho
                                                    .filter(art => art.nombre === activo.nombre)
                                                    .reduce((sum, art) => sum + art.cantidad, 0);
                                                const stockReal = activo.cantidad_disponible - cantidadEnLista;
                                                if (stockReal <= 0) return null;

                                                return (
                                                    <tr key={index}>
                                                        <td className="modal-td-nombre">{activo.nombre}</td>
                                                        <td className="modal-td-stock">
                                                            {stockReal} unid.
                                                        </td>
                                                        <td className="modal-td-accion">
                                                            <button 
                                                                type="button"
                                                                onClick={() => iniciarAgregado({...activo, cantidad_disponible: stockReal}, 'Activo')}
                                                                className="resolver-btn modal-btn-agregar"
                                                            >
                                                                + Agregar
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="modal-empty-row">
                                                    No hay activos disponibles en bodega.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {articuloSeleccionado && (
                        <div className="confirmacion-container">
                            <div className="confirmacion-info">
                                <p className="confirmacion-texto">Has seleccionado: <strong>{articuloSeleccionado.nombre}</strong></p>
                                <p className="confirmacion-subtexto">
                                    Máximo disponible: {articuloSeleccionado.cantidad_disponible} unidades.
                                </p>
                            </div>
                            
                            <div>
                                <label className="confirmacion-label">
                                    Cantidad a despachar:
                                </label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max={articuloSeleccionado.cantidad_disponible}
                                    value={cantidadAAgregar}
                                    onChange={(e) => setCantidadAAgregar(parseInt(e.target.value) || 1)}
                                    className="confirmacion-input"
                                />
                            </div>

                            <div className="confirmacion-acciones">
                                <button 
                                    type="button"
                                    onClick={() => setArticuloSeleccionado(null)}
                                    className="confirmacion-btn-cancelar"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="button"
                                    onClick={confirmarAgregado}
                                    className="resolver-btn confirmacion-btn-confirmar"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
            <Modal
                open={modalInsumosOpen}
                onClose={() => setModalInsumosOpen(false)}
                title="Gestión de Insumos"
                subtitle={`Sede: ${datosSolicitud.ubicacion}`}
                width="800px"
            >
                <div className="modal-body-padding">
                    <p>Aquí se cargará el stock de detergente, cloro y útiles de aseo.</p>
                </div>
            </Modal>

        </div>
    );
};

export default ResolverSolicitud;