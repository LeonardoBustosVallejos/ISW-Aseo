import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSolicitudById } from '@services/solicitud.service';

export default function SolicitudInfo() {
    const { id } = useParams();
    const [solicitud, setSolicitud] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    return (
        <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '0.5rem' }}>Información de la solicitud</h1>
            <p style={{ marginTop: 0, color: '#4b5563' }}>Detalle de la solicitud seleccionada.</p>

            <section style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Datos de la solicitud</h2>
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
