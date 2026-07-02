import { useState, useEffect } from 'react';
import { getDetalles, getHistorialSede } from '../../services/activofijo.service.js';

const useDetallesActivos = (sede_id) => {
    const [activosFijos, setActivosFijos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [historial, setHistorial] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!sede_id) return;

        const cargarActivos = async () => {
            setLoading(true);
            try {
                const [respuestaActivos, respuestaHistorial] = await Promise.all([
                    getDetalles(sede_id),
                    getHistorialSede(sede_id)
                ]);
                const todosLosActivos = Array.isArray(respuestaActivos) ? respuestaActivos : [];
                const filtrados = todosLosActivos.filter(activo => activo.tipo !== "Consumible");
                
                setActivosFijos(filtrados);
                setHistorial(Array.isArray(respuestaHistorial) ? respuestaHistorial : []);
                setError(null);
            } catch (err) {
                const mensajeBackend = err.response?.data?.message;
                const mensajeReact = err.message;
                
                setError(String(mensajeBackend || mensajeReact || "Error desconocido"));
                setActivosFijos([]);
                setHistorial([]);
            } finally {
                setLoading(false);
            }
        };

        cargarActivos();
    }, [sede_id]);

    return { activosFijos, loading, error, historial };
};

export default useDetallesActivos;