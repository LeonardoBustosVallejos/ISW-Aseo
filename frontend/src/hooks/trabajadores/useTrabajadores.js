import { useState, useEffect, useRef } from "react";
import { getTrabajadores } from "@services/trabajador.service.js";

export function useTrabajadores(searchTerm = "", filtros = {}) {
  const [trabajadores, 
        setTrabajadores] = useState([]);

  const [loading, 
        setLoading] = useState(false);

  const [success, 
        setSucces] = useState(""); 

  const [error, 
        setError] = useState("");

    const [pagina, 
        setPagina] = useState(1);

    const [infoPaginacion, setInfoPaginacion] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  const queryKeyRef = useRef("");

  const queryKey = JSON.stringify({
    searchTerm,
    filtros
  });

  const listaTrabajadores = async () => {
    setLoading(true);
    setError("");
    setSucces("");

    try {
        const result = await getTrabajadores({
          page: pagina,
          search: searchTerm,
          ...filtros
        });

      if (result.succes) {
        const listaTrabajadoresRecuperada = result.data.trabajadores || [];
        setTrabajadores(listaTrabajadoresRecuperada);

        if (result.data.pagination) {
          setInfoPaginacion(result.data.pagination);
        }

        //setSucces(`Mostrando trabajadores del ${((pagina - 1) * 10) + 1} al ${Math.min(pagina * 10, result.data.pagination?.totalItems || 10)}`);
      } else {
        setError(result.message);
        setTrabajadores([]);
        setInfoPaginacion({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0
        });
      }
    } catch (error) {
      setError("Error inesperado al obtener trabajadores");
      console.error("Get trabajadores error:", error);
      setTrabajadores([]);
      setInfoPaginacion({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryKeyRef.current !== queryKey) {
      queryKeyRef.current = queryKey;
      if (pagina !== 1) {
        setPagina(1);
        return;
      }
    }

    listaTrabajadores();
  }, [pagina, queryKey]);

  return { trabajadores, 
          loading, 
          success, 
          error, 
          refetch: listaTrabajadores,
          pagina,
          setPagina,
          infoPaginacion };
}