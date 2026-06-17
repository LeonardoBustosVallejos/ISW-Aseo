import { useState, useEffect } from "react";
import { getTrabajadores } from "@services/trabajador.service.js";

export function useTrabajadores() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSucces] = useState(""); 
  const [error, setError] = useState("");

  const listaTrabajadores = async () => {
    setLoading(true);
    setError("");
    setSucces("");

    try {
      const result = await getTrabajadores();
      console.log(result);

      if (result.succes) {
        setTrabajadores(result.data);
        setSucces(`Se han encontrado todos los trabajadores (${result.data.length})`);
      } else {
        setError(result.message);
        setTrabajadores([]);
      }
    } catch (error) {
      setError("Error inesperado al obtener trabajadores");
      console.error("Get trabajadores error:", error);
      setTrabajadores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    listaTrabajadores();
  }, []);

  return { trabajadores, loading, success, error, refetch: listaTrabajadores };
}