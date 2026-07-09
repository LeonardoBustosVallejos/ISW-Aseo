import Table from '@components/Table';
import { useAuth } from '@context/AuthContext';
import useSolicitudes from '@hooks/solicitudes/useGetSolicitudes.jsx';

const Solicitudes = () => {
  const { user } = useAuth();
  const { solicitudes } = useSolicitudes();

  const rolRaw = user?.rol;
  const userRole = typeof rolRaw === 'string'
    ? rolRaw
    : rolRaw?.nombre || rolRaw?.rol || rolRaw?.nombreRol || rolRaw?.role || '';
  const roleId = Number(rolRaw?.id || rolRaw?.rol_id || rolRaw?.role_id || rolRaw);
  const lowerRole = String(userRole).toLowerCase();
  const isAdministrador = lowerRole === 'administrador' || roleId === 1;
  const isSupervisor = lowerRole === 'supervisor' || roleId === 2;

  const solicitudesFiltradas = isAdministrador
    ? solicitudes.filter((solicitud) => String(solicitud.id_administrador_solicitud) === String(user?.id))
    : isSupervisor
      ? solicitudes.filter((solicitud) => String(solicitud.id_solicitante) === String(user?.id))
      : solicitudes;

  console.log(
    'user:', user,
    'id usuario:', user?.id,
    'rol raw:', rolRaw,
    'rol normalizado:', userRole,
    'rol id:', roleId,
    'isAdministrador:', isAdministrador,
    'isSupervisor:', isSupervisor,
    'ids admin solicitudes:', solicitudes.map((s) => s.id_administrador_solicitud),
    'ids solicitantes:', solicitudes.map((s) => s.id_solicitante),
    'solicitudes totales:', solicitudes.length,
    'filtradas:', solicitudesFiltradas.length
  );

  const columns = [
    { title: 'ID', field: 'id_solicitud', width: 50, responsive: 0 },
    { title: 'Cantidad', field: 'cantidad_solicitud', width: 175, responsive: 0 },
    { title: 'Item', field: 'id_item_solicitud', width: 150, responsive: 0 },
    //{ title: 'Solicitante', field: 'id_solicitante', width: 35, responsive: 1 },
    { title: 'Administrador', field: 'id_administrador_solicitud', width: 75, responsive: 1 },
    //{ title: 'Sede', field: 'id_sede_solicitud', width: 100, responsive: 1 },
    //{ title: 'Detalle', field: 'detalle_solicitud', width: 120, responsive: 2 },
    { title: 'Estado', field: 'estado_solicitud', width: 100, responsive: 2 },
    {
      title: 'Ver',
      hozAlign: 'center',
      formatter: function (cell, formatterParams, onRendered) {
        return "<button class='btn-view-solicitud' style='padding:6px 10px;border-radius:6px;border:0;background:#2563eb;color:#fff;cursor:pointer'>Ver</button>";
      },
      cellClick: function (e, cell) {
        const rowData = cell.getRow().getData();
        const id = rowData?.id_solicitud ?? rowData?.id;
        if (id) {
          window.location.href = `/solicitud/${id}`;
        }
      },
      width: 90,
      responsive: 0,
    },
  ];

  return (
    <div className='main-container'>
      <div className='table-container'>
        <div className='top-table'>
          <h1 className='title-table'>Solicitudes</h1>
        </div>
        <Table
          data={solicitudesFiltradas}
          columns={columns}
          initialSortName='id_solicitud'
        />
      </div>
    </div>
  );
};

export default Solicitudes;
