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
    <div className="modal-content">
      <button className="close-button" onClick={onClose}>×</button>
      
      {/* SECCIÓN CREAR TEMA (sin caja) */}
      <h3>Crear Nuevo Item</h3>
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
        style={{ margin: 0, padding: 0 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {
                /*puede q tga q cambiar ls htmls por ls d mi ruta
                también puede que tenga que cambiar el nombre de las ids d los inputs*/

            }
          <label htmlFor="create-item">Info</label>
          <input
            id="create-item"
            type="text"
            name="nombre"
            placeholder="Ingrese el nombre del item"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            disabled={isLoading}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <input
            id="create-item6"
            type="text"
            name="codigo"
            placeholder="Ingrese el codigo del item"
            value={itemCode}
            onChange={(e) => setItemCode(e.target.value)}
            disabled={isLoading}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <input
            id="create-item2"
            type="text"
            name="tipo"
            placeholder="Ingrese el tipo del item"
            value={itemType}
            onChange={(e) => setItemType(e.target.value)}
            disabled={isLoading}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <input
            id="create-item3"
            type="text"
            name="description"
            placeholder="Ingrese la descripción del item"
            value={itemDesc}
            onChange={(e) => setItemDesc(e.target.value)}
            disabled={isLoading}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <input
            id="create-item4"
            type="text"
            name="disponibilidad actual"
            placeholder="Ingrese la cantidad de items disponibles actualmente"
            value={itemDisCu}
            onChange={(e) => setItemDisCu(e.target.value)}
            disabled={isLoading}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <input
            id="create-item5"
            type="text"
            name="disponibilidad total"
            placeholder="Ingrese la cantidad de items totales actualmente"
            value={itemDisTo}
            onChange={(e) => setItemDisTo(e.target.value)}
            disabled={isLoading}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || (itemName || '').trim().length < 3}
            >
              {isLoading ? 'Creando...' : 'Crear item'}
            </button>
          </div>
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