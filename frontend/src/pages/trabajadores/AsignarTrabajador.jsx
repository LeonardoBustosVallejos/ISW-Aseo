import { useTrabajadores } from "@hooks/trabajadores/useTrabajadores.js";
import { useDetalleTrabajador } from "@hooks/trabajadores/useDetalleTrabajadores.js"
import Search from "@components/Search.jsx";
import Table from "@components/Table.jsx";
import { showErrorAlert } from "@helpers/sweetAlert.js";
import "@styles/asignarTrabajador.css";
import "@styles/acordeon.css"
import { useState } from "react";
import Acordeon from '@components/acordeon';

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

  const [openSection,
        setOpenSection] = useState(null);
        
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

  <div className="paginacion-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "15px", padding: "10px" }}>


    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
      <button 
        onClick={() => setPagina(p => Math.max(p - 1, 1))} 
        disabled={pagina === 1 || loading}
        style={{ background: "transparent", border: "none", cursor: "pointer", padding: "5px 8px", color: pagina === 1 ? "#ccc" : "#333", fontSize: "1.1em" }}
      >
        &lt;
      </button>
      
      {Array.from({ length: infoPaginacion?.totalPages || 1 }, (_, index) => {
        const numeroPagina = index + 1;
        const esActiva = numeroPagina === pagina;
        
        return (
          <button
            key={numeroPagina}
            onClick={() => setPagina(numeroPagina)}
            disabled={loading}
            style={{
              border: "none",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              cursor: "pointer",
              backgroundColor: esActiva ? "#dbdbdb" : "transparent", // Círculo gris para identificar la página actual
              color: "#333",
              fontWeight: esActiva ? "bold" : "normal",
              transition: "all 0.2s ease"
            }}
          >
            {numeroPagina}
          </button>
        );
      })}

      {/* Flecha Siguiente (>) */}
      <button 
        onClick={() => setPagina(p => Math.min(p + 1, infoPaginacion?.totalPages || 1))} 
        disabled={pagina === (infoPaginacion?.totalPages || 1) || loading}
        style={{ background: "transparent", border: "none", cursor: "pointer", padding: "5px 8px", color: pagina === (infoPaginacion?.totalPages || 1) ? "#ccc" : "#333", fontSize: "1.1em" }}
      >
        &gt;
      </button>
    </div>
  </div>
            {trabajadores.map((trabajador) => (
              <li key={trabajador.id}
              className={`tarjeta-trabajador ${selectedId === trabajador.id ? "seleccionado" : ""}`}
              onClick={() => setSelectedId(trabajador.id)}
              >
                <p>{`${trabajador.apellidoPaterno} ${trabajador.apellidoMaterno} ${trabajador.nombres} `}</p>
                <p>{trabajador.rut}</p>
                <p>{trabajador.rol.nombre}</p>
                {trabajador.rol?.nombre === "Trabajador" && (
                  <p>
                    Grupo asignado: {
                      trabajador.grupoAsignado?.nombre || "Ninguno asignado."
                    }
                  </p>
                  )}
                {trabajador.rol?.nombre === "Supervisor" && (
                  <p>
                    Grupo(s) supervisado(s): {
                      trabajador.gruposSupervisados && trabajador.gruposSupervisados.length > 0
                        ? trabajador.gruposSupervisados.map(grupo => grupo.nombre).join(", ")
                        : "Ninguno supervisado."
                    }
                  </p>
                  )}
              </li>
            ))}
          </ul>

  <div className="paginacion-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "15px", padding: "10px" }}>

    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
      <button 
        onClick={() => setPagina(p => Math.max(p - 1, 1))} 
        disabled={pagina === 1 || loading}
        style={{ background: "transparent", border: "none", cursor: "pointer", padding: "5px 8px", color: pagina === 1 ? "#ccc" : "#333", fontSize: "1.1em" }}
      >
        &lt;
      </button>
      
      {Array.from({ length: infoPaginacion?.totalPages || 1 }, (_, index) => {
        const numeroPagina = index + 1;
        const esActiva = numeroPagina === pagina;
        
        return (
          <button
            key={numeroPagina}
            onClick={() => setPagina(numeroPagina)}
            disabled={loading}
            style={{
              border: "none",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              cursor: "pointer",
              backgroundColor: esActiva ? "#dbdbdb" : "transparent", // Círculo gris para identificar la página actual
              color: "#333",
              fontWeight: esActiva ? "bold" : "normal",
              transition: "all 0.2s ease"
            }}
          >
            {numeroPagina}
          </button>
        );
      })}

      {/* Flecha Siguiente (>) */}
      <button 
        onClick={() => setPagina(p => Math.min(p + 1, infoPaginacion?.totalPages || 1))} 
        disabled={pagina === (infoPaginacion?.totalPages || 1) || loading}
        style={{ background: "transparent", border: "none", cursor: "pointer", padding: "5px 8px", color: pagina === (infoPaginacion?.totalPages || 1) ? "#ccc" : "#333", fontSize: "1.1em" }}
      >
        &gt;
      </button>
    </div>
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
            <Acordeon title={"Información Personal"} level={0} isOpen={openSection === "infoPersonal"}
                                required={false}
                                onToggle={() => {
                                    setOpenSection(openSection === "infoPersonal" ? null : "infoPersonal")
                                }}
                                content={
                                    <div className="">
                                        <p>Nombre: {detalle.nombreCompleto}</p>
                                        <p>Rut: {detalle.rut}</p>
                                        <p>Edad: {detalle.edad}</p>
                                        <p>Sexo: {detalle.sexo}</p>
                                        <p>Fecha de nacimiento: {detalle.nacimiento} </p>
                                        <p>Fecha de Contratación: {detalle.createdAt}</p>
                                    </div>
                                } />
            <Acordeon title={"Contacto"} level={0} isOpen={openSection === "infoContacto"}
                                required={false}
                                onToggle={() => {
                                    setOpenSection(openSection === "infoContacto" ? null : "infoContacto")
                                }}
                                content={
                                    <div className="">

                                        <p>Teléfono: {detalle.telefono}</p>
                                        <p>Correo: {detalle.email}</p>
                                    </div>
                                } />
<Acordeon title={"Documentos del empleado"} level={0} isOpen={openSection === "infoDocumentos"}
                                required={false}
                                onToggle={() => {
                                    setOpenSection(openSection === "infoDocumentos" ? null : "infoDocumentos")
                                }}
                                content={
                                <div className="documentosAdjuntos"
                                      style={{ 
                                        padding: '10px', 
                                        background: '#f9f9f9', 
                                        borderRadius: '5px' }}>
                                    <div style={{
                                      marginBottom: "5px"
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
                                } />
            <Acordeon title={"Rol y grupos"} level={0} isOpen={openSection === "infoRYG"}
                                required={false}
                                onToggle={() => {
                                    setOpenSection(openSection === "infoRYG" ? null : "infoRYG")
                                }}
                                content={
                                    <div className="">
                                        <p>Rol: {detalle.rol?.nombre}</p>
                                        {detalle.rol?.nombre === "Trabajador" && (
                  <p>
                    Grupo asignado: {
                      detalle.grupoAsignado?.nombre || "Ninguno asignado."
                    }
                  </p>
                  )}
                {detalle.rol?.nombre === "Supervisor" && (
                  <p>
                    Grupo(s) supervisado(s): {
                      detalle.gruposSupervisados && detalle.gruposSupervisados.length > 0
                        ? detalle.gruposSupervisados.map(grupo => grupo.nombre).join(", ")
                        : "Ninguno supervisado."
                    }
                  </p>
                  )}
                                    </div>
                                } />

          </div>
          ): (
            !loadingDetalle && <p className="sin-seleccion">Haz clic en un trabajador para ver los detalles</p>
          )}
        </section>
      </div>
    </div>
  );
}