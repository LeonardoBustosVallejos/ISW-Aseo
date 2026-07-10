import { useTrabajadores } from "@hooks/trabajadores/useTrabajadores.jsx";
import { useDetalleTrabajador } from "@hooks/trabajadores/useDetalleTrabajadores.jsx";
import { useUpdateTrabajador } from "@hooks/trabajadores/useUpdateTrabajadores";
import { useUpdateTrabajadorForm } from "@components/trabajadores/useUpdateForm";
import { useDespedirTrabajador } from "@hooks/trabajadores/useDespedirTrabajador";
import { useEditarCompetencias } from "@hooks/trabajadores/useEditarCompetencias.jsx"
import useItems from "@hooks/items/useGetItems.jsx";
import { useState, useRef, useMemo } from "react";
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
  const { items, loadingItems } = useItems();

  const {
        isModalOpen,
        setIsModalOpen,
        formData,
        setFormData,
        handleOpenEditModal,
        handleSubmitUpdate  } = useUpdateTrabajadorForm(detalle, executeUpdate, selectedId);

const competenciasIniciales = useMemo(() => { 
    if (!detalle || !detalle.competencias) return [];
    return detalle.competencias.map(comp => comp.id.toString());
  }, [detalle]);

  const handleCompetenciasChange = (e) => {
    const nombreCampo = e.target.name;
    const valorCampo = e.target.value;
    
    setFormData(prevData => ({
      ...prevData,
      [nombreCampo]: valorCampo
    }));
  };

  const {
    listaCompetencias,
    competenciaActual,
    setCompetenciaActual,
    handleAdd,
    handleRemove
  } = useEditarCompetencias(items, competenciasIniciales, handleCompetenciasChange);

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

      <div className="filtros-container">
        <div className="search-container">
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

        <div className="paginacion-container">
          <div className="paginacion-controles">
            <button 
              className="paginacion-flecha"
              onClick={() => setPagina(p => Math.max(p - 1, 1))} 
              disabled={pagina === 1 || loading}
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
                  className={`paginacion-btn ${esActiva ? "activa" : ""}`}
                >
                  {numeroPagina}
                </button>
              );
            })}

            {/* Flecha Siguiente (>) */}
            <button 
              className="paginacion-flecha"
              onClick={() => setPagina(p => Math.min(p + 1, infoPaginacion?.totalPages || 1))} 
              disabled={pagina === (infoPaginacion?.totalPages || 1) || loading}
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

          <div className="paginacion-container">
            <div className="paginacion-controles">
              <button 
                className="paginacion-flecha"
                onClick={() => setPagina(p => Math.max(p - 1, 1))} 
                disabled={pagina === 1 || loading}
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
                    className={`paginacion-btn ${esActiva ? "activa" : ""}`}
                  >
                    {numeroPagina}
                  </button>
                );
              })}

              {/* Flecha Siguiente (>) */}
              <button 
                className="paginacion-flecha"
                onClick={() => setPagina(p => Math.min(p + 1, infoPaginacion?.totalPages || 1))} 
                disabled={pagina === (infoPaginacion?.totalPages || 1) || loading}
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
              <div className="contenedor-foto-perfil">
                {detalle.foto_url ? (
                  <img 
                    src={detalle.foto_url} 
                    alt={`Foto de ${detalle.nombreCompleto}`} 
                    className="foto-perfil-img"
                  />
                ) : (
                  <div className="foto-perfil-placeholder">
                    Sin Foto
                  </div>
                )}
              </div>
            <div className="contenedor-boton-editar">
              <button 
                onClick={handleOpenEditModal} 
                className="btn-editar-trabajador"
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
                                <div className="documentosAdjuntos">
                                    <div className="documento-item-sm">
                                      <label className="documento-label"> 
                                        Curriculum Vitae 
                                      </label>
                                      <a href= {detalle.cv_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="btn-documento">Ver o descargar</a>
                                    </div>
                                
                                    <div className="documento-item">
                                      <label className="documento-label"> 
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
                                <div className="documentosAdjuntos">
                                    <div className="documento-item-sm">
                                      <label className="documento-label"> 
                                        Curriculum Vitae 
                                      </label>
                                      <a href= {detalle.cv_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="btn-documento">Ver o descargar</a>
                                    </div>
                                
                                    <div className="documento-item">
                                      <label className="documento-label"> 
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
                                  <div className="historial-container">
                                          {/*HISTORIAL DE DESVINCULACIONES*/}
                                          <div className="historial-lista">
                                            {detalle.historialDesvinculaciones && detalle.historialDesvinculaciones.length > 0 ? (
                                              detalle.historialDesvinculaciones.map((historial, index) => (
                                                <div 
                                                  key={historial.trabajadorHistorial_id || index} 
                                                  className="historial-item"
                                                >
                                                  <div className="historial-item-header">
                                                    <span className="historial-item-title">
                                                      Registro #{index + 1}
                                                    </span>
                                                    <span className="historial-item-date">
                                                      {new Date(historial.fechaDesvinculacion).toLocaleDateString("es-CL", {
                                                        year: 'numeric', month: 'long', day: 'numeric'
                                                      })}
                                                    </span>
                                                  </div>

                                                  <p className="historial-item-text">
                                                    <strong>Motivo:</strong> {historial.motivo}
                                                  </p>

                                                  {historial.archivo_url && (
                                                    <div className="historial-item-link-container">
                                                      <a 
                                                        href={historial.archivo_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="btn-documento historial-item-link"
                                                      >
                                                       Ver documento de desvinculación
                                                      </a>
                                                    </div>
                                                  )}
                                                </div>
                                              ))
                                            ) : (
                                              <p className="historial-no-records">
                                                No se registran detalles históricos.
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                } />
                                )}
                  <div className="contenedor-acciones-flotantes">
                    {detalle.despedido === false ? (
                      <button type="button"
                              title="Despedir Trabajador"
                              onClick={() => setIsDespedirModalOpen(true)}
                              className="btn-despedir">
                                <Trash2 size={24}/>
                              </button>
                    ): (<button
                        type="button" 
                        title="Recontratar Trabajador"
                        onClick={handleReingreso}
                        disabled={loadingDespedir}
                        className="btn-recontratar">
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
                          <form onSubmit={handleSubmitUpdate} className="modal-form">
                            
                            <div>
                              <label className="modal-label">Correo Electrónico</label>
                              <input 
                                type="email" 
                                value={formData.email} 
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="modal-input"
                                required 
                              />
                            </div>

                            <div>
                              <label className="modal-label">Teléfono</label>
                              <input 
                                type="text" 
                                value={formData.telefono} 
                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                className="modal-input"
                              />
                            </div>

                            <div>
                              <label className="modal-label">Rol</label>
                              <select 
                                value={formData.rol} 
                                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                                className="modal-input"
                              >
                                <option value="4">Trabajador</option>
                                <option value="3">Supervisor</option>
                              </select>
                            </div>
                            {/*
                            <div>
                              <label className="modal-label">Seleccione grupo</label>
                              <select 
                                  value={formData.grupo_id} 
                                  onChange={(e) => setFormData({ ...formData, grupo_id: e.target.value })}
                                  className="modal-input"
                                >
                                <option value="">
                                  {loadingGrupos ? "Cargando grupos..." : "Seleccione un grupo..."}
                                </option>

                                {grupos?.map((grupo) => (
                                  <option key={grupo.grupo_id} value={grupo.grupo_id}>
                                    {grupo.nombre} 
                                  </option>
                                ))}
                              </select>
                            </div>
                              */}
                            <div>
                              <label className="modal-label">Currículum Vitae (CV)</label>
                              {detalle?.cv_url && (
                                <div className="documento-actual">
                                  <span>Archivo actual:</span>
                                  <a href={detalle.cv_url} target="_blank" rel="noopener noreferrer">
                                    Ver CV actual
                                  </a>
                                </div>
                              )}

                              <input 
                                type="file" 
                                accept=".pdf"
                                onChange={(e) => setFormData({ ...formData, cv_file: e.target.files[0] })}
                                className="modal-input"
                              />
                              <span className="modal-ayuda">Sube un nuevo archivo solo si deseas reemplazar el actual.</span>
                            </div>

                            <div>
                              <label className="modal-label">Antecedentes penales</label>
                              {detalle?.antecedentes_url && (
                                <div className="documento-actual">
                                  <span>Archivo actual:</span>
                                  <a href={detalle.antecedentes_url} target="_blank" rel="noopener noreferrer">
                                    Ver antecedentes actual
                                  </a>
                                </div>
                              )}
                              <input 
                                type="file" 
                                accept=".pdf"
                                onChange={(e) => setFormData({ ...formData, antecedentes_file: e.target.files[0] })}
                                className="modal-input"
                              />
                              <span className="modal-ayuda">Sube un nuevo archivo solo si deseas reemplazar el actual.</span>
                            </div>

                            <div>
                              <label className="modal-label">Competencias</label>
                              <div className="competencias-input-group">
                                
                                <select 
                                  className="modal-input select-competencias"
                                  value={competenciaActual} 
                                  onChange={(e) => setCompetenciaActual(e.target.value)}
                                  disabled={loadingItems}
                                >
                                  <option value="">
                                    {loadingItems ? "Cargando competencias..." : "Seleccione una competencia..."}
                                  </option>
                                  
                                  {/* Muestra solo las competencias que el trabajador NO tiene asignadas aún */}
                                  {!loadingItems && items
                                    ?.filter(item => !listaCompetencias.includes(item.id.toString()))
                                    .map((item) => (
                                      <option key={item.id} value={item.id}>
                                        {item.nombre}
                                      </option>
                                    ))}
                                </select>
                                
                                <button 
                                  className="btn-add-competencia" 
                                  onClick={handleAdd}
                                  disabled={!competenciaActual} // Se bloquea si no hay nada seleccionado
                                >
                                  +
                                </button>
                              </div>

                              {/* Renderizado de las "etiquetas" (tags) que ya tiene el trabajador */}
                              {listaCompetencias.length > 0 && (
                                <div className="tags-container">
                                  {listaCompetencias.map(id => {
                                    // Buscamos el objeto completo para poder mostrar el nombre en lugar del ID
                                    const comp = items?.find(i => i.id.toString() === id.toString());
                                    
                                    return (
                                      <div key={id} className="competencia-tag">
                                        <span>{comp ? comp.nombre : `ID: ${id}`}</span>
                                        <button 
                                          className="btn-remove-tag" 
                                          onClick={(e) => handleRemove(id, e)}
                                        >
                                          x
                                        </button>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                            
                            <div>
                              <label className="modal-label">Imagen del trabajador</label>
                              {detalle?.foto_url && (
                                <div className="documento-actual">
                                  <span>Archivo actual:</span>
                                  <a href={detalle.foto_url} target="_blank" rel="noopener noreferrer">
                                    Ver imagen actual
                                  </a>
                                </div>
                              )}
                              <input 
                                type="file" 
                                accept=".png, .jpg, .jpeg"
                                onChange={(e) => setFormData({ ...formData, foto_file: e.target.files[0] })}
                                className="modal-input"
                              />
                              <span className="modal-ayuda">Sube un nuevo archivo solo si deseas reemplazar el actual.</span>
                            </div>

                            {/* Gestión de Errores y Carga del Hook */}
                            {errorUpdate && <p className="modal-error">{errorUpdate}</p>}
                            {successUpdate && <p className="modal-success">{successUpdate}</p>}

                            <div className="modal-acciones">
                              <button type="button" onClick={() => setIsModalOpen(false)} disabled={loadingUpdate} className="btn-cancelar">
                                Cancelar
                              </button>
                              <button type="submit" disabled={loadingUpdate} className="btn-guardar">
                                {loadingUpdate ? "Guardando..." : "Guardar Cambios"}
                              </button>
                            </div>
                          </form>
                        </Modal>
              <Modal open={isDespedirModalOpen} onClose={() => setIsDespedirModalOpen(false)} title="Desvincular Trabajador">
        <form onSubmit={handleDespedirSubmit} className="modal-form-despedir">
          <div>
            <label className="modal-label">Motivo de la desvinculación</label>
            <textarea 
              value={motivoDespido}
              onChange={(e) => setMotivoDespido(e.target.value)}
              placeholder="Escriba detalladamente la razón del despido..."
              className="modal-textarea"
              required
            />
          </div>

          <div>
            <label className="modal-label">Subir evidencias adjuntas</label>
            <input type="file" ref={evidenciaRef} className="modal-file-input" />
          </div>

          <div className="modal-acciones">
            <button type="button" onClick={() => setIsDespedirModalOpen(false)} className="btn-cancelar">
              Cancelar
            </button>
            <button type="submit" disabled={loadingDespedir} className="btn-confirmar-despido">
              {loadingDespedir ? "Procesando..." : "Confirmar Despido"}
            </button>
          </div>
        </form>
      </Modal>      
    </div>
  );
}