
import { useState, useEffect } from "react";
import api from "@services/root.service.js";

const BuscadorYFiltros = ({ searchTerm, setSearchTerm, onFilterClick }) => (
  <div className="flex items-center justify-between gap-4 p-4 bg-white border-b border-gray-200">
      <div className="relative flex-grow max-w-xl">
      <input
        type="search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Buscar por Nombre, RUT, Cargo..."
        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
    <button
      onClick={onFilterClick}
      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
    >
      Filtros
    </button>
  </div>
);

// Lista de Trabajadores (Panel Izquierdo)
const ListaTrabajadores = ({ trabajadores, onSelectWorker, selectedWorkerId }) => (
  <div className="overflow-y-auto bg-white border-r border-gray-200 h-full">
    <h2 className="p-4 text-lg font-semibold text-gray-800 border-b border-gray-200">Lista de Trabajadores ({trabajadores.length})</h2>
    <ul>
      {trabajadores.map((worker) => (
        <li key={worker.id}>
          <button
            onClick={() => onSelectWorker(worker)}
            className={`w-full text-left p-4 hover:bg-blue-50 flex flex-col gap-1 border-b border-gray-100 ${
              selectedWorkerId === worker.id ? "bg-blue-100 border-l-4 border-l-blue-600" : "border-l-4 border-l-transparent"
            }`}
          >
            <span className="font-medium text-gray-900">{worker.nombre}</span>
            <span className="text-sm text-gray-600">RUT: {worker.rut}</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider">{worker.cargo} / {worker.departamento}</span>
          </button>
        </li>
      ))}
      {trabajadores.length === 0 && (
          <li className="p-8 text-center text-gray-500">No se encontraron trabajadores.</li>
      )}
    </ul>
  </div>
);

// Detalle y Edición del Trabajador (Panel Derecho)
const DetalleTrabajador = ({ worker, isEditing, onEditClick, onSaveClick, onCancelClick, onInputChange, editFormData }) => {
  if (!worker) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-50 p-8 text-center">
        Selecciona un trabajador de la lista para ver sus detalles o editar su información.
      </div>
    );
  }

  // Define qué campos son editables y cómo se muestran
  const fieldDefinitions = [
    
    { key: "nombreCompleto", label: "Nombre Completo", type: "text" },
    { key: "rut", label: "RUT", type: "text" },
    { key: "rol", label: "Rol", type: "text" },
    { key: "grupo_id", label: "Grupo", type: "text" }, // Hay que modificar esto para que muestre el nombre
    { key: "email", label: "Correo Electrónico", type: "email" },
    { key: "telefono", label: "Teléfono", type: "tel" },
    { key: "createdAt", label: "Fecha de Contratación", type: "date" },
  ];

  return (
    <div className="p-6 bg-white h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? `Editando: ${worker.nombre}` : worker.nombre}
        </h2>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button onClick={onSaveClick} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Guardar Cambios</button>
              <button onClick={onCancelClick} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
            </>
          ) : (
            <button onClick={onEditClick} className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-900">
              Editar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fieldDefinitions.map((field) => (
          <div key={field.key} className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-500">{field.label}</label>
            {isEditing ? (
              field.type === "select" ? (
                <select
                  name={field.key}
                  value={editFormData[field.key] || ""}
                  onChange={onInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-base"
                >
                  {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input
                  type={field.type}
                  name={field.key}
                  value={editFormData[field.key] || ""}
                  onChange={onInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-base"
                />
              )
            ) : (
              <p className="text-base font-semibold text-gray-900 bg-gray-50 p-2 rounded border border-gray-100 min-h-[42px]">
                {worker[field.key] || <span className="text-gray-400 font-normal">No registrado</span>}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};


// --- COMPONENTE PRINCIPAL ---

const AsignarTrabajadoresPage = () => {
  // --- ESTADO ---
  const [todosLosTrabajadores, setTodosLosTrabajadores] = useState([]); // Datos completos
  const [trabajadoresFiltrados, setTrabajadoresFiltrados] = useState([]); // Datos para la lista (buscados)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorker, setSelectedWorker] = useState(null);
  
  // Estado para la edición
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // Cargar datos al inicio (desde backend). Si falla, usar mock como fallback.
  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/trabajadores/");
        const data = res.data?.data ?? res.data ?? [];
        const arr = Array.isArray(data) ? data : [];
        setTodosLosTrabajadores(arr);
        setTrabajadoresFiltrados(arr);
      } catch (err) {
        console.error("Error cargando trabajadores desde backend:", err);
        // No usar datos mock: dejar listas vacías y notificar en consola
        setTodosLosTrabajadores([]);
        setTrabajadoresFiltrados([]);
      }
    }
    load();
  }, []);

  // Lógica de búsqueda del lado del cliente (Frontend)
  useEffect(() => {
    if (!searchTerm.trim()) {
      setTrabajadoresFiltrados(todosLosTrabajadores);
    } else {
      const lowerSearch = searchTerm.toLowerCase();
      const filtered = todosLosTrabajadores.filter(worker => 
        (worker.nombre || "").toLowerCase().includes(lowerSearch) ||
        (worker.rut || "").toLowerCase().includes(lowerSearch) ||
        (worker.cargo || "").toLowerCase().includes(lowerSearch) ||
        (worker.departamento || "").toLowerCase().includes(lowerSearch)
      );
      setTrabajadoresFiltrados(filtered);
    }
  }, [searchTerm, todosLosTrabajadores]);


  // --- MANEJADORES DE EVENTOS (HANDLERS) ---

  const handleSelectWorker = (worker) => {
    // Si estamos editando y cambiamos de trabajador, cancelamos la edición actual
    if(isEditing){
        if(!window.confirm("Tienes cambios sin guardar. ¿Deseas descartarlos y ver otro trabajador?")){
            return; // No cambia
        }
    }
    setSelectedWorker(worker);
    setIsEditing(false); // Resetear modo edición al seleccionar nuevo
    setEditFormData({}); // Limpiar formulario de edición
  };

  const handleFilterClick = () => {
    alert("Aquí se desplegaría el panel de filtros avanzados (Estético por ahora)." );
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditFormData(selectedWorker); // Clonar datos actuales al formulario de edición
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveClick = async () => {
    // 1. Validaciones básicas (ej. RUT chileno, campos obligatorios) - Aquí
    if(!editFormData.nombre || !editFormData.rut) {
        alert("Nombre y RUT son obligatorios.");
        return;
    }

    try {
        console.log("Enviando cambios al backend:", editFormData);
        
        // 2. Aquí harías el PUT/PATCH real al backend
        // const response = await fetch(`/api/trabajadores/${editFormData.id}`, {
        //   method: "PUT",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(editFormData)
        // });
        // if (!response.ok) throw new Error("Error al guardar");
        // const updatedWorker = await response.json();

        // SIMULACIÓN DE ÉXITO EN EL MOCK:
        const updatedWorker = editFormData; // En producción, esto viene del servidor
        
        // 3. Actualizar el estado local (todosLosTrabajadores y selectedWorker)
        setTodosLosTrabajadores(prev => 
            prev.map(w => w.id === updatedWorker.id ? updatedWorker : w)
        );
        setSelectedWorker(updatedWorker);
        setIsEditing(false);
        setEditFormData({});
        
        alert("Trabajador actualizado con éxito (simulado).");

    } catch (error) {
        console.error(error);
        alert("Hubo un error al intentar guardar los cambios.");
    }
  };


  // --- RENDERIZADO PRINCIPAL (LAYOUT) ---
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      
      {/* Barra Superior: Búsqueda y Filtros */}
      <BuscadorYFiltros 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        onFilterClick={handleFilterClick} 
      />

      {/* Área Principal Contenedora */}
      <div className="flex flex-grow overflow-hidden">
        
        {/* Panel Izquierdo: Lista (1/3 o ancho fijo) */}
        <div className="w-1/3 min-w-[320px] max-w-md h-full">
          <ListaTrabajadores 
            trabajadores={trabajadoresFiltrados} 
            onSelectWorker={handleSelectWorker}
            selectedWorkerId={selectedWorker?.id}
          />
        </div>

        {/* Panel Derecho: Detalle/Edición (2/3 o flexible) */}
        <div className="flex-grow h-full bg-gray-50">
          <DetalleTrabajador 
            worker={selectedWorker}
            isEditing={isEditing}
            onEditClick={handleEditClick}
            onSaveClick={handleSaveClick}
            onCancelClick={handleCancelClick}
            onInputChange={handleInputChange}
            editFormData={editFormData}
          />
        </div>

      </div>
    </div>
  );
};

export default AsignarTrabajadoresPage;
