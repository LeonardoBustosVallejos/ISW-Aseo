import { useTrabajadores } from "@hooks/trabajadores/useTrabajadores.jsx";
import { useDetalleTrabajador } from "@hooks/trabajadores/useDetalleTrabajadores.jsx";
import { useUpdateTrabajador } from "@hooks/trabajadores/useUpdateTrabajadores";
import { useUpdateTrabajadorForm } from "@components/trabajadores/useUpdateForm";
import { useDespedirTrabajador } from "@hooks/trabajadores/useDespedirTrabajador";
import { useState, useRef } from "react";
import Acordeon from "@components/acordeon";
import Search from "@components/Search.jsx";
import Header from "@components/misc/Header.jsx";
import TrabajadorFilters from "@components/trabajadores/TrabajadorFilters.jsx";
import { Modal }  from "@components/Modal.jsx";
import { Trash2, RotateCcwKey  } from "lucide-react";
import "@styles/root.css";
import "@styles/EditarTrabajador.css";
import "@styles/modal.css";

const filtrosPorDefecto = {
  sexo: "",
  edadMin: "",
  edadMax: "",
  rol: "",
  estado: "activos"
};

export default function Trabajadores() {

  const [selectedId, setSelectedId] = useState(null); 
  const [openSection, setOpenSection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtros, setFiltros] = useState(filtrosPorDefecto);

  const [isDespedirModalOpen, setIsDespedirModalOpen] = useState(false);
  const [motivoDespido, setMotivoDespido] = useState("");
  const evidenciaRef = useRef(null);

  const { detalle, loadingDetalle, errorDetalle } = useDetalleTrabajador(selectedId); 
  const { trabajadores, loading, pagina, setPagina, infoPaginacion } = useTrabajadores(searchTerm, filtros); 
  const { executeUpdate, loadingUpdate, errorUpdate, successUpdate } = useUpdateTrabajador();
  
  const { executeDespedir, executeRecontratar, loadingDespedir} = useDespedirTrabajador();

  const {
        isModalOpen,
        setIsModalOpen,
        formData,
        setFormData,
        handleOpenEditModal,
        handleSubmitUpdate  } = useUpdateTrabajadorForm(detalle, executeUpdate, selectedId);

  const handleFiltrosChange = (nextFiltros) => {
    setFiltros(nextFiltros);
  };

  const handleDespedirSubmit = async (e) => {
    e.preventDefault();
    
    const fd = new FormData();
    fd.append("motivo", motivoDespido);
    if (evidenciaRef.current?.files[0]) {
      fd.append("evidencia", evidenciaRef.current.files[0]);
    }

    const exito = await executeDespedir(selectedId, fd, () => {
      setIsDespedirModalOpen(false);
      setMotivoDespido("");
    })
  };


    const handleReingreso = async () => {
      const seguro = window.confirm(`¿Estás seguro de que deseas recontratar a ${detalle.nombres}?`)
      if (seguro) {
        await executeRecontratar(selectedId, () => {
        });
      }
    }; 

  return (
    <div className="contenido-asignacion">
      <Header title = "Trabajadores"/>

      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "280px" }}>
          <Search 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            placeholder="Buscar por nombre, RUT o email..." 
          />
        </div>

        <TrabajadorFilters
          value={filtros}
          onChange={handleFiltrosChange}
          onClear={setFiltros}
        />
      </div>

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
            {trabajadores
              .map((trabajador) => (
                <li key={trabajador.id}
                className={`tarjeta-trabajador ${selectedId === trabajador.id ? "seleccionado" : ""}`}
                onClick={() => setSelectedId(trabajador.id)}
                >
                <p>{`${trabajador.nombres} ${trabajador.apellidoPaterno} ${trabajador.apellidoMaterno} `}</p>
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
                      backgroundColor: esActiva ? "#dbdbdb" : "transparent",
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
            <div style={{ textAlign: "center", marginBottom: "15px" }}>
              <button 
                onClick={handleOpenEditModal} 
                className="btn-editar-trabajador" // Puedes darle estilos en EditarTrabajador.css
                style={{ padding: "8px 16px", backgroundColor: "#0011ff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                >
                  Editar Datos
                 </button>
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
                                        {detalle.despedido === false && (
                                        <p>Fecha de Contratación: {detalle.createdAt}</p>)}
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

              <Acordeon title={"Competencias"} level={0} isOpen={openSection === "infoCompetencias"}
                                required={false}
                                onToggle={() => {
                                    setOpenSection(openSection === "infoCompetencias" ? null : "infoCompetencias")
                                }}
                                content={
                                    <div className="">
                                          <p>
                                            Competencia(s): {
                                            detalle.competencias && detalle.competencias.length > 0
                                              ? detalle.competencias.map(comp => comp.nombre).join(", ")
                                              : "Sin competencias registradas."
                                          }
                                          </p>
                                    </div>
                                } />
            {detalle.despedido === false && (
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
                                } />)}

            {detalle.despedido === true && (
            <Acordeon title={"Documentos del ex empleado"} level={0} isOpen={openSection === "infoExempleado"}
                                required={false}
                                onToggle={() => {
                                    setOpenSection(openSection === "infoExempleado" ? null : "infoExempleado")
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
                                } />)}

            {detalle.despedido === false && (
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
                                } />)}

            {detalle.despedido === true && (
            <Acordeon title={"Historial desvinculaciones"} level={0} isOpen={openSection === "infoRYG"}
                                required={false}
                                onToggle={() => {
                                    setOpenSection(openSection === "infoRYG" ? null : "infoRYG")
                                }}
                                content={
                                  <div className="historial-container" style={{ padding: '10px' }}>
                                          

                                          {/*HISTORIAL DE DESVINCULACIONES*/}
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                                            
                                            {detalle.historialDesvinculaciones && detalle.historialDesvinculaciones.length > 0 ? (
                                              detalle.historialDesvinculaciones.map((historial, index) => (
                                                <div 
                                                  key={historial.trabajadorHistorial_id || index} 
                                                  style={{
                                                    padding: '12px',
                                                    background: '#f9f9f9',
                                                    borderRadius: '6px',
                                                    borderLeft: '4px solid #0011ff',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                                  }}
                                                >
                                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                    <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#4b5563' }}>
                                                      Registro #{index + 1}
                                                    </span>
                                                    <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                                      {new Date(historial.fechaDesvinculacion).toLocaleDateString("es-CL", {
                                                        year: 'numeric', month: 'long', day: 'numeric'
                                                      })}
                                                    </span>
                                                  </div>

                                                  <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>
                                                    <strong>Motivo:</strong> {historial.motivo}
                                                  </p>

                                                  {historial.archivo_url && (
                                                    <div style={{ marginTop: '8px' }}>
                                                      <a 
                                                        href={historial.archivo_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="btn-documento"
                                                        style={{
                                                          fontSize: '0.85rem',
                                                          color: '#162a55',
                                                          textDecoration: 'underline'
                                                        }}
                                                      >
                                                       Ver documento de desvinculación
                                                      </a>
                                                    </div>
                                                  )}
                                                </div>
                                              ))
                                            ) : (
                                              <p style={{ color: '#6b7280', fontStyle: 'italic', fontSize: '0.9rem' }}>
                                                No se registran detalles históricos.
                                              </p>
                                            )}
                                          </div>

                                        </div>
                                } />
              
                                )}
                  <div style={{
                    position: "absolute",
                    bottom: "3px",
                    right: "20px",
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center"
                  }}>
                    {detalle.despedido === false ? (
                      <button type="button"
                              title="Despedir Trabajador"
                              onClick={() => setIsDespedirModalOpen(true)}
                              style={{ background: "transparent",
                                      border: "nore",
                                      color: "dc2626",
                                      cursor: "pointer",
                                      transition: "transform 0.2s"}}
                              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.15)"}
                              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}>
                                <Trash2 size={24}/>
                              </button>
                    ): (<button
                        type="button" 
                    title="Recontratar Trabajador"
                    onClick={handleReingreso}
                    disabled={loadingDespedir}
                    style={{ background: "transparent", border: "none", color: "#16a34a", cursor: "pointer", transition: "transform 0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.15)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}>
                      <RotateCcwKey size={24}/>
                    </button>
                  )}
                  </div>
          </div>
          ): (
            !loadingDetalle && <p className="sin-seleccion">Haz clic en un trabajador para ver los detalles</p>
          )}
        </section>
      </div>
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Modificar Trabajador">
                          <form onSubmit={handleSubmitUpdate} style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "10px" }}>
                            
                            <div>
                              <label style={{ fontWeight: "bold", display: "block" }}>Correo Electrónico</label>
                              <input 
                                type="email" 
                                value={formData.email} 
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }}
                                required 
                              />
                            </div>

                            <div>
                              <label style={{ fontWeight: "bold", display: "block" }}>Teléfono</label>
                              <input 
                                type="text" 
                                value={formData.telefono} 
                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }}
                              />
                            </div>

                            <div>
                              <label style={{ fontWeight: "bold", display: "block" }}>Rol</label>
                              <select 
                                value={formData.rol} 
                                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                                style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }}
                              >
                                <option value="4">Trabajador</option>
                                <option value="3">Supervisor</option>
                              </select>
                            </div>

                            <div>
                              <label style={{ fontWeight: "bold", display: "block" }}>ID de Grupo</label>
                              <input 
                                type="text" 
                                value={formData.grupo_id} 
                                onChange={(e) => setFormData({ ...formData, grupo_id: e.target.value })}
                                style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }}
                                placeholder="ID del grupo a asignar"
                              />
                            </div>

                            <div>
                              <label style={{ fontWeight: "bold", display: "block" }}>URL Currículum Vitae (CV)</label>
                              <input 
                                type="url" 
                                value={formData.cv_url} 
                                onChange={(e) => setFormData({ ...formData, cv_url: e.target.value })}
                                style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }}
                              />
                            </div>

                            <div>
                              <label style={{ fontWeight: "bold", display: "block" }}>URL Antecedentes</label>
                              <input 
                                type="url" 
                                value={formData.antecedentes_url} 
                                onChange={(e) => setFormData({ ...formData, antecedentes_url: e.target.value })}
                                style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }}
                              />
                            </div>

                            {/* Gestión de Errores y Carga del Hook */}
                            {errorUpdate && <p style={{ color: "red", margin: 0 }}>{errorUpdate}</p>}
                            {successUpdate && <p style={{ color: "green", margin: 0 }}>{successUpdate}</p>}

                            <div style={{ display: "flex", justifyContent: "end", gap: "10px", marginTop: "10px" }}>
                              <button type="button" onClick={() => setIsModalOpen(false)} disabled={loadingUpdate} style={{ padding: "6px 12px" }}>
                                Cancelar
                              </button>
                              <button type="submit" disabled={loadingUpdate} style={{ padding: "6px 12px", backgroundColor: "#0011ff", color: "white", border: "none", borderRadius: "4px" }}>
                                {loadingUpdate ? "Guardando..." : "Guardar Cambios"}
                              </button>
                            </div>
                          </form>
                        </Modal>
              <Modal open={isDespedirModalOpen} onClose={() => setIsDespedirModalOpen(false)} title="Desvincular Trabajador">
        <form onSubmit={handleDespedirSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "15px" }}>
          <div>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: "6px" }}>Motivo de la desvinculación</label>
            <textarea 
              value={motivoDespido}
              onChange={(e) => setMotivoDespido(e.target.value)}
              placeholder="Escriba detalladamente la razón del despido..."
              style={{ width: "100%", height: "100px", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", resize: "none" }}
              required
            />
          </div>

          <div>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: "6px" }}>Subir evidencias adjuntas</label>
            <input type="file" ref={evidenciaRef} style={{ width: "100%", padding: "4px" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "end", gap: "10px", marginTop: "10px" }}>
            <button type="button" onClick={() => setIsDespedirModalOpen(false)} style={{ padding: "6px 12px", borderRadius: "4px", border: "1px solid #ccc", cursor: "pointer" }}>
              Cancelar
            </button>
            <button type="submit" disabled={loadingDespedir} style={{ padding: "6px 12px", backgroundColor: "#dc2626", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
              {loadingDespedir ? "Procesando..." : "Confirmar Despido"}
            </button>
          </div>
        </form>
      </Modal>      
    </div>
  );
}