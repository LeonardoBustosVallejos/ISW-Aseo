import Table from '@components/Table';
import useSolicitudes from '@hooks/solicitudes/useGetSolicitudes.jsx';

const Solicitudes = () => {
  const { solicitudes } = useSolicitudes();

  const columns = [
    { title: 'ID', field: 'id_solicitud', width: 35, responsive: 0 },
    { title: 'Cantidad', field: 'cantidad_solicitud', width: 35, responsive: 0 },
    { title: 'Item', field: 'id_item_solicitud', width: 35, responsive: 0 },
    { title: 'Solicitante', field: 'id_solicitante', width: 35, responsive: 1 },
    { title: 'Administrador', field: 'id_administrador_solicitud', width: 35, responsive: 1 },
    { title: 'Sede', field: 'id_sede_solicitud', width: 120, responsive: 1 },
    { title: 'Detalle', field: 'detalle_solicitud', width: 180, responsive: 2 },
    { title: 'Estado', field: 'estado_solicitud', width: 120, responsive: 2 }
  ];

  return (
    <div className='main-container'>
      <div className='table-container'>
        <div className='top-table'>
          <h1 className='title-table'>Solicitudes</h1>
        </div>
        <Table
          data={solicitudes}
          columns={columns}
          initialSortName='id_solicitud'
        />
      </div>
    </div>
  );
};

export default Solicitudes;
