import { useTrabajadores } from "@hooks/trabajadores/useTrabajadores.js";
import { useDetalleTrabajador } from "@hooks/trabajadores/useDetalleTrabajadores.js"
import Search from "@components/Search.jsx";
import Table from "@components/Table.jsx";
import { showErrorAlert } from "@helpers/sweetAlert.js";
import "@styles/asignarTrabajador.css";
import { useState } from "react";

export default function Trabajadores() {

  const { trabajadores, 
          loading, 
          error, 
          success,
          pagina,
          setPagina,
          infoPaginacion } = useTrabajadores(); 

  const [selectedId, 
        setSelectedId] = useState(null); 

  const { detalle, 
          loadingDetalle, 
          errorDetalle } = useDetalleTrabajador(selectedId); 

  return (
    <div className="contenido-asignacion">
      <h2>Trabajadores</h2>

      {loading && <p>Cargando trabajadores...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <div className="columnas-layout">
        <section className="columna-lista-trabajadores">
          <ul className="lista-trabajadores">
            {trabajadores.map((trabajador) => (
              <li key={trabajador.id}
              className={`tarjeta-trabajador ${selectedId === trabajador.id ? "seleccionado" : ""}`}
              onClick={() => setSelectedId(trabajador.id)}
              >
                <p>{`${trabajador.apellidoPaterno} ${trabajador.apellidoMaterno} ${trabajador.nombres} `}</p>
                <p>{trabajador.rut}</p>
                <p>{trabajador.rol.nombre}</p>
              </li>
            ))}
          </ul>

<div className="paginacion-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px", padding: "10px" }}>
            <button 
              onClick={() => setPagina(p => Math.max(p - 1, 1))} 
              disabled={pagina === 1 || loading}
              className="btn-paginacion"
            >
              Anterior
            </button>
            
            <span>Página {infoPaginacion.currentPage} de {infoPaginacion.totalPages}</span>
            
            <button 
              onClick={() => setPagina(p => Math.min(p + 1, infoPaginacion.totalPages))} 
              disabled={pagina === infoPaginacion.totalPages || loading}
              className="btn-paginacion"
            >
              Siguiente
            </button>
          </div>
        </section>

        <section className="columna-detalle">
          {loadingDetalle && <p>Buscando datos en el servidor...</p>}
          {errorDetalle && <p className="error-msg">{errorDetalle}</p>}

          {!loadingDetalle && detalle ? (
            <div className="ficha-trabajador">
              <div className="contenedor-foto-perfil" 
                    style={{ 
                            textAlign: "center", 
                            marginBottom: "15px" }}>

                {detalle.foto_url ? (
                  <img 
                    src={detalle.foto_url} 
                    alt={`Foto de ${detalle.nombreCompleto}`} 
                    style={{ 
                            width: "120px", 
                            height: "120px", 
                            borderRadius: "10%", 
                            objectFit: "cover", 
                            display: "inline-flex", 
                            alignItems: "center", 
                            justifyContent: "center", 
                            border: "2px solid #ccc" }}
                  />
                ) : (
                  <div style={{ 
                            width: "120px", 
                            height: "120px", 
                            borderRadius: "10%", 
                            backgroundColor: "#eee", 
                            display: "inline-flex", 
                            alignItems: "center", 
                            justifyContent: "center", 
                            color: "#666" }}>
                    Sin Foto
                  </div>
                )}
            </div>
              <p>Nombre: {detalle.nombreCompleto}</p>
              <p>Rut: {detalle.rut}</p>
              <p>Edad: {detalle.edad}</p>
              <p>Sexo: {detalle.sexo}</p>
              <p>Rol: {detalle.rol?.nombre}</p>
              <p>Fecha de nacimiento: {detalle.nacimiento} </p>
              <p>Fecha de Contratación: {detalle.createdAt}</p>
              <div className="campo-editable">
                <label>Competencias:</label>
                <input type="text" defaultValue={detalle.competencias || "Sin Competencias registradas"}/>
              </div>
              <div className="campo-editable">
                <label>Grupo asignado:</label>
                <input type="text" defaultValue={detalle.grupo || "Sin Grupo"}/>
              </div>
              <div className="documentosAdjuntos"
                    style={{ 
                      marginTop: '20px', 
                      padding: '10px', 
                      background: '#f9f9f9', 
                      borderRadius: '5px' }}>

                <h4>Documentos Adjuntos</h4>
                  <div style={{
                    marginBottom: "10px"
                  }}>
                    <label style={{ 
                                  fontWeight: 'bold', 
                                  display: 'block' }}> 
                      Curriculum Vitae 
                    </label>
                    <a href= {detalle.cv_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-documento">Ver o descargar</a>
                  </div>
              
                  <div style={{
                    marginBottom: "10px"
                  }}>
                    <label style={{ 
                                  fontWeight: 'bold', 
                                  display: 'block' }}> 
                      Antecedentes 
                    </label>
                    <a href= {detalle.antecedentes_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-documento">Ver o descargar</a>
                  </div>
                </div>
          
            
            {/*detalle.historialDesvinculaciones && (
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
            )}*/}
          </div>
          ): (
            !loadingDetalle && <p className="sin-seleccion">Haz clic en un trabajador para ver los detalles</p>
          )}
        </section>
      </div>
    </div>
  );
}