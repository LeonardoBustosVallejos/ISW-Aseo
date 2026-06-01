import React, { useEffect, useMemo, useState } from "react";
import api from "@services/root.service.js";
import Search from "@components/Search.jsx";
import Table from "@components/Table.jsx";
import { showErrorAlert } from "@helpers/sweetAlert.js";
import "@styles/ingresarTrabajador.css";

export default function AsignarTrabajador() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrabajadores();
  }, []);

  const loadTrabajadores = async () => {
    try {
      setLoading(true);
      const res = await api.get("/trabajadores/");
      const data = res.data?.data ?? res.data ?? [];
      setTrabajadores(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showErrorAlert("Error", "No se pudieron cargar los trabajadores.");
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      { title: "Nombre", field: "nombreCompleto", width: 280, responsive: 0 },
      { title: "Rut", field: "rut", width: 140, responsive: 1 },
      { title: "Correo", field: "email", width: 240, responsive: 2 },
      { title: "Rol", field: "rol", width: 160, responsive: 2 },
      { title: "Sexo", field: "sexo", width: 90, responsive: 3 },
      { title: "Grupo", field: "grupo_id", width: 100, responsive: 3 },
    ],
    []
  );

  const visibleTrabajadores = useMemo(() => {
    const query = filterText.trim().toLowerCase();

    if (!query) return trabajadores;

    return trabajadores.filter((trabajador) => {
      const nombre = String(trabajador.nombreCompleto ?? "").toLowerCase();
      const rut = String(trabajador.rut ?? "").toLowerCase();
      const email = String(trabajador.email ?? "").toLowerCase();
      const rol = String(trabajador.rol ?? "").toLowerCase();

      return (
        nombre.includes(query) ||
        rut.includes(query) ||
        email.includes(query) ||
        rol.includes(query)
      );
    });
  }, [trabajadores, filterText]);

  return (
    <div className="main-container trabajadores-admin">
      <div className="trabajadores-header">
        <div className="trabajadores-search-area">
          <h1 className="title-table">Trabajadores</h1>
          <Search
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Buscar por nombre, rut, correo o rol"
          />
        </div>

        <div className="trabajadores-header-actions">
          <button
            type="button"
            className="filters-button"
            onClick={() => setShowFilters((prev) => !prev)}
          >
            Filtros
          </button>

          {showFilters && (
            <div className="filters-popover">
              <button type="button">Estado</button>
              <button type="button">Grupo</button>
              <button type="button">Rol</button>
              <button type="button">Sede</button>
            </div>
          )}
        </div>
      </div>

      <section className="trabajadores-list-panel">
        {loading ? (
          <div className="panel-empty-state">Cargando trabajadores...</div>
        ) : (
          <Table
            data={visibleTrabajadores}
            columns={columns}
            initialSortName="nombreCompleto"
          />
        )}
      </section>
    </div>
  );
}