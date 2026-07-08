import { useState } from "react";
import { createTrabajador } from "@services/trabajador.service.js";
import { showSuccessAlert, showErrorAlert } from "@helpers/sweetAlert";

export function useCreateTrabajador() {
  const [loadingCreate, 
        setLoadingCreate] = useState(false);

  const executeCreate = async (formData, onSuccessCallback) => {
    setLoadingCreate(true);
    const result = await createTrabajador(formData);
    setLoadingCreate(false);

    if (result.success) {
      showSuccessAlert("Éxito", "Trabajador ingresado correctamente");
      if (onSuccessCallback) onSuccessCallback();
      return true;
    } else {
      showErrorAlert("Error", result.message);
      return false;
    }
  };

  return { executeCreate, loadingCreate };
}