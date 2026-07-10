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

    const fd = new FormData();

    if (formData.email) fd.append("email", formData.email);
    if (formData.rol) fd.append("rol", formData.rol);
    if (formData.grupo_id) fd.append("grupo_id", formData.grupo_id);

    if (formData.telefono && formData.telefono.trim() !== "") {
      fd.append("telefono", formData.telefono.trim());
    }

    // ==========================================
    // SOLUCIÓN AQUÍ PARA CONFIGURAR competenciasIds
    // ==========================================
    if (formData.competenciasIds) {
      // Si por error es un string ("1,4,5"), lo convertimos a array. Si ya es array, lo dejamos igual.
      const arrayCompetencias = typeof formData.competenciasIds === 'string'
        ? formData.competenciasIds.split(',').map(Number)
        : (Array.isArray(formData.competenciasIds) ? formData.competenciasIds.map(Number) : []);

      // Como estás usando FormData (que solo transmite strings/archivos), para enviar un Array 
      // que Joi pueda entender en el backend, debes mandarlo iterando sobre cada elemento 
      // o serializándolo según lo que soporte tu librería de backend.
      // La forma estándar en FormData para pasar arrays a un validador tipo Joi/Express es:
      arrayCompetencias.forEach(id => {
        fd.append("competenciasIds[]", id); // o simplemente "competenciasIds" según tu parser de backend
      });
    }
    // ==========================================

    if (formData.foto_file) {
      fd.append("foto_url", formData.foto_file); 
    }
    if (formData.cv_file) {
      fd.append("cv_url", formData.cv_file);
    }
    if (formData.antecedentes_file) {
      fd.append("antecedentes_url", formData.antecedentes_file);
    }

    await executeUpdate(selectedId, fd, () => {
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