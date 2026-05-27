import Table from '@components/Table';
import useItems from '@hooks/items/useGetItems.jsx';
import useEditItems from '@hooks/items/useEditItems';
import useUsers from '@hooks/users/useGetUsers.jsx';
import { useCallback, useState, useEffect } from 'react';
import ItemModal from './AgregarItemModal.jsx';
import Popup from '../components/Popup';


const Bodega = () => {
  const { items, fetchItems, setItems } = useItems();
  const [AgregarItemOpen, setAgregarItemOpen] = useState(false);
  const token = localStorage.getItem('token');

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }

  //tabla que muestra los datos de los items que existen en bodega
  const columns = [
    { title: 'ID', field: 'id', width: 50, responsive: 0 },
    { title: 'Nombre', field: 'nombre', width: 120, responsive: 0 },
    { title : 'Codigo', field: 'codigo', width: 70, responsive: 0 },
    { title: 'Tipo', field: 'tipo', width: 120, responsive: 0 },
    { title: 'Descripción', field: 'descripcion', width: 100, responsive: 1 },
    { title: 'Disponibles', field: 'disponibilidadActual', width: 100, responsive: 2 },
    { title: 'Totales', field: 'disponibilidadTotal', width: 100, responsive: 2 }
  ];

  {/* esto servía en otro proyecto para recuperar usuarios con cierto tema. no creo q sea util aqui
  useEffect(() => {
    fetchUsersWithSubjects();
    loadAllSubjects();
  }, []);*/}

  //puede que tenga q pasarle más parámetrso que el itemInfo pq son muchos atributos
  const handleAddItem = async ( itemInfo ) => {
    try {
      //esta validación podría ser problemática
      /*if (!itemInfo || itemInfo.trim() === ''){
        throw new Error ('Complete el formulario porfavor');
      }*/
      //obtenemos l token (puede que este lo tga q borrar)
      const token = sessionStorage.getItem('token');
      /*if (!token) {
        throw new Error('No hay sesión activa, por lo que no se puede operar desde el FE');
      }*/
      //configuramos la petición a la ruta del BE
      const response = await fetch ('http://localhost:3000/api/item/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ //puede q tga q cambiar estos d abajo ya q no se si trim bastará para cortarlos a todos
          nombre: itemInfo.nombre,
          codigo: itemInfo.codigo,
          tipo: itemInfo.tipo,
          descripcion: itemInfo.descripcion,
          disponibilidadActual: itemInfo.disponibilidadActual,
          disponibilidadTotal: itemInfo.disponibilidadTotal
        })
      });
      //manejamos la respuesta
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Error ${response.status}: ${response.statusText}`
        );
      }
      const result = await response.json();
      //devolvemos los datos para manejar el comopnente padre si hay exito
      return {
        success: true,
        message: 'Item creado exitósamente',
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

  //puede q aquí esté mi problema. dsp d todo no trabajo con users
  const {
    handleClickUpdate,
    handleUpdate,
    isPopupOpen,
    setIsPopupOpen,
    dataItems,
    setDataItems
  } = useEditItems(setItems);
  
    const handleSelectionChange = useCallback((selectedItems) => {
    setDataItems(selectedItems);
  }, [setDataItems]);

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
        <Table
          data={items}
          columns={columns}
          initialSortName='id'
        />
      </div>
      {/*puede q acá esté mi problema, pues la data con la q trabajo no son users */}
      <Popup show={isPopupOpen} setShow={setIsPopupOpen} data={dataItems} action={handleUpdate} />
      <ItemModal 
        isOpen={AgregarItemOpen}
        onClose={()=>setAgregarItemOpen(false)}
        onSubmit={handleAddItem}
      />
    </div>
  );
};

export default Bodega