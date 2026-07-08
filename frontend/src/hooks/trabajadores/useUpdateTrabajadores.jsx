import { useState, useEffect } from "react";
import { updateTrabajador } from "@services/trabajador.service.js";


export function useUpdateTrabajador() {

      const [loadingUpdate, setLoadingUpdate] = useState(false);
      const [errorUpdate, setErrorUpdate] = useState("");
      const [successUpdate, setSuccessUpdate] = useState("");

  const executeUpdate = async (id, body, callback) => {

          setLoadingUpdate(true);
          setErrorUpdate("");
          setSuccessUpdate("");

      try {
          const result = await updateTrabajador(id, body);

          if (!result.success) {
              setErrorUpdate(result.message || "No se pudieron actualizar los datos.");
              return false;
              }
          
          setSuccessUpdate(result.message || "Cambios guardados con exito.")

          if (callback) {
              callback(result.data);
          }
          
      } catch (error) {
        console.log("Error en el hook:", error)
        setErrorUpdate("Ocurrió un error inesperado en el sistema.");
        return false;
      } finally {
        setLoadingUpdate(false);
      };
  }
    return {
              executeUpdate,
              loadingUpdate,
              errorUpdate,
              successUpdate,
              setErrorUpdate,
              setSuccessUpdate
          };
}