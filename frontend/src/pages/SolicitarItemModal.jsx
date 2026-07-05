import { useState, useEffect } from 'react';
import '@styles/AgregarItemModal.css';

const SolicitarItemModal = ({ isOpen, onClose, onSubmit, item }) => {
  const [cantidad, setCantidad] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!isOpen) {
      setCantidad('');
      setMessage({ type: '', text: '' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cantidadNumerica = Number(cantidad);

    if (!Number.isInteger(cantidadNumerica) || cantidadNumerica <= 0) {
      setMessage({ type: 'error', text: 'Ingresa un número entero mayor a 0.' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await onSubmit(cantidadNumerica);

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
