import { useState, useEffect } from 'react';
import '@styles/AgregarItemModal.css';
import '@styles/SolicitarItemModal.css';
import { getUsers } from '../services/user.service.js';
import { getSedes } from '../services/clientes.service.js';

const SolicitarItemModal = ({ isOpen, onClose, onSubmit, item }) => {
  const [cantidad, setCantidad] = useState('');
  const [idAdministradorSolicitud, setIdAdministradorSolicitud] = useState('');
  const [detalleSolicitud, setDetalleSolicitud] = useState('');
  const [idSedeSolicitud, setIdSedeSolicitud] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [administradores, setAdministradores] = useState([]);
  const [sedes, setSedes] = useState([]);

  useEffect(() => {
    if (!isOpen) {
      setCantidad('');
      setIdAdministradorSolicitud('');
      setDetalleSolicitud('');
      setIdSedeSolicitud('');
      setMessage({ type: '', text: '' });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const cargarOpciones = async () => {
      setIsLoadingOptions(true);
      try {
        const [usuariosResponse, sedesResponse] = await Promise.all([
          getUsers(),
          getSedes()
        ]);

        if (!isMounted) return;

        const usuarios = Array.isArray(usuariosResponse)
          ? usuariosResponse
          : usuariosResponse?.data || usuariosResponse?.data?.data || [];

        const usuariosParaSeleccion = (Array.isArray(usuarios) ? usuarios : [])
                  .filter((usuario) => {
            const rolRaw = usuario?.rol;
            const rolNombre = typeof rolRaw === 'string'
              ? rolRaw
              : rolRaw?.nombre || rolRaw?.rol || rolRaw?.nombreRol || rolRaw?.role || usuario?.rolNombre || usuario?.nombreRol || '';
            const rolId = Number(
              rolRaw?.id ?? rolRaw?.rol_id ?? rolRaw?.role_id ?? usuario?.rol_id ?? usuario?.role_id ?? usuario?.rolId ?? 0
            );
            return String(rolNombre).trim().toLowerCase() === 'administrador' || rolId === 1;
          })
          .map((usuario) => ({
            id: usuario?.id,
            nombre: usuario?.nombreCompleto || usuario?.nombre || usuario?.email || `Usuario ${usuario?.id}`
          }))
          .filter((usuario) => usuario.id)
          .sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es', { sensitivity: 'base' }));

        setAdministradores(usuariosParaSeleccion);

        const sedesList = (Array.isArray(sedesResponse) ? sedesResponse : [])
          .map((sede) => ({
            id: sede?.sede_id ?? sede?.id,
            nombre: sede?.nombre_sede || sede?.nombre || sede?.name || `Sede ${sede?.sede_id ?? sede?.id}`
          }))
          .filter((sede) => sede.id)
          .sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es', { sensitivity: 'base' }));

        setSedes(sedesList);
      } catch (error) {
        console.error('Error cargando opciones del modal:', error);
        setAdministradores([]);
        setSedes([]);
      } finally {
        if (isMounted) setIsLoadingOptions(false);
      }
    };

    cargarOpciones();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cantidadNumerica = Number(cantidad);
    const idAdministradorNumerico = Number(idAdministradorSolicitud);
    const idSedeNumerica = Number(idSedeSolicitud);
    const detalleTrim = detalleSolicitud.trim();

    if (!Number.isInteger(cantidadNumerica) || cantidadNumerica <= 0) {
      setMessage({ type: 'error', text: 'Ingresa un número entero mayor a 0.' });
      return;
    }

    const disponibilidadActual = Number(item?.disponibilidadActual);
    if (Number.isFinite(disponibilidadActual) && cantidadNumerica > disponibilidadActual) {
      setMessage({
        type: 'error',
        text: `La cantidad solicitada supera la disponibilidad actual (${disponibilidadActual}).`
      });
      return;
    }

    if (!Number.isInteger(idAdministradorNumerico) || idAdministradorNumerico <= 0) {
      setMessage({ type: 'error', text: 'Ingresa un id de administrador válido.' });
      return;
    }

    if (!detalleTrim) {
      setMessage({ type: 'error', text: 'Ingresa un detalle para la solicitud.' });
      return;
    }

    if (!Number.isInteger(idSedeNumerica) || idSedeNumerica <= 0) {
      setMessage({ type: 'error', text: 'Ingresa un id de sede válido.' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await onSubmit({
        cantidad: cantidadNumerica,
        administrador: idAdministradorNumerico,
        detalle_solicitud: detalleTrim,
        sede: idSedeNumerica
      });

      if (result?.success) {
        setMessage({ type: 'success', text: result.message || 'Solicitud creada correctamente.' });
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setMessage({ type: 'error', text: result?.message || 'No se pudo crear la solicitud.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Error al crear la solicitud.' });
    } finally {
      setIsLoading(false);
    }
  };

  const disponibilidadActual = item?.disponibilidadActual;
  const cantidadExcedeDisponibilidad =
    Number.isFinite(Number(disponibilidadActual)) &&
    cantidad !== '' &&
    Number(cantidad) > Number(disponibilidadActual);

  return (
    <div className="modal-overlay">
      <div className="modal-content solicitar-modal">
        <button className="close-button" onClick={onClose}>×</button>

        <h3 className="solicitar-modal-title">Solicitar item</h3>
        <p className="solicitar-modal-subtitle">
          {item?.nombre ? `Item seleccionado: ${item.nombre}` : 'Selecciona un item para solicitar.'}
        </p>

        <form onSubmit={handleSubmit} className="solicitar-modal-form">
          <div className="solicitar-modal-field">
            <label htmlFor="cantidad-solicitud">Cantidad</label>
            <input
              id="cantidad-solicitud"
              className="solicitar-modal-input"
              type="number"
              min="1"
              step="1"
              max={disponibilidadActual ?? undefined}
              placeholder="Ingrese la cantidad"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              disabled={isLoading}
            />
            {disponibilidadActual != null && (
              <span className={`solicitar-modal-hint${cantidadExcedeDisponibilidad ? ' warning' : ''}`}>
                Disponibilidad actual: {disponibilidadActual}
              </span>
            )}
          </div>

          <div className="solicitar-modal-field">
            <label htmlFor="administrador-solicitud">Administrador</label>
            <select
              id="administrador-solicitud"
              className="solicitar-modal-input"
              value={idAdministradorSolicitud}
              onChange={(e) => setIdAdministradorSolicitud(e.target.value)}
              disabled={isLoading || isLoadingOptions}
            >
              <option value="">Seleccione un administrador</option>
              {administradores.map((administrador) => (
                <option key={administrador.id} value={administrador.id}>
                  {administrador.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="solicitar-modal-field">
            <label htmlFor="detalle-solicitud">Detalle de la solicitud</label>
            <textarea
              id="detalle-solicitud"
              className="solicitar-modal-input"
              rows="3"
              placeholder="Ingrese el detalle de la solicitud"
              value={detalleSolicitud}
              onChange={(e) => setDetalleSolicitud(e.target.value)}
              disabled={isLoading}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="solicitar-modal-field">
            <label htmlFor="sede-solicitud">Sede</label>
            <select
              id="sede-solicitud"
              className="solicitar-modal-input"
              value={idSedeSolicitud}
              onChange={(e) => setIdSedeSolicitud(e.target.value)}
              disabled={isLoading || isLoadingOptions}
            >
              <option value="">Seleccione una sede</option>
              {sedes.map((sede) => (
                <option key={sede.id} value={sede.id}>
                  {sede.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="solicitar-modal-actions">
            <button
              type="submit"
              className="btn-view-solicitud"
              disabled={isLoading || cantidadExcedeDisponibilidad}
            >
              {isLoading ? 'Creando...' : 'Aceptar'}
            </button>
            <button
              type="button"
              className="btn-view-solicitud btn-cancelar"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
          </div>
        </form>

        {message.text && (
          <div className={`message ${message.type}`} style={{ marginTop: '10px' }}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default SolicitarItemModal;
