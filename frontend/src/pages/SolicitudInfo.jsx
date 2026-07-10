import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@components/misc/Header.jsx'; 
import { Modal } from '@components/Modal'; 
import useGetStockBodega from '@hooks/solicitudes/useGetStockBodega.jsx';
import { updateSolicitud } from '@services/solicitud.service.js';
import { getItemById, updateItem } from '@services/item.service.js';
import '@styles/resolverSolicitud.css'; 

const ResolverSolicitud = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const [modalActivosOpen, setModalActivosOpen] = useState(false);
    const [modalInsumosOpen, setModalInsumosOpen] = useState(false);
    
    const [articuloSeleccionado, setArticuloSeleccionado] = useState(null);
    const [cantidadAAgregar, setCantidadAAgregar] = useState(1);
    
    const [estadoSolicitud, setEstadoSolicitud] = useState(null); // null, 'Aceptada', o 'Rechazada'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [actionMessage, setActionMessage] = useState({ type: '', text: '' });
    
    const { stockActivos, loading } = useGetStockBodega();
    const [articulosDespacho, setArticulosDespacho] = useState([]);
    const datosSolicitud = location.state?.datosSolicitud;

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

    const handleGuardarResolucion = (e) => {
        e.preventDefault();
        console.log("Guardando resolución para ID:", datosSolicitud.id_solicitud);
        console.log("Artículos a enviar:", articulosDespacho);
        navigate('/solicitudes');
    };

    const removerArticulo = (indexToRemove) => {
        setArticulosDespacho(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const iniciarAgregado = (activo, tipo) => {
        setArticuloSeleccionado({ ...activo, tipo: tipo });
        setCantidadAAgregar(1); 
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
                nuevaLista[indexExistente].cantidad += cantidadAAgregar;
                return nuevaLista;
            } else {
                return [
                    ...prev,
                    { 
                        id: Date.now(), 
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

    const handleAcceptSolicitud = async () => {
        if (!datosSolicitud?.id_solicitud) {
            setActionMessage({ type: 'error', text: 'No hay una solicitud válida para aceptar.' });
            return;
        }

        setIsSubmitting(true);
        setActionMessage({ type: '', text: '' });

        try {
            // Actualizar estado de la solicitud a "Aceptada"
            const solicitudResponse = await updateSolicitud(datosSolicitud.id_solicitud, {
                ...datosSolicitud,
                estado_solicitud: 'Aceptada'
            });

            if (!solicitudResponse?.success) {
                throw new Error(solicitudResponse?.message || 'No se pudo aceptar la solicitud');
            }

            // Obtener el item y restar la cantidad disponible
            const itemResponse = await getItemById(datosSolicitud.id_item_solicitud);
            if (!itemResponse?.success) {
                throw new Error(itemResponse?.message || 'No se pudo obtener el item');
            }

            const item = itemResponse.data;
            const nuevaDisponibilidad = Math.max(0, item.disponibilidadActual - datosSolicitud.cantidad_solicitud);

            // Actualizar el item con la nueva disponibilidad
            const updateItemResponse = await updateItem(datosSolicitud.id_item_solicitud, {
                ...item,
                disponibilidadActual: nuevaDisponibilidad
            });

            if (!updateItemResponse?.success) {
                throw new Error(updateItemResponse?.message || 'No se pudo actualizar el item');
            }

            setEstadoSolicitud('Aceptada');
            setActionMessage({ type: 'success', text: 'Solicitud aceptada correctamente. Disponibilidad del item actualizada.' });
        } catch (err) {
            setActionMessage({ type: 'error', text: err.message || 'Ocurrió un error al aceptar la solicitud.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRejectSolicitud = async () => {
        if (!datosSolicitud?.id_solicitud) {
            setActionMessage({ type: 'error', text: 'No hay una solicitud válida para rechazar.' });
            return;
        }

        setIsSubmitting(true);
        setActionMessage({ type: '', text: '' });

        try {
            // Actualizar estado de la solicitud a "Rechazada"
            const response = await updateSolicitud(datosSolicitud.id_solicitud, {
                ...datosSolicitud,
                estado_solicitud: 'Rechazada'
            });

            if (!response?.success) {
                throw new Error(response?.message || 'No se pudo rechazar la solicitud');
            }

            setEstadoSolicitud('Rechazada');
            setActionMessage({ type: 'success', text: 'Solicitud rechazada correctamente.' });
        } catch (err) {
            setActionMessage({ type: 'error', text: err.message || 'Ocurrió un error al rechazar la solicitud.' });
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
                    <div className="resolver-estado-badge">Estado: {datosSolicitud.estado_solicitud}</div>
                </>}>
            </Header>

            <div className="resolver-grid">
                
                {/* Columna Izquierda */}
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

                {/* Columna derecha*/}
                <div className="resolver-card">
                    <h3>Resolución Rápida</h3>

                    {/* Botones Aceptar y Rechazar */}
                    <div className="botones-decision-container">
                        <button
                            type="button"
                            onClick={handleAcceptSolicitud}
                            disabled={isSubmitting || estadoSolicitud !== null || datosSolicitud.estado_solicitud !== 'Pendiente'}
                            className={`resolver-btn btn-aceptar ${estadoSolicitud === 'Aceptada' ? 'btn-activo' : ''} ${estadoSolicitud === 'Rechazada' ? 'btn-desactivado' : ''}`}
                        >
                            ✓ Aceptar
                        </button>
                        <button
                            type="button"
                            onClick={handleRejectSolicitud}
                            disabled={isSubmitting || estadoSolicitud !== null || datosSolicitud.estado_solicitud !== 'Pendiente'}
                            className={`resolver-btn btn-rechazar ${estadoSolicitud === 'Rechazada' ? 'btn-activo' : ''} ${estadoSolicitud === 'Aceptada' ? 'btn-desactivado' : ''}`}
                        >
                            ✕ Rechazar
                        </button>
                    </div>

                    {/* Mensaje de estado */}
                    {actionMessage.text && (
                        <div className={`message-alert message-${actionMessage.type}`}>
                            {actionMessage.text}
                        </div>
                    )}

                    {/* Badge de estado actual */}
                    {estadoSolicitud && (
                        <div className={`solicitud-status-badge status-${estadoSolicitud.toLowerCase()}`}>
                            Estado: {estadoSolicitud}
                        </div>
                    )}

                    <div className="botones-modales-container">
                        <div className="boton-modal-opcion" onClick={() => setModalActivosOpen(true)}>
                            <div className="boton-modal-titulo">Activos Fijos</div>
                            <div className="boton-modal-icono">📦</div>
                        </div>
                        
                        <div className="boton-modal-opcion" onClick={() => setModalInsumosOpen(true)}>
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
                                No se han agregado artículos aún.<br/>Usa los botones de arriba para buscar en el inventario.
                            </p>
                        ) : (
                            <ul className="seleccionados-lista">
                                {articulosDespacho.map((art, index) => (
                                    <li key={index} className="seleccionados-item">
                                        <span>
                                            <strong className="seleccionados-item-cantidad">{art.cantidad}x</strong> {art.nombre} 
                                            <span className="seleccionados-item-tipo">({art.tipo})</span>
                                        </span>
                                        <button 
                                            type="button"
                                            onClick={() => removerArticulo(index)}
                                            className="seleccionados-btn-quitar"
                                            title="Quitar"
                                        >
                                            ✕
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <form onSubmit={handleGuardarResolucion} className="formulario-resolucion">
                        <label className="formulario-label">
                            Comentarios:
                        </label>
                        <textarea 
                            rows="2" 
                            placeholder="Ej: Se envían insumos desde bodega central..."
                            className="formulario-textarea"
                            required
                        ></textarea>
                        <button 
                            type="submit" 
                            className="resolver-btn formulario-btn-guardar" 
                        >
                            Guardar Resolución
                        </button>
                    </form>
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