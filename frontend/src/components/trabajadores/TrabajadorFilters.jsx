import { useState } from "react";
import "@styles/trabajadorFilters.css"; 

const filtrosPorDefecto = {
  sexo: "",
  edadMin: "",
  edadMax: "",
  rol: "",
  estado: "activos"
};

export default function TrabajadorFilters({ value, onChange, onClear }) {
  const [open, setOpen] = useState(false);

  const filtrosActivos = [
    value?.sexo,
    value?.edadMin,
    value?.edadMax,
    value?.rol,
    value?.estado && value.estado !== "activos" ? value.estado : ""
  ].filter(Boolean).length;

  const updateFilter = (key, nextValue) => {
    onChange({
      ...value,
      [key]: nextValue
    });
  };

  const MIN_EDAD_PERMITIDA = 18;
  const MAX_EDAD_PERMITIDA = 70;

  // Aseguramos que los sliders siempre tengan un número válido para moverse
  const edadMinVal = value?.edadMin !== "" && value?.edadMin !== undefined ? Number(value.edadMin) : MIN_EDAD_PERMITIDA;
  const edadMaxVal = value?.edadMax !== "" && value?.edadMax !== undefined ? Number(value.edadMax) : MAX_EDAD_PERMITIDA;

  return (
    <div className="filters-container">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`filters-trigger-btn ${filtrosActivos > 0 ? "active" : ""}`}
      >
        <span>Filtros</span>
        {filtrosActivos > 0 && (
          <span className="filters-badge-count">
            {filtrosActivos}
          </span>
        )}
      </button>

      {open && (
        <div className="filters-dropdown">
          <div className="filters-content-wrapper">
            
            {/* FILTRO: SEXO */}
            <label className="filter-label-group">
              Sexo
              <select
                value={value?.sexo || ""}
                onChange={(e) => updateFilter("sexo", e.target.value)}
                className="filter-select"
              >
                <option value="">Todos</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </label>

            {/* FILTRO: ROL */}
            <label className="filter-label-group">
              Rol
              <select
                value={value?.rol || ""}
                onChange={(e) => updateFilter("rol", e.target.value)}
                className="filter-select"
              >
                <option value="">Todos</option>
                <option value="Trabajador">Trabajador</option>
                <option value="Supervisor">Supervisor</option>
              </select>
            </label>

            {/* FILTRO: RANGO ETARIO CON UN SOLO SLIDER DE DOBLE HANDLE */}
            <div className="filter-label-group">
              <span className="filter-section-title">Rango Etario (Edad)</span>
              
              <div className="dual-slider-track-container">
                <div className="dual-slider-bg-line" />

                <input
                  type="range"
                  min={MIN_EDAD_PERMITIDA}
                  max={MAX_EDAD_PERMITIDA}
                  value={edadMinVal}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v <= edadMaxVal) updateFilter("edadMin", v.toString());
                  }}
                  className="dual-slider-handle min-handle"
                />

                <input
                  type="range"
                  min={MIN_EDAD_PERMITIDA}
                  max={MAX_EDAD_PERMITIDA}
                  value={edadMaxVal}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v >= edadMinVal) updateFilter("edadMax", v.toString());
                  }}
                  className="dual-slider-handle max-handle"
                />
              </div>

              <div className="manual-inputs-row">
                <input
                  type="number"
                  min={MIN_EDAD_PERMITIDA}
                  max={edadMaxVal}
                  placeholder="18"
                  value={value?.edadMin || ""}
                  onChange={(e) => updateFilter("edadMin", e.target.value)}
                  className="manual-input-box"
                />
                <span className="manual-input-separator">al</span>
                <input
                  type="number"
                  min={edadMinVal}
                  max={MAX_EDAD_PERMITIDA}
                  placeholder="70"
                  value={value?.edadMax || ""}
                  onChange={(e) => updateFilter("edadMax", e.target.value)}
                  className="manual-input-box"
                />
              </div>
            </div>

            {/* FILTRO: ESTADO */}
            <label className="filter-label-group">
              Estado
              <select
                value={value?.estado || "activos"}
                onChange={(e) => updateFilter("estado", e.target.value)}
                className="filter-select"
              >
                <option value="activos">Activos</option>
                <option value="despedidos">Despedidos</option>
                <option value="todos">Todos</option>
              </select>
            </label>

            {/* ACCIONES EN EL FOOTER */}
            <div className="filters-actions-footer">
              <button
                type="button"
                onClick={() => onClear({ ...filtrosPorDefecto })}
                className="filter-btn-clear"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="filter-btn-close"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}