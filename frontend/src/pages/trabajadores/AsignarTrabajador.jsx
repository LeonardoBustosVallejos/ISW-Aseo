import { useTrabajadores } from "@hooks/trabajadores/useTrabajadores.js";
import { useDetalleTrabajador } from "@hooks/trabajadores/useDetalleTrabajadores.js"
import Search from "@components/Search.jsx";
import Table from "@components/Table.jsx";
import { showErrorAlert } from "@helpers/sweetAlert.js";
import "@styles/asignarTrabajador.css";
import { useState } from "react";

export default function Trabajadores() {

  const { trabajadores, loading, error, success } = useTrabajadores(); // Necesario para el getTrabajadores
  const [selectedId, setSelectedId] = useState(null); // Se guarda el ID del trabajador seleccionado
  const { detalle, loadingDetalle, errorDetalle } = useDetalleTrabajador(selectedId); // Necesario para el getTrabajador por ID

  return (
    <div className="contenido-asignacion">
      <h2>Trabajadores</h2>

      {loading && <p>Cargando trabajadores...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <div className="columnas-layout">
        <section className="columna-lista-trabajadores">
          <ul className="lista-trabajadores">
            {trabajadores.map((trabajadores) => (
              <li key={trabajadores.id}
              className={`tarjeta-trabajador ${selectedId === trabajadores.id ? 'seleccionado' : ''}`}
              onClick={() => setSelectedId(trabajadores.id)}
              >
                <p>{trabajadores.nombreCompleto}</p>
                <p>{trabajadores.rut}</p>
                <p>{trabajadores.rol}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="columna-detalle">
          {loadingDetalle && <p>Buscando datos en el servidor...</p>}
          {errorDetalle && <p className="error-msg">{errorDetalle}</p>}

          {!loadingDetalle && detalle ? (
            <div className="ficha-trabajador">
              <p>Nombre: {detalle.nombreCompleto}</p>
              <p>Rol: {detalle.rol}</p>
              <p>Rut: {detalle.rut}</p>
            
              <div className="campo-editable">
                <label>Grupo asignado:</label>
                <input type="text" defaultValue={detalle.grupo || "Sin Grupo"}/>
              </div>

              <div className="campo-editable">
                <label>Antecedentes</label>
                <textarea defaultValue={detalle.antecedentes || ""} />
              </div>
            

            {detalle.historialDesvinculaciones && (
              <div className="historial.box">
              <h4>Historial Desvinculaciones:</h4>
              {detalle.historialDesvinculaciones.length === 0 ? (
                <p>Sin despidos registrados</p>
              ) : (
                <ul>
                  {detalle.historialDesvinculaciones.map((h, idx) => (
                    <li key={idx}> Motivo: {h.motivo} - Fecha: {h.fecha}</li>
                  ))}
                </ul>
              )}
              </div>
            )}
          </div>
          ): (
            !loadingDetalle && <p className="sin-seleccion">Haz clic en un trabajador para ver los detalles</p>
          )}
        </section>
      </div>
    </div>
  );
}