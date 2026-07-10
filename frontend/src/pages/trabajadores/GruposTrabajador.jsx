import React, { useState, useEffect } from 'react';
import { Table } from "../../components/Tabla2"; 
import { getGrupos, createGrupo, updateGrupo, deleteGrupo, getTrabajadores } from '@services/trabajador.service';
import { Plus, Trash2, Save, UserPlus, X } from 'lucide-react';
import "@styles/gruposTrabajador.css"

export default function GruposCrud() {
  const [grupos, setGrupos] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // Estados para el formulario de Creación Rápida
  const [showCreate, setShowCreate] = useState(false);
  const [newGrupo, setNewGrupo] = useState({ nombre: '', sede_id: '' });
  const [newSupervisorId, setNewSupervisorId] = useState('');
  const [newMiembrosIds, setNewMiembrosIds] = useState([]); 
  const [selectedMiembroId, setSelectedMiembroId] = useState(''); 

  // Estado para la edición de una fila expandida
  const [editingData, setEditingData] = useState({});

  useEffect(() => {
    fetchInicial();
  }, []);

  const fetchInicial = async () => {
    setLoading(true);
    try {
      const [dataGrupos, errorGrupos] = await getGrupos(1, 50);
      if (dataGrupos) {
        const listaDeGrupos = dataGrupos.grupos || dataGrupos;
        setGrupos(listaDeGrupos);
      }

      const responseTrabajadores = await getTrabajadores({ limit: 100, estado: "activos" });
      let listaDeTrabajadores = [];
      
      if (responseTrabajadores) {
        if (Array.isArray(responseTrabajadores)) {
          listaDeTrabajadores = responseTrabajadores;
        } else if (responseTrabajadores.data) {
          listaDeTrabajadores = responseTrabajadores.data.trabajadores || responseTrabajadores.data;
        } else if (responseTrabajadores.trabajadores) {
          listaDeTrabajadores = responseTrabajadores.trabajadores;
        }
      }
      setTrabajadores(Array.isArray(listaDeTrabajadores) ? listaDeTrabajadores : []);
    } catch (error) {
      console.error("Error al cargar datos iniciales en la vista:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrupos = async () => {
    const [dataGrupos, error] = await getGrupos(1, 50);
    if (dataGrupos) {
      setGrupos(dataGrupos.grupos || dataGrupos || []);
    }
  };

  const addMiembroToNewGrupo = () => {
    if (!selectedMiembroId) return;
    const idNum = Number(selectedMiembroId);
    if (!newMiembrosIds.includes(idNum)) {
      setNewMiembrosIds([...newMiembrosIds, idNum]);
    }
    setSelectedMiembroId(''); 
  };

  const removeMiembroFromNewGrupo = (idNum) => {
    setNewMiembrosIds(newMiembrosIds.filter(id => id !== idNum));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (newMiembrosIds.length === 0) {
      alert("Debes agregar al menos un miembro a la cuadrilla.");
      return;
    }

    const payload = {
      nombre: newGrupo.nombre,
      sede_id: Number(newGrupo.sede_id),
      supervisor_id: Number(newSupervisorId),
      miembros: newMiembrosIds
    };
    
    const [res, error] = await createGrupo(payload);
    if (res || !error) {
      alert("¡Grupo creado exitosamente!");
      setShowCreate(false);
      setNewGrupo({ nombre: '', sede_id: '' });
      setNewSupervisorId('');
      setNewMiembrosIds([]);
      fetchGrupos();
    } else {
      alert("Error al crear: " + error);
    }
  };

  const handleUpdate = async (id) => {
    const dataRow = editingData[id];
    if (!dataRow) return;

    const payload = {
      nombre: dataRow.nombre,
      supervisor_id: Number(dataRow.supervisor_id),
      miembros: dataRow.miembrosIds 
    };

    const [res, error] = await updateGrupo(id, payload);
    if (res || !error) {
      alert("¡Grupo actualizado correctamente!");
      fetchGrupos();
    } else {
      alert("Error al actualizar: " + error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de disolver este grupo?")) {
      const [res, error] = await deleteGrupo(id);
      if (!error) {
        alert("¡Grupo eliminado!");
        fetchGrupos();
      } else {
        alert("Error al eliminar: " + error);
      }
    }
  };

  const getTrabajadorNombre = (id) => {
    const t = trabajadores.find(emp => Number(emp.id) === Number(id));
    return t ? `${t.nombres} ${t.apellidoPaterno}` : `ID: ${id}`;
  };

  // ==================== COLUMNAS SIN ID Y CON CONTEO ESTILIZADO ====================
  const columns = [
    { 
      field: 'nombre', 
      header: 'Nombre Cuadrilla' 
    },
    { 
      field: 'sedeAsignada', 
      header: 'Sede / Ubicación',
      render: (val) => val?.nombre_sede || 'Sin Sede'
    },
    { 
      field: 'supervisorAsignado', 
      header: 'Supervisor a Cargo',
      render: (val) => val ? `${val.nombres} ${val.apellidoPaterno}` : <span className="text-gray-400 italic">Sin Asignar</span>
    },
    {
      field: 'miembros',
      header: 'Miembros del Grupo',
      render: (val) => {
        const cantidad = val?.length || 0;
        
        if (cantidad === 0) {
          return (
            <span className="inline-flex items-center bg-gray-100 text-gray-400 px-2.5 py-1 rounded-full text-xs font-medium border border-gray-200/60">
              0 integrantes
            </span>
          );
        }

        return (
          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            {cantidad} {cantidad === 1 ? 'trabajador' : 'trabajadores'}
          </span>
        );
      }
    }
  ];

  // ==================== LÓGICA DE EXTRACCIÓN ULTRA-SEGURA PARA LAS SEDES ====================
  // Generamos primero la lista única de sedes disponibles
  const listaSedesDisponibles = Array.from(new Map(
    grupos
      .filter(g => g.sedeAsignada)
      .map(g => [g.sedeAsignada.sede_id, g.sedeAsignada])
  ).values());

  // Buscamos la sede seleccionada en esa lista limpia
  const sedeSeleccionadaInfo = listaSedesDisponibles.find(
    s => Number(s.sede_id) === Number(newGrupo.sede_id)
  );

  const solicitado = sedeSeleccionadaInfo?.personalSolicitado || 0;
  const asignadoPorBackend = sedeSeleccionadaInfo?.personalAsignado || 0;
  const cuposDisponibles = solicitado - asignadoPorBackend;

  // ==================== RENDEREADO DE EDICIÓN (FILA EXPANDIDA) ====================
  const renderExpandedRow = (row) => {
    const currentEdit = editingData[row.grupo_id] || {
      nombre: row.nombre,
      supervisor_id: row.supervisorAsignado?.id || '',
      miembrosIds: row.miembros?.map(m => Number(m.id)) || [],
      tempSelectId: ''
    };

    const listaTrabajadores = Array.isArray(trabajadores) ? trabajadores : [];
    const listaSupervisores = listaTrabajadores.filter(t => t.rol?.nombre?.toLowerCase() === 'supervisor');
    const listaSoloTrabajadores = listaTrabajadores.filter(t => t.rol?.nombre?.toLowerCase() === 'trabajador');

    const addMiembroToEdit = (grupoId) => {
      if (!currentEdit.tempSelectId) return;
      const idNum = Number(currentEdit.tempSelectId);
      if (!currentEdit.miembrosIds.includes(idNum)) {
        setEditingData(prev => ({
          ...prev,
          [grupoId]: {
            ...currentEdit,
            miembrosIds: [...currentEdit.miembrosIds, idNum],
            tempSelectId: ''
          }
        }));
      }
    };

    const removeMiembroFromEdit = (grupoId, idNum) => {
      setEditingData(prev => ({
        ...prev,
        [grupoId]: {
          ...currentEdit,
          miembrosIds: currentEdit.miembrosIds.filter(id => id !== idNum)
        }
      }));
    };

    return (
      <div className="p-6 bg-slate-50/80 rounded-xl border border-slate-200 m-2 text-sm">
        <div className="border-b border-slate-200 pb-2.5 mb-4">
          <p className="text-xs text-slate-500 mt-0.5">Modifique los integrantes o el supervisor del grupo.</p>
        </div>

        <div className="flex flex-wrap items-end gap-6 mb-5">
          {/* EDITAR NOMBRE */}
          <div className="flex-1 min-w-[220px]">
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Nombre de la Cuadrilla</label>
            <input 
              type="text" 
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm h-11"
              value={currentEdit.nombre}
              onChange={(e) => setEditingData(prev => ({
                ...prev,
                [row.grupo_id]: { ...currentEdit, nombre: e.target.value }
              }))}
            />
          </div>
          
          {/* EDITAR SUPERVISOR */}
          <div className="flex-1 min-w-[240px]">
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Supervisor Responsable</label>
            <select
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm h-11"
              value={currentEdit.supervisor_id}
              onChange={(e) => setEditingData(prev => ({
                ...prev,
                [row.grupo_id]: { ...currentEdit, supervisor_id: e.target.value }
              }))}
            >
              <option value="">Seleccione un Supervisor</option>
              {listaSupervisores.map(t => (
                <option key={t.id} value={t.id}>{t.nombres} {t.apellidoPaterno}</option>
              ))}
            </select>
          </div>

          {/* AGREGAR MIEMBRO */}
          <div className="flex-1 min-w-[260px]">
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Añadir Nuevo Integrante</label>
            <div className="flex gap-2">
              <select
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm h-11"
                value={currentEdit.tempSelectId}
                onChange={(e) => setEditingData(prev => ({
                  ...prev,
                  [row.grupo_id]: { ...currentEdit, tempSelectId: e.target.value }
                }))}
              >
                <option value="">Seleccione Trabajador</option>
                {listaSoloTrabajadores.map(t => (
                  <option key={t.id} value={t.id}>{t.nombres} {t.apellidoPaterno}</option>
                ))}
              </select>
              <button 
                type="button"
                onClick={() => addMiembroToEdit(row.grupo_id)}
                className="h-11 w-11 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center shrink-0 shadow-sm"
              >
                <UserPlus size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="mb-5 bg-white border border-slate-200 rounded-xl p-4">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Personal Integrado en esta Cuadrilla ({currentEdit.miembrosIds.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {currentEdit.miembrosIds.map(id => (
              <span key={id} className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 font-semibold px-3 py-1.5 rounded-lg text-xs border border-blue-100">
                {getTrabajadorNombre(id)}
                <button 
                  type="button" 
                  onClick={() => removeMiembroFromEdit(row.grupo_id, id)} 
                  className="text-blue-400 hover:text-blue-800 p-0.5"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
            {currentEdit.miembrosIds.length === 0 && (
              <span className="text-slate-400 text-xs italic">Sin miembros asignados en esta cuadrilla.</span>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button 
            onClick={() => handleUpdate(row.grupo_id)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold text-xs shadow-sm"
          >
            <Save size={14} /> Guardar Configuración
          </button>
        </div>
      </div>
    );
  };

  const renderActions = (row) => (
    <div className="flex gap-2">
      <button onClick={() => handleDelete(row.grupo_id)} className="text-red-600 hover:text-red-900" title="Eliminar Grupo">
        <Trash2 size={16} />
      </button>
    </div>
  );

  return (
    <div className="container mx-auto p-4 adaptive-view">
      <div className="flex justify-end mb-5">
        <button 
          onClick={() => setShowCreate(!showCreate)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold hover:bg-blue-700 shadow-sm"
        >
          <Plus size={16} /> {showCreate ? 'Cerrar Registro' : 'Nueva Cuadrilla'}
        </button>
      </div>

      {/* ==================== FORMULARIO DE CREACIÓN ==================== */}
      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-6 flex flex-col gap-5">
          <div className="border-b border-gray-100 pb-2">
            <h3 className="text-sm font-bold text-gray-700">Crear Nueva Cuadrilla de Trabajo</h3>
            <p className="text-xs text-gray-400">Defina los parámetros principales, asigne la sede operativa y el personal correspondiente.</p>
          </div>

          {/* TARJETAS DE CONTEO Y LIMITACIÓN POR SEDE - YA NO PRODUCIRÁN ERRORES DE IDENTIDAD */}
          {newGrupo.sede_id && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 animate-fadeIn">
              <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-xs">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Personal Solicitado (Contrato)</p>
                <p className="text-xl font-black text-slate-800 mt-0.5">{solicitado} <span className="text-xs font-normal text-slate-500">Cupos</span></p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-xs">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Total Asignado en Sede</p>
                <p className="text-xl font-black text-blue-600 mt-0.5">{asignadoPorBackend} <span className="text-xs font-normal text-slate-500">Trabajadores</span></p>
              </div>

              <div className={`p-3 rounded-lg border shadow-xs ${cuposDisponibles <= 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                <p className={`text-[11px] font-bold uppercase tracking-wide ${cuposDisponibles <= 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                  Cupos Disponibles
                </p>
                <p className={`text-xl font-black mt-0.5 ${cuposDisponibles <= 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                  {cuposDisponibles <= 0 ? 'Límite alcanzado' : `${cuposDisponibles} vacantes`}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-end gap-6 w-full">
            {/* NOMBRE DEL GRUPO */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Nombre del Grupo</label>
              <input 
                type="text" 
                required 
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-blue-500 text-sm h-11" 
                placeholder="Ej: Grupo G"
                value={newGrupo.nombre} 
                onChange={e => setNewGrupo({...newGrupo, nombre: e.target.value})}
              />
            </div>

            {/* SELECTOR DE SEDES */}
            <div className="flex-1 min-w-[220px]">
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Sede / Ubicación Asignada</label>
              <select
                required
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-blue-500 text-sm h-11"
                value={newGrupo.sede_id}
                onChange={(e) => setNewGrupo(prev => ({ ...prev, sede_id: e.target.value }))}
              >
                <option value="">Seleccione Sede</option>
                {listaSedesDisponibles.map(sede => (
                  <option key={sede.sede_id} value={sede.sede_id}>
                    {sede.nombre_sede}
                  </option>
                ))}
              </select>
            </div>

            {/* SELECTOR DE SUPERVISOR */}
            <div className="flex-1 min-w-[240px]">
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Supervisor Responsable</label>
              <select 
                required 
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-blue-500 text-sm h-11"
                value={newSupervisorId} 
                onChange={e => setNewSupervisorId(e.target.value)}
              >
                <option value="">Seleccione un Supervisor</option>
                {trabajadores
                  .filter(t => t.rol?.nombre?.toLowerCase() === 'supervisor')
                  .map(t => (
                    <option key={t.id} value={t.id}>{t.nombres} {t.apellidoPaterno}</option>
                  ))
                }
              </select>
            </div>

            {/* SELECTOR DE INTEGRANTES */}
            <div className="flex-1 min-w-[260px]">
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Añadir Integrante</label>
              <div className="flex gap-2">
                <select 
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-blue-500 text-sm h-11"
                  value={selectedMiembroId} 
                  onChange={e => setSelectedMiembroId(e.target.value)}
                  disabled={newGrupo.sede_id && cuposDisponibles <= 0}
                >
                  <option value="">Seleccione Trabajador</option>
                  {trabajadores
                    .filter(t => t.rol?.nombre?.toLowerCase() === 'trabajador')
                    .map(t => (
                      <option key={t.id} value={t.id}>{t.nombres} {t.apellidoPaterno}</option>
                    ))
                  }
                </select>
                <button 
                  type="button" 
                  onClick={addMiembroToNewGrupo}
                  disabled={newGrupo.sede_id && cuposDisponibles <= 0}
                  className="h-11 w-11 bg-blue-600 disabled:bg-gray-300 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center shrink-0 shadow-sm transition-all"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* LISTA DE INTEGRANTES PRESELECCIONADOS */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Personal pre-seleccionado para la Cuadrilla ({newMiembrosIds.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {newMiembrosIds.map(id => (
                <span key={id} className="inline-flex items-center gap-1.5 bg-white text-gray-700 font-medium px-3 py-1.5 rounded-lg text-xs border border-gray-200 shadow-sm">
                  {getTrabajadorNombre(id)}
                  <button type="button" onClick={() => removeMiembroFromNewGrupo(id)} className="text-gray-400 hover:text-red-500 ml-1">
                    <X size={14} />
                  </button>
                </span>
              ))}
              {newMiembrosIds.length === 0 && (
                <span className="text-gray-400 text-xs italic">No has añadido miembros todavía.</span>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-gray-50">
            <button 
              type="submit" 
              disabled={newGrupo.sede_id && cuposDisponibles <= 0 && newMiembrosIds.length === 0}
              className="bg-gray-900 disabled:bg-gray-400 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-800 transition-all shadow-sm"
            >
              Crear Cuadrilla Completa
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-center text-gray-500">Cargando grupos de trabajo...</p>
      ) : (
        <Table 
          title="Listado de Grupos Activos"
          rowKey="grupo_id"
          columns={columns}
          data={grupos}
          renderExpanded={renderExpandedRow}
          actions={renderActions}
          emptyMessage="No se han configurado grupos ni cuadrillas todavía."
        />
      )}
    </div>
  );
}