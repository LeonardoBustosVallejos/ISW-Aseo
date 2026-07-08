import { useNavigate } from 'react-router-dom';
import { Table } from '@components/Tabla2'; 
import useSolicitudes from '@hooks/solicitudes/useGetSolicitudes.jsx';
import '../styles/solicitudes.css'; 

const Solicitudes = () => {
  const { solicitudes } = useSolicitudes();
  const navigate = useNavigate();

  const columns = [
    { title: 'ID', field: 'id_solicitud', width: 50, responsive: 0 },
    { title: 'Cantidad', field: 'cantidad_solicitud', width: 150, responsive: 0 },
    { title: 'Item', field: 'id_item_solicitud', width: 150, responsive: 0 },
    //{ title: 'Solicitante', field: 'id_solicitante', width: 35, responsive: 1 },
    //{ title: 'Administrador', field: 'id_administrador_solicitud', width: 35, responsive: 1 },
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
          data={solicitudes || []}
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
                    // 👇 Navegamos a la nueva ruta y le enviamos la fila completa en la mochila "state"
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