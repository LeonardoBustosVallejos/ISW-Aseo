import { useState, useEffect } from 'react';
import { getDetalles, getHistorialSede, getFechaContrato } from '../../services/activofijo.service.js';

const useDetallesActivos = (sede_id, cliente_id) => { 
    const [activosFijos, setActivosFijos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [historial, setHistorial] = useState([]);
    const [error, setError] = useState(null);
    const [fechaContrato, setFechaContrato] = useState("Cargando..."); 

    useEffect(() => {
        if (!sede_id) return;

        const cargarActivos = async () => {
            setLoading(true);
            try {
                const promesas = [
                    getDetalles(sede_id),
                    getHistorialSede(sede_id)
                ];
                if (cliente_id) {
                    promesas.push(getFechaContrato(cliente_id));
                }

                const resultados = await Promise.all(promesas);
                const respuestaActivos = resultados[0];
                const respuestaHistorial = resultados[1];
                const respuestaFecha = cliente_id ? resultados[2] : null;
                const todosLosActivos = Array.isArray(respuestaActivos) ? respuestaActivos : [];
                const filtrados = todosLosActivos.filter(activo => activo.tipo !== "Consumible");
                
                setActivosFijos(filtrados);
                setHistorial(Array.isArray(respuestaHistorial) ? respuestaHistorial : []);       
                if (respuestaFecha && respuestaFecha.status === "Success" && respuestaFecha.data) {
                    const [año, mes, dia] = respuestaFecha.data.split("-");
                    const fechaObj = new Date(año, mes - 1, dia);
                    const fechaConPalabras = fechaObj.toLocaleDateString('es-CL', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    });
                    setFechaContrato(fechaConPalabras);
                } else {
                    setFechaContrato("Indefinido");
                }
                setError(null);
            } catch (err) {
                const mensajeBackend = err.response?.data?.message;
                const mensajeReact = err.message;
                
                setError(String(mensajeBackend || mensajeReact || "Error desconocido"));
                setActivosFijos([]);
                setHistorial([]);
                setFechaContrato("No disponible");
            } finally {
                setLoading(false);
            }
        };

        cargarActivos();
    }, [sede_id, cliente_id]); 
    return { activosFijos, loading, error, historial, fechaContrato };
};

export default useDetallesActivos;