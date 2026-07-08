import { useState } from "react";
import { despedirTrabajador, recontratarTrabajador } from "@services/trabajador.service.js";
import { showSuccessAlert, showErrorAlert } from "@helpers/sweetAlert";

export function useDespedirTrabajador() {
  const [loadingDespedir, setLoadingDespedir] = useState(false);
  const [errorDespedir, setErrorDespedir] = useState(null);

  // Acción para ejecutar el despido mandando el FormData
  const executeDespedir = async (id, formData, callbackExito) => {
    setLoadingDespedir(true);
    setErrorDespedir(null);
    
    const resultado = await despedirTrabajador(id, formData);
    setLoadingDespedir(false);

    if (resultado.success) {
      showSuccessAlert("¡Logrado!", resultado.message);
      if (callbackExito) callbackExito();
      return true;
    } else {
      showErrorAlert("Error", resultado.message);
      setErrorDespedir(resultado.message);
      return false;
    }
  };

  // Acción para ejecutar la recontratación
  const executeRecontratar = async (id, callbackExito) => {
    setLoadingDespedir(true);
    setErrorDespedir(null);

    const resultado = await recontratarTrabajador(id);
    setLoadingDespedir(false);

    if (resultado.success) {
      showSuccessAlert("¡Logrado!", resultado.message);
      if (callbackExito) callbackExito();
      return true;
    } else {
      showErrorAlert("Error", resultado.message);
      setErrorDespedir(resultado.message);
      return false;
    }
  };

  return {
    executeDespedir,
    executeRecontratar,
    loadingDespedir,
    errorDespedir
  };
}