import { useState, useEffect } from "react";
import { getTrabajadorById } from "@services/trabajador.service.js"; 

export function useDetalleTrabajador(trabajadorId) {
  const [detalle, setDetalle] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState("");

  useEffect(() => {
    if (!trabajadorId) {
      setDetalle(null);
      return;
    }

    const obtenerDetalle = async () => {
      setLoadingDetalle(true);
      setErrorDetalle("");
      try {
        const result = await getTrabajadorById(trabajadorId);
        if (result.success) {
          setDetalle(result.data);
        } else {
          setErrorDetalle(result.message);
        }
      } catch (err) {
        setErrorDetalle("Error inesperado en el sistema");
      } finally {
        setLoadingDetalle(false);
      }
    };

    obtenerDetalle();
  }, [trabajadorId]);

  return { detalle, loadingDetalle, errorDetalle };
}