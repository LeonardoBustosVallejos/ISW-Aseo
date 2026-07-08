import { useState } from "react";

export function useUpdateTrabajadorForm(detalle, executeUpdate, selectedId) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    telefono: "",
    rol: "",
    grupo_id: "",
    competencias: [],
    cv_url: "",
    antecedentes_url: ""
  });

  const handleOpenEditModal = () => {
    if (!detalle) return;

    setFormData({
      email: detalle.email || "",
      telefono: detalle.telefono || "",
      rol: detalle.rol?.id ? String(detalle.rol.id) : "", 
      grupo_id: detalle.grupoAsignado?.id || "",
      competencias: detalle.competencias?.map((c) => c.id) || [],
      cv_url: detalle.cv_url || "",
      antecedentes_url: detalle.antecedentes_url || ""
    });

    setIsModalOpen(true);
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    await executeUpdate(selectedId, formData, () => {
      setIsModalOpen(false);
    });
  };

  return {
    isModalOpen,
    setIsModalOpen,
    formData,
    setFormData,
    handleOpenEditModal,
    handleSubmitUpdate
  };
}