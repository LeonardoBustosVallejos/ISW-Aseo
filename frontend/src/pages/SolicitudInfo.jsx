import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { getSolicitudById, updateSolicitud } from '@services/solicitud.service';

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

                {actionMessage.text && (
                    <div style={{
                        marginBottom: '1rem',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        backgroundColor: actionMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
                        color: actionMessage.type === 'success' ? '#166534' : '#991b1b'
                    }}>
                        {actionMessage.text}
                    </div>
                )}
                {camposSolicitud.length > 0 ? (
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {camposSolicitud.map(([key, value]) => (
                            <div key={key} style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                                <strong style={{ textTransform: 'capitalize', display: 'block', marginBottom: '0.2rem' }}>
                                    {key.replace(/([A-Z])/g, ' $1')}
                                </strong>
                                <span>{value ?? '—'}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No hay información disponible para esta solicitud.</p>
                )}
            </section>
        </div>
    );
}
