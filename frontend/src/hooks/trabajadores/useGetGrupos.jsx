import { useState, useEffect, useCallback } from "react";
import axios from "@services/root.service.js";

export function useGetGrupos() {
  const [grupos, setGrupos] = useState([]);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [errorGrupos, setErrorGrupos] = useState("");

  const getGrupos = useCallback(async () => {
    setLoadingGrupos(true);
    setErrorGrupos("");

    try {
      const res = await axios.get("/trabajadores/detail/grupos");
      const lista = Array.isArray(res.data?.data?.grupos)
        ? res.data.data.grupos
        : Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : [];

      setGrupos(
        lista
          .map((grupo) => ({
            ...grupo,
            grupo_id: grupo.grupo_id ?? grupo.id,
            nombre: grupo.nombre ?? grupo.nombre_grupo ?? "Sin nombre"
          }))
          .sort((a, b) => String(a.nombre).localeCompare(String(b.nombre)))
      );
    } catch (error) {
      console.error("Error cargando los grupos en el hook:", error);
      setErrorGrupos(error.response?.data?.message || "Error al cargar los grupos");
      setGrupos([]);
    } finally {
      setLoadingGrupos(false);
    }
  }, []);

  useEffect(() => {
    getGrupos();
  }, [getGrupos]);

  return { grupos, loadingGrupos, errorGrupos, refetchGrupos: getGrupos };
}