import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@components/misc/Header.jsx'; 
import { Modal } from '@components/Modal'; 
import useGetStockBodega from '@hooks/solicitudes/useGetStockBodega.jsx';
import { updateSolicitud, marcarSolicitudComoRecibida } from '@services/solicitud.service.js';
import { getItemById, updateItem } from '@services/item.service.js';
import { asignarActivos, confirmarRecepcion, getHistorialSede } from '../services/activofijo.service.js';
import { useAuth } from '../context/AuthContext.jsx';
import '@styles/resolverSolicitud.css'; 

const ResolverSolicitud = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const idTrabajador = user?.id;
    const rolId = Number(user?.rol_id || user?.rol?.id);
    const datosSolicitud = location.state?.datosSolicitud;
    const [modalActivosOpen, setModalActivosOpen] = useState(false);
    const [modalInsumosOpen, setModalInsumosOpen] = useState(false);
    const [modalConfirmacionOpen, setModalConfirmacionOpen] = useState(false);
    const [comentarios, setComentarios] = useState(""); 
    const [articuloSeleccionado, setArticuloSeleccionado] = useState(null);
    const [cantidadAAgregar, setCantidadAAgregar] = useState(1);
    const [estadoSolicitud, setEstadoSolicitud] = useState(datosSolicitud?.estado_solicitud || null); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [actionMessage, setActionMessage] = useState({ type: '', text: '' });
    const { stockActivos, loading } = useGetStockBodega();
    const [articulosDespacho, setArticulosDespacho] = useState([]);
    const isRecepcionConfirmada = datosSolicitud.recepcion_confirmada === true || datosSolicitud.recepcion_confirmada === 'true';
    const isSolicitudResuelta = estadoSolicitud !== 'Pendiente'

    if (!datosSolicitud) {
        return (
            <div className="resolver-container resolver-container-center">
                <h2>No se encontraron los datos de la solicitud.</h2>
                <button className="resolver-btn" onClick={() => navigate('/solicitudes')}>
                    Volver a Solicitudes
                </button>
            </div>
        );
    }

    const removerArticulo = (indexToRemove) => {
        setArticulosDespacho(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const iniciarAgregado = (activo, tipo) => {
        setArticuloSeleccionado({ ...activo, tipo: tipo });
        setCantidadAAgregar(1); 
    };

    const handleConfirmarEnvioFinal = async () => {
        setIsSubmitting(true);
        try {
            let erroresAsignacion = [];
            if (articulosDespacho.length > 0) {
                for (const articulo of articulosDespacho) {
                    const payload = {
                        cliente_id: datosSolicitud.cliente_id,
                        sede_id: datosSolicitud.id_sede_solicitud,
                        nombre_maquina: articulo.nombre,
                        cantidad: articulo.cantidad
                    };

                    const respuesta = await asignarActivos(payload);
                    if (!respuesta || (respuesta.status !== 'Success' && respuesta.status !== 200 && respuesta.estado !== 'exito' && !respuesta.success)) { 
                        const mensajeBackend = respuesta?.mensaje || respuesta?.message || "Ocurrió un problema al guardar.";
                        erroresAsignacion.push(`- ${articulo.nombre}: ${mensajeBackend}`);
                    }
                }
            }

            if (erroresAsignacion.length > 0) {
                alert(`Algunos activos no pudieron ser asignados:\n\n${erroresAsignacion.join('\n')}\n\nLa solicitud no fue procesada.`);
                setIsSubmitting(false);
                return;
            }

            const solicitudResponse = await updateSolicitud(datosSolicitud.id_solicitud, {
                ...datosSolicitud,
                estado_solicitud: 'Aceptada',
                detalle_solicitud: comentarios ? `${datosSolicitud.detalle_solicitud} | Resolución Admin: ${comentarios}` : datosSolicitud.detalle_solicitud
            });

            if (!solicitudResponse?.success) throw new Error('No se pudo aceptar la solicitud en la base de datos.');
            const itemResponse = await getItemById(datosSolicitud.id_item_solicitud);
            if (itemResponse?.success) {
                const item = itemResponse.data;
                const nuevaDisponibilidad = Math.max(0, item.disponibilidadActual - datosSolicitud.cantidad_solicitud);
                await updateItem(datosSolicitud.id_item_solicitud, {
                    ...item,
                    disponibilidadActual: nuevaDisponibilidad
                });
            }

            alert("Resolución guardada y solicitud ACEPTADA correctamente.");
            setEstadoSolicitud('Aceptada');
            setModalConfirmacionOpen(false);
            navigate('/solicitudes');

        } catch (error){
            console.error("Error detallado del backend:", error);
            const mensajeError = error.response?.data?.mensaje || error.response?.data?.message || error.message || 'Revisa la consola para más detalles';
            alert(`Error crítico en la operación: ${mensajeError}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmarAgregado = () => {
        if (cantidadAAgregar <= 0 || cantidadAAgregar > articuloSeleccionado.cantidad_disponible) {
            alert(`Cantidad inválida. Máximo disponible: ${articuloSeleccionado.cantidad_disponible}`);
            return;
        }

        setArticulosDespacho(prev => {
            const indexExistente = prev.findIndex(art => art.nombre === articuloSeleccionado.nombre);
            
            if (indexExistente >= 0) {
                const nuevaLista = [...prev];
                nuevaLista[indexExistente] = {
                    ...nuevaLista[indexExistente],
                    cantidad: nuevaLista[indexExistente].cantidad + cantidadAAgregar
                };
                return nuevaLista;
            } else {
                return [
                    ...prev,
                    { 
                        id: articuloSeleccionado.id || Date.now(), 
                        tipo: articuloSeleccionado.tipo, 
                        nombre: articuloSeleccionado.nombre, 
                        cantidad: cantidadAAgregar 
                    }
                ];
            }
        });
        
        setArticuloSeleccionado(null);
        setModalActivosOpen(false);
    };

    const handleRejectSolicitud = async () => {
        if (!datosSolicitud?.id_solicitud) return;
        setIsSubmitting(true);
        setActionMessage({ type: '', text: '' });

        try {
            const response = await updateSolicitud(datosSolicitud.id_solicitud, {
                ...datosSolicitud,
                estado_solicitud: 'Rechazada'
            });
            if (!response?.success) throw new Error('No se pudo rechazar la solicitud');

            setEstadoSolicitud('Rechazada');
            setActionMessage({ type: 'success', text: 'Solicitud rechazada correctamente.' });
        } catch (err) {
            setActionMessage({ type: 'error', text: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmarRecepcion = async () => {
        setIsSubmitting(true);
        try {
            const historial = await getHistorialSede(datosSolicitud.id_sede_solicitud);
            if (!historial || !Array.isArray(historial)) {
                alert("Error al leer el historial de la sede.");
                setIsSubmitting(false);
                return;
            }

            let activosIds = [];
            for (const mov of historial) {
                if (mov.tipo_movimiento === 'ASIGNACION') {
                    if (mov.activos_ids) {
                        const ids = String(mov.activos_ids)
                            .split(',')
                            .map(id => parseInt(id.trim()))
                            .filter(id => !isNaN(id));
                        activosIds = [...activosIds, ...ids];
                    }
                } else if (mov.tipo_movimiento === 'RECEPCION') {
                    break;
                }
            }

            if (activosIds.length === 0) {
                alert("No hay activos pendientes de recepción en el historial de esta sede.");
                setIsSubmitting(false);
                return;
            }

            const payload = {
                cliente_id: datosSolicitud.cliente_id,
                sede_id: datosSolicitud.id_sede_solicitud,
                activos_ids: activosIds,
                trabajador_id: idTrabajador
            };
            const respuesta = await confirmarRecepcion(payload); 
            
            if (respuesta?.estado === "exito" || respuesta?.status === "Success" || respuesta?.success) {
                await marcarSolicitudComoRecibida(datosSolicitud.id_solicitud);
                alert(`Recepción confirmada exitosamente. Se recibieron ${activosIds.length} activos en total.`);
                navigate('/solicitudes'); 
            } else {
                alert(respuesta?.mensaje || "Ocurrió un problema al confirmar la recepción.");
            }
        } catch (error) {
            console.error("Error al confirmar recepción:", error);
            alert("Ocurrió un problema al confirmar la recepción. Revisa la consola.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="resolver-container">
            <Header title={`Resolver Solicitud`} subtitle={
                <>
                    {datosSolicitud.nombre_cliente || 'Sin Cliente'}
                    <strong>{' | '}</strong>
                    {datosSolicitud.ubicacion || 'Sin Ubicación'}
                    <div className="resolver-estado-badge">Estado: {estadoSolicitud || datosSolicitud.estado_solicitud}</div>
                </>}>
            </Header>

            <div className="resolver-grid">
                {/* Columna izquierda */}
                <div className="resolver-card">
                    <h3>Requerimiento Original</h3>
                    <ul className="resolver-lista">
                        <li>
                            <span className="resolver-etiqueta">ID Solicitante</span>
                            <strong>{datosSolicitud.id_solicitante}</strong>
                        </li>
                        <li>
                            <span className="resolver-etiqueta">Item Solicitado (ID)</span>
                            <strong>{datosSolicitud.id_item_solicitud}</strong>
                        </li>
                        <li>
                            <span className="resolver-etiqueta">Cantidad Pedida</span>
                            <strong className="resolver-cantidad-destacada">
                                {datosSolicitud.cantidad_solicitud}
                            </strong>
                        </li>
                        <li className="sin-borde">
                            <span className="resolver-etiqueta">Detalle Adicional</span>
                            <p className="resolver-detalle-texto">
                                {datosSolicitud.detalle_solicitud || "Sin detalles adicionales."}
                            </p>
                        </li>
                    </ul>
                </div>

                {/* Columna derecha (ADMIN) */}
                {rolId === 1 && (
                    <div className="resolver-card">
                        <h3>Resolución Rápida</h3>

                        <div className="botones-decision-container">
                            <button
                                type="button"
                                onClick={() => setModalConfirmacionOpen(true)} // 👇 Abre el modal en vez de aceptar directamente
                                disabled={isSubmitting || isSolicitudResuelta}
                                className={`resolver-btn btn-aceptar ${estadoSolicitud === 'Aceptada' ? 'btn-activo' : ''} ${estadoSolicitud === 'Rechazada' ? 'btn-desactivado' : ''}`}
                            >
                                ✓ Aceptar
                            </button>
                            <button
                                type="button"
                                onClick={handleRejectSolicitud}
                                disabled={isSubmitting || isSolicitudResuelta}
                                className={`resolver-btn btn-rechazar ${estadoSolicitud === 'Rechazada' ? 'btn-activo' : ''} ${estadoSolicitud === 'Aceptada' ? 'btn-desactivado' : ''}`}
                            >
                                ✕ Rechazar
                            </button>
                        </div>

                        {actionMessage.text && (
                            <div className={`message-alert message-${actionMessage.type}`}>
                                {actionMessage.text}
                            </div>
                        )}

                        <div className="botones-modales-container">
                            {/* 👇 Bloqueamos visual y funcionalmente estos botones si ya se resolvió */}
                            <div 
                                className="boton-modal-opcion" 
                                onClick={() => !isSolicitudResuelta && setModalActivosOpen(true)}
                                style={{ opacity: isSolicitudResuelta ? 0.5 : 1, cursor: isSolicitudResuelta ? 'not-allowed' : 'pointer' }}
                            >
                                <div className="boton-modal-titulo">Activos Fijos</div>
                                <div className="boton-modal-icono">📦</div>
                            </div>
                            
                            <div 
                                className="boton-modal-opcion" 
                                onClick={() => !isSolicitudResuelta && setModalInsumosOpen(true)}
                                style={{ opacity: isSolicitudResuelta ? 0.5 : 1, cursor: isSolicitudResuelta ? 'not-allowed' : 'pointer' }}
                            >
                                <div className="boton-modal-titulo">Insumos</div>
                                <div className="boton-modal-icono">🧪</div>
                            </div>
                        </div>

                        <div className="seleccionados-container">
                            <h4 className="seleccionados-titulo">
                                Artículos seleccionados para envío:
                            </h4>
                            
                            {articulosDespacho.length === 0 ? (
                                <p className="seleccionados-vacio">
                                    No se han agregado artículos extra.
                                </p>
                            ) : (
                                <ul className="seleccionados-lista">
                                    {articulosDespacho.map((art, index) => (
                                        <li key={index} className="seleccionados-item">
                                            <span>
                                                <strong className="seleccionados-item-cantidad">{art.cantidad}x</strong> {art.nombre} 
                                                <span className="seleccionados-item-tipo">({art.tipo})</span>
                                            </span>
                                            {/* Ocultar el botón "Quitar" si ya se resolvió */}
                                            {!isSolicitudResuelta && (
                                                <button 
                                                    type="button"
                                                    onClick={() => removerArticulo(index)}
                                                    className="seleccionados-btn-quitar"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        {/* Se eliminó el formulario y el botón de Guardar Resolución que iba aquí */}
                    </div>
                )}

                {/* Columna derecha (SUPERVISOR) */}
                {rolId === 3 && (
                    <div className="resolver-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🏢</div>
                            <h3 style={{ color: '#003366', marginBottom: '10px' }}>Recepción en Sede</h3>
                            <p style={{ color: '#555', lineHeight: '1.5' }}>
                                ¿Confirmas que los activos asignados a esta solicitud han llegado físicamente a la sede?
                            </p>
                        </div>
                        <button 
                            type="button" 
                            className={`resolver-btn btn-aceptar ${isRecepcionConfirmada ? 'btn-desactivado' : ''}`} 
                            onClick={handleConfirmarRecepcion}
                            disabled={isSubmitting || isRecepcionConfirmada}
                            style={{ 
                                padding: '15px', 
                                fontSize: '1.1rem', 
                                fontWeight: 'bold',
                                opacity: isRecepcionConfirmada ? 0.6 : 1,
                                cursor: isRecepcionConfirmada ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isSubmitting ? 'Procesando...' : (isRecepcionConfirmada ? 'Recepción Confirmada ✓' : 'Sí, confirmar recepción')}
                        </button>
                    </div>
                )}

            </div>

            {/* Modales de Inventario ... (Se mantienen igual) */}
            <Modal open={modalActivosOpen} onClose={() => { setModalActivosOpen(false); setArticuloSeleccionado(null); }} title={articuloSeleccionado ? "Confirmar Cantidad" : "Inventario de Activos Fijos"} subtitle={articuloSeleccionado ? "" : "Selecciona los equipos que enviarás a la sede"} width="700px">
                {/* ... código del modal de activos (mismo que ya tenías) ... */}
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
                                                return(
                                                <tr key={index}>
                                                    <td className="modal-td-nombre">{activo.nombre}</td>
                                                    <td className="modal-td-stock">{stockReal} unid.</td>
                                                    <td className="modal-td-accion">
                                                        <button type="button" onClick={() => iniciarAgregado({...activo, cantidad_disponible: stockReal}, 'Activo')} className="resolver-btn modal-btn-agregar">
                                                            + Agregar
                                                        </button>
                                                    </td>
                                                </tr>
                                                );
                                            })
                                        ) : (
                                            <tr><td colSpan="3" className="modal-empty-row">No hay activos disponibles.</td></tr>
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
                                <p className="confirmacion-subtexto">Máximo disponible: {articuloSeleccionado.cantidad_disponible} unidades.</p>
                            </div>
                            <div>
                                <label className="confirmacion-label">Cantidad a despachar:</label>
                                <input type="number" min="1" max={articuloSeleccionado.cantidad_disponible} value={cantidadAAgregar} onChange={(e) => setCantidadAAgregar(parseInt(e.target.value) || 1)} className="confirmacion-input" />
                            </div>
                            <div className="confirmacion-acciones">
                                <button type="button" onClick={() => setArticuloSeleccionado(null)} className="confirmacion-btn-cancelar">Cancelar</button>
                                <button type="button" onClick={confirmarAgregado} className="resolver-btn confirmacion-btn-confirmar">Confirmar</button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
            
            <Modal open={modalInsumosOpen} onClose={() => setModalInsumosOpen(false)} title="Gestión de Insumos" subtitle={`Sede: ${datosSolicitud.ubicacion}`} width="800px">
                <div className="modal-body-padding"><p>Aquí se cargará el stock de detergente, cloro y útiles de aseo.</p></div>
            </Modal>

            {/* 👇 NUEVO MODAL DE CONFIRMACIÓN FINAL (Ahora incluye los comentarios) */}
            <Modal
                open={modalConfirmacionOpen}
                onClose={() => setModalConfirmacionOpen(false)}
                title="Confirmar Aceptación"
                subtitle={`Destino: ${datosSolicitud.ubicacion}`}
                isForm={true}
                onAcept={handleConfirmarEnvioFinal}
            >
                <div style={{ padding: '20px', color: '#333' }}>
                    {articulosDespacho.length > 0 && (
                        <>
                            <h4 style={{ marginBottom: '10px', fontSize: '1.1rem', color: '#003366' }}>Resumen de artículos a despachar:</h4>
                            <ul style={{ listStyleType: 'none', padding: 0, marginBottom: '20px' }}>
                                {articulosDespacho.map((art, idx) => (
                                    <li key={idx} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                                        <strong>{art.cantidad}x</strong> {art.nombre} <span style={{ color: '#888', fontSize: '0.9em' }}>({art.tipo})</span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    
                    <h4 style={{ marginBottom: '10px', fontSize: '1.1rem', color: '#003366' }}>Comentarios adicionales:</h4>
                    {/* El textarea ahora vive dentro del modal */}
                    <textarea 
                        rows="3" 
                        placeholder="Ej: Se aprueba la solicitud y se envían repuestos..."
                        className="formulario-textarea"
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                        value={comentarios}
                        onChange={(e) => setComentarios(e.target.value)}
                    ></textarea>
                    
                    <p style={{ marginTop: '20px', fontWeight: 'bold', textAlign: 'center' }}>
                        ¿Estás seguro de ACEPTAR la solicitud y procesar el envío?
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default ResolverSolicitud;