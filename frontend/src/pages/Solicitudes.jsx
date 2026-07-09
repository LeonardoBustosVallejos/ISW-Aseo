import { useNavigate } from 'react-router-dom';
import { Table } from '@components/Tabla2'; 
import { useAuth } from '@context/AuthContext';
import useSolicitudes from '@hooks/solicitudes/useGetSolicitudes.jsx';
import '../styles/solicitudes.css'; 

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
  const navigate = useNavigate();
  const columns = [
    { header: 'RUT Cliente', field: 'rut_cliente' },
    { header: 'Nombre Cliente', field: 'nombre_cliente' },
    { header: 'Ubicación Sede', field: 'ubicacion' },
    { header: 'Tipo', field: 'tipo_solicitud', render: () => "Recepción Pendiente" }, 
    { header: 'Estado', field: 'estado_solicitud' },
  ];

  const renderDetallesSolicitud = (row) => {
    return (
      <div className="solicitudes-expanded-container">
        <div className="solicitud-card">
          <h4 className="solicitud-card-title">Detalles Técnicos</h4>
          <p className="solicitud-card-text"><strong>ID Solicitud:</strong> {row.id_solicitud}</p>
          <p className="solicitud-card-text"><strong>ID Solicitante:</strong> {row.id_solicitante}</p>
          <p className="solicitud-card-text"><strong>ID Item:</strong> {row.id_item_solicitud}</p>
          <p className="solicitud-card-text"><strong>Cantidad:</strong> {row.cantidad_solicitud}</p>
        </div>
        <div className="solicitud-card">
          <h4 className="solicitud-card-title">Mensaje / Descripción</h4>
          <p className="solicitud-card-desc">
            {row.detalle_solicitud || "No hay detalles adicionales para esta solicitud."}
          </p>
        </div>
      </div>
    );
  };
  return (
    <div className='main-container'>
      <div className='table-container'>
        <Table
          title="Solicitudes Pendientes"
          data={solicitudesFiltradas || []}
          columns={columns}
          rowKey="id_solicitud"
          emptyMessage="No hay solicitudes registradas."
          renderExpanded={renderDetallesSolicitud}
          
          actions={(row) => {
            const id = row?.id_solicitud ?? row?.id;
            return (
              <button 
                className='btn-view-solicitud' 
                onClick={() => {
                  if (id) {
                    navigate(`/solicitud/${id}`, { state: { datosSolicitud: row } });
                  }
                }}
              >
                Resolver
              </button>
            );
          }}
        />
      </div>
    </div>
  );
};

export default Solicitudes;