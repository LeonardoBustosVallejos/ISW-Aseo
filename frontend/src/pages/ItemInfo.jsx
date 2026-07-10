import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getItemById } from '@services/item.service';

export default function ItemInfo() {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const cargarInformacion = async () => {
            setLoading(true);
            setError('');

            try {
                const itemResponse = await getItemById(id);
                if (!itemResponse?.success) {
                    throw new Error(itemResponse?.message || 'No se pudo cargar el item');
                }

                setItem(itemResponse.data);
            } catch (err) {
                setError(err.message || 'Ocurrió un error inesperado');
            } finally {
                setLoading(false);
            }
        };

        cargarInformacion();
    }, [id]);

    if (loading) {
        return <div style={{ padding: '2rem' }}>Cargando información del item...</div>;
    }

    if (error) {
        return <div style={{ padding: '2rem', color: '#b91c1c' }}>{error}</div>;
    }

    const camposItem = Object.entries(item || {}).filter(([key]) => !['id', 'createdAt', 'updatedAt'].includes(key));

    return (
        <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '0.5rem' }}>Información del item</h1>
            <p style={{ marginTop: 0, color: '#4b5563' }}>Detalle del item seleccionado.</p>

            <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
                <section style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Datos del item</h2>
                    {camposItem.length > 0 ? (
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {camposItem.map(([key, value]) => (
                                <div key={key} style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                                    <strong style={{ textTransform: 'capitalize', display: 'block', marginBottom: '0.2rem' }}>
                                        {key.replace(/([A-Z])/g, ' $1')}
                                    </strong>
                                    <span>{value ?? '—'}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No hay información disponible para este item.</p>
                    )}
                </section>
            </div>
        </div>
    );
}
