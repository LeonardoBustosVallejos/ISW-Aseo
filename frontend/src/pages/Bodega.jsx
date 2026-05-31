import Table from '@components/Table';
import useItems from '@hooks/items/useGetItems.jsx';

const Bodega = () => {
  const { items } = useItems();

  const columns = [
    { title: 'Nombre', field: 'nombre', width: 200, responsive: 0 },
    { title: 'Descripción', field: 'descripcion', width: 100, responsive: 1 },
    { title: 'Disponibles', field: 'disponibilidadActual', width: 100, responsive: 2 },
    { title: 'Totales', field: 'disponibilidadTotal', width: 100, responsive: 2 }
  ];

  return (
    <div className='main-container'>
      <div className='table-container'>
        <div className='top-table'>
          <h1 className='title-table'>Items</h1>
        </div>
        <Table
          data={items}
          columns={columns}
          initialSortName='nombre'
        />
      </div>
    </div>
  );
};

export default Bodega