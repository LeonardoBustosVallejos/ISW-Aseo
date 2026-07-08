import Table from '@components/Table';
import useItems from '@hooks/items/useGetItems.jsx';
import useEditItems from '@hooks/items/useEditItems';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ItemModal from './AgregarItemModal.jsx';
import SolicitarItemModal from './SolicitarItemModal.jsx';
import Popup from '../components/Popup';
import { deleteItem, createItem } from '@services/item.service.js';
import { createSolicitud } from '@services/solicitud.service.js';
import { deleteDataAlert, showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';


const Bodega = () => {
  const navigate = useNavigate();
  const { items, fetchItems, setItems } = useItems();
  const [AgregarItemOpen, setAgregarItemOpen] = useState(false);
  const [isSolicitarModalOpen, setIsSolicitarModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchByName, setSearchByName] = useState('');
  const [searchByCode, setSearchByCode] = useState('');

  //tabla que muestra los datos de los items que existen en bodega
  const columns = [
    { title: 'ID', field: 'id', width: 50, responsive: 0 },
    { title: 'Nombre', field: 'nombre', width: 150, responsive: 0 },
    { title : 'Codigo', field: 'codigo', width: 100, responsive: 0 },
    { title: 'Tipo', field: 'tipo', width: 70, responsive: 0 },
    //{ title: 'Descripción', field: 'descripcion', width: 70, responsive: 1 },
    { title: 'Disponibles', field: 'disponibilidadActual', width: 70, responsive: 2 },
    { title: 'Totales', field: 'disponibilidadTotal', width: 70, responsive: 2 },
    {
      title: 'Solicitar',
      hozAlign: 'center',
      headerSort: false,
      formatter: function(cell, formatterParams, onRendered) {
        const btn = document.createElement('button');
        btn.textContent = 'Solicitar';
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          const rowData = cell.getData();
          try {
            // mark selection in React state for parent component
            setSelectedItem(rowData);
            setIsSolicitarModalOpen(true);
          } catch (err) {
            // fallback: log if state setter is not available in this scope
            // (shouldn't happen because setSelectedItem is in component scope)
            // eslint-disable-next-line no-console
            console.log('Solicitar clicked', rowData);
          }
        });
        return btn;
      }
    },
    {
      title: 'Ver',
      hozAlign: 'center',
      headerSort: false,
      formatter: function(cell, formatterParams, onRendered) {
        const btn = document.createElement('button');
        btn.textContent = 'Ver';
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          const rowData = cell.getData();
          try {
            setSelectedItem(rowData);
            if (rowData?.id) {
              navigate(`/item/${rowData.id}`);
            }
          } catch (err) {
            // eslint-disable-next-line no-console
            console.log('Ver clicked', rowData, err);
          }
        });
        return btn;
      }
    }
    
  ];
  

  {/* esto servía en otro proyecto para recuperar usuarios con cierto tema. no creo q sea util aqui
  useEffect(() => {
    fetchUsersWithSubjects();
    loadAllSubjects();
  }, []);*/}

  //puede que tenga q pasarle más parámetrso que el itemInfo pq son muchos atributos
  const handleAddItem = async (itemInfo) => {
    try {
      const result = await createItem({
        nombre: itemInfo.nombre,
        codigo: itemInfo.codigo,
        tipo: itemInfo.tipo,
        descripcion: itemInfo.descripcion,
        disponibilidadActual: itemInfo.disponibilidadActual,
        disponibilidadTotal: itemInfo.disponibilidadTotal
      });

      if (result?.success === false) {
        return {
          success: false,
          message: result.message || 'Error al crear item'
        };
      }

      return {
        success: true,
        message: result.message || 'Item creado exitósamente',
        data: result.data || result
      };
    } catch (error) {
      console.error('Error creando item', error);
      return {
        success: false,
        message: error.message || 'Error al crear item'
      };
    }
  };

  const {
    handleClickUpdate,
    handleUpdate,
    isPopupOpen,
    setIsPopupOpen,
    dataItems,
    setDataItems
  } = useEditItems(setItems);

  const handleCreateSolicitud = async (cantidad) => {
    if (!selectedItem?.id) {
      return {
        success: false,
        message: 'Selecciona un item antes de solicitar.'
      };
    }

    try {
      const result = await createSolicitud({
        cantidad_solicitud: Number(cantidad),
        id_item_solicitud: Number(selectedItem.id),
        id_solicitante: 0,
        id_administrador_solicitud: 0,
        id_sede_solicitud: 0,
        detalle_solicitud: '0',
        estado_solicitud: '0'
      });

      if (result?.success === false) {
        return {
          success: false,
          message: result.message || 'No se pudo crear la solicitud.'
        };
      }

      showSuccessAlert('Solicitud creada', 'La solicitud se creó correctamente.');
      setIsSolicitarModalOpen(false);
      setSelectedItem(null);
      return {
        success: true,
        message: result.message || 'Solicitud creada correctamente.'
      };
    } catch (error) {
      console.error('Error creando solicitud', error);
      return {
        success: false,
        message: error.message || 'Error al crear la solicitud'
      };
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem || !selectedItem.id) {
      showErrorAlert('Selección requerida', 'Selecciona primero un item antes de borrar.');
      return;
    }

    const result = await deleteDataAlert();
    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await deleteItem(selectedItem.id);
      if (!response || response.success === false) {
        showErrorAlert('Error', response?.message || 'No se pudo borrar el item');
        return;
      }

      showSuccessAlert('¡Eliminado!', 'El item ha sido eliminado correctamente.');
      setItems((prevItems) => prevItems.filter((item) => item.id !== selectedItem.id));
      setSelectedItem(null);
      setDataItems([]);
      await fetchItems();
    } catch (error) {
      console.error('Error al borrar item:', error);
      showErrorAlert('Error', error.message || 'Ocurrió un error al borrar el item');
    }
  }

  const handleSelectionChange = useCallback((selectedItems) => {
    const item = selectedItems && selectedItems.length > 0 ? selectedItems[0] : null;
    setSelectedItem(item);
    setDataItems(selectedItems);
  }, [setDataItems]);

  const filteredItems = items.filter((item) => {
    const name = item?.nombre?.toLowerCase?.() ?? '';
    const code = item?.codigo?.toString().toLowerCase() ?? '';
    const normalizedName = searchByName.trim().toLowerCase();
    const normalizedCode = searchByCode.trim().toLowerCase();

    const matchesName = !normalizedName || name.includes(normalizedName);
    const matchesCode = !normalizedCode || code.includes(normalizedCode);

    return matchesName && matchesCode;
  });

  return (
    <div className='main-container'>     
      <div className='table-container'>       
        <div className='top-table'>         
          <h1 className='title-table'>Items</h1>
        </div>
        {/*botón para abrir un modal que agregue items al inventario*/}
        <button onClick={() => setAgregarItemOpen(true)}>
          Agregar Item
        </button>
        <button onClick= {() => handleDeleteItem() }>
          Borrar Item
        </button>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '12px 0' }}>
          <input
            type='text'
            value={searchByName}
            onChange={(e) => setSearchByName(e.target.value)}
            placeholder='Buscar por nombre'
            style={{ minWidth: '220px', padding: '8px 10px' }}
          />
          <input
            type='text'
            value={searchByCode}
            onChange={(e) => setSearchByCode(e.target.value)}
            placeholder='Buscar por código'
            style={{ minWidth: '220px', padding: '8px 10px' }}
          />
        </div>
        <Table
          data={filteredItems}
          columns={columns}
          initialSortName='id'
          //onSelectionChange={handleSelectionChange}
        />
      </div>
      {/*puede q acá esté mi problema, pues la data con la q trabajo no son users */}
      <Popup show={isPopupOpen} setShow={setIsPopupOpen} data={dataItems} action={handleUpdate} />
      <ItemModal 
        isOpen={AgregarItemOpen}
        onClose={()=>setAgregarItemOpen(false)}
        onSubmit={handleAddItem}
      />
      <SolicitarItemModal
        isOpen={isSolicitarModalOpen}
        onClose={() => {
          setIsSolicitarModalOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onSubmit={handleCreateSolicitud}
      />
      <h1></h1>
    </div>
  );
};

export default Bodega