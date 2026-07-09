import { Table } from '@components/Tabla2';
import useItems from '@hooks/items/useGetItems.jsx';
import useEditItems from '@hooks/items/useEditItems';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import ItemModal from './AgregarItemModal.jsx';
import SolicitarItemModal from './SolicitarItemModal.jsx';
import Popup from '../components/Popup';
import { deleteItem, createItem } from '@services/item.service.js';
import { createSolicitud } from '@services/solicitud.service.js';
import { deleteDataAlert, showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';
import '../styles/solicitudes.css';
import '../styles/bodega.css';
//por los loles

const Bodega = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, fetchItems, setItems } = useItems();
  const [AgregarItemOpen, setAgregarItemOpen] = useState(false);
  const [isSolicitarModalOpen, setIsSolicitarModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchByName, setSearchByName] = useState('');
  const [searchByCode, setSearchByCode] = useState('');

  //tabla que muestra los datos de los items que existen en bodega
  const columns = [
    { field: 'id', header: 'ID' },
    { field: 'nombre', header: 'Nombre' },
    { field: 'codigo', header: 'Código' },
    { field: 'tipo', header: 'Tipo' },
    {
      field: 'disponibilidadActual',
      header: 'Disponibles',
      render: (_, row) => `${row?.disponibilidadActual ?? ''}/${row?.disponibilidadTotal ?? ''}`,
    },
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

  const handleCreateSolicitud = async ({ cantidad, administrador, detalle_solicitud, sede }) => {
    if (!selectedItem?.id) {
      return {
        success: false,
        message: 'Selecciona un item antes de solicitar.'
      };
    }

    if (!user?.id) {
      return {
        success: false,
        message: 'No se encontró el usuario autenticado para la solicitud.'
      };
    }

    try {
      const result = await createSolicitud({
        cantidad_solicitud: Number(cantidad),
        id_item_solicitud: Number(selectedItem.id),
        id_solicitante: Number(user.id),
        id_administrador_solicitud: Number(administrador),
        id_sede_solicitud: Number(sede),
        detalle_solicitud,
        estado_solicitud: 'Pendiente'
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
        <div className='bodega-toolbar'>
          <div className='bodega-actions-group'>
            <button className='btn-view-solicitud' onClick={() => setAgregarItemOpen(true)}>
              Agregar Item
            </button>
            <button className='btn-view-solicitud btn-danger' onClick={() => handleDeleteItem()}>
              Borrar Item
            </button>
          </div>
          <div className='bodega-search-group'>
            <input
              className='bodega-search-input'
              type='text'
              value={searchByName}
              onChange={(e) => setSearchByName(e.target.value)}
              placeholder='Buscar por nombre'
            />
            <input
              className='bodega-search-input'
              type='text'
              value={searchByCode}
              onChange={(e) => setSearchByCode(e.target.value)}
              placeholder='Buscar por código'
            />
          </div>
        </div>
        <Table
          title='Inventario de Bodega'
          data={filteredItems}
          columns={columns}
          rowKey='id'
          emptyMessage='No hay items registrados.'
          actions={(row) => (
            <div className='bodega-row-actions'>
              <button
                className='btn-view-solicitud'
                onClick={() => {
                  setSelectedItem(row);
                  setIsSolicitarModalOpen(true);
                }}
              >
                Solicitar
              </button>
              <button
                className='btn-view-solicitud'
                onClick={() => {
                  setSelectedItem(row);
                  if (row?.id) {
                    navigate(`/item/${row.id}`);
                  }
                }}
              >
                Ver
              </button>
            </div>
          )}
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

export default Bodega;