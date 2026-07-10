import { useState } from 'react';
//import '@styles/form.css';
import '@styles/AgregarItemModal.css'; 

const ItemModal = ({ isOpen, onClose, onSubmit, onDelete, itemList = [] }) => {
  if (!isOpen) return null;
  
  // atributos de un item
  const [itemName, setItemName] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [itemType, setItemType] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemDisCu, setItemDisCu] = useState('');
  const [itemDisTo, setItemDisTo] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [itemToDelete, setItemToDelete] = useState('');

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const result = await onSubmit(formData);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setTimeout(() => {
          setItemName(formData.nombre);
          setItemCode(formData.codigo);
          setItemType(formData.tipo);
          setItemDesc(formData.descripcion);
          setItemDisCu(formData.disponibilidadActual);
          setItemDisTo(formData.disponibilidadTotal);
          onClose();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Error al crear item' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!itemToDelete.trim()) {
      setMessage({ type: 'error', text: 'Ingresa un nombre de item para borrar' });
      return;
    }
    
    setIsLoading(true);
    const result = await onDelete(itemToDelete);
    setIsLoading(false);
    
    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setItemToDelete('');
      setTimeout(() => onClose(), 2000);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  return (
  <div className="modal-overlay">
    <div className="modal-content form-card form-content">
      <button className="close-button" onClick={onClose}>×</button>
      
      <div className="form-header">
        <div>
          <h1 className="form-title">Crear Nuevo Item</h1>
        </div>
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await handleSubmit({
            nombre: itemName.trim(),
            codigo: itemCode.trim(),
            tipo: itemType.trim(),
            descripcion: itemDesc.trim(),
            disponibilidadActual: itemDisCu.trim(),
            disponibilidadTotal: itemDisTo.trim()
          });
        }}
      >
        <div className="form-grid">
          <div className="form-group">
            <label className="label" htmlFor="create-item">Nombre</label>
            <input
              id="create-item"
              className="input"
              type="text"
              name="nombre"
              placeholder="Ingrese el nombre del item"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="create-item6">Código</label>
            <input
              id="create-item6"
              className="input"
              type="text"
              name="codigo"
              placeholder="Ingrese el código del item"
              value={itemCode}
              onChange={(e) => setItemCode(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="create-item2">Tipo</label>
            <input
              id="create-item2"
              className="input"
              type="text"
              name="tipo"
              placeholder="Ingrese el tipo del item"
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="create-item3">Descripción</label>
            <input
              id="create-item3"
              className="input"
              type="text"
              name="description"
              placeholder="Ingrese la descripción del item"
              value={itemDesc}
              onChange={(e) => setItemDesc(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="create-item4">Disponibilidad Actual</label>
            <input
              id="create-item4"
              className="input"
              type="text"
              name="disponibilidad actual"
              placeholder="Ingrese la cantidad de items disponibles actualmente"
              value={itemDisCu}
              onChange={(e) => setItemDisCu(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="create-item5">Disponibilidad Total</label>
            <input
              id="create-item5"
              className="input"
              type="text"
              name="disponibilidad total"
              placeholder="Ingrese la cantidad de items totales actualmente"
              value={itemDisTo}
              onChange={(e) => setItemDisTo(e.target.value)}
              disabled={isLoading}
            />
          </div>

        </div>

        <div className="action-buttons" style={{ marginTop: 8 }}>
          <button
            type="submit"
            className="submit-button"
            disabled={isLoading || (itemName || '').trim().length < 3}
          >
            {isLoading ? 'Creando...' : 'Crear item'}
          </button>
        </div>
      </form>
      <hr />
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  </div>
);
};

export default ItemModal;