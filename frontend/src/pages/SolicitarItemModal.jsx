import { useState, useEffect } from 'react';
import '@styles/AgregarItemModal.css';
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

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>

        <h3>Solicitar item</h3>
        <p style={{ marginTop: 0, marginBottom: '12px' }}>
          {item?.nombre ? `Item seleccionado: ${item.nombre}` : 'Selecciona un item para solicitar.'}
        </p>

        <form onSubmit={handleSubmit} style={{ margin: 0, padding: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="cantidad-solicitud">Cantidad</label>
            <input
              id="cantidad-solicitud"
              type="number"
              min="1"
              step="1"
              placeholder="Ingrese la cantidad"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              disabled={isLoading}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />

            <label htmlFor="administrador-solicitud">Administrador</label>
            <select
              id="administrador-solicitud"
              value={idAdministradorSolicitud}
              onChange={(e) => setIdAdministradorSolicitud(e.target.value)}
              disabled={isLoading || isLoadingOptions}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              <option value="">Seleccione un administrador</option>
              {administradores.map((administrador) => (
                <option key={administrador.id} value={administrador.id}>
                  {administrador.nombre}
                </option>
              ))}
            </select>

            <label htmlFor="detalle-solicitud">Detalle de la solicitud</label>
            <textarea
              id="detalle-solicitud"
              rows="3"
              placeholder="Ingrese el detalle de la solicitud"
              value={detalleSolicitud}
              onChange={(e) => setDetalleSolicitud(e.target.value)}
              disabled={isLoading}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical' }}
            />

            <label htmlFor="sede-solicitud">Sede</label>
            <select
              id="sede-solicitud"
              value={idSedeSolicitud}
              onChange={(e) => setIdSedeSolicitud(e.target.value)}
              disabled={isLoading || isLoadingOptions}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              <option value="">Seleccione una sede</option>
              {sedes.map((sede) => (
                <option key={sede.id} value={sede.id}>
                  {sede.nombre}
                </option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Creando...' : 'Aceptar'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
                Cancelar
              </button>
            </div>
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
