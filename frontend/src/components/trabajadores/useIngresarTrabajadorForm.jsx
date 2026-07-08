import { useState, useRef } from "react";

const initialForm = { 
  nombres: "", 
  apellidoPaterno: "",
  apellidoMaterno: "",
  rut: "",
  telefono: "",
  nacimiento: "",
  email: "",
  rol: "",
  sexo: "",
  competencias: "",
  grupo_id: ""
};

export function useIngresarTrabajadorForm(onSubmit) {
  const [form, setForm] = useState(initialForm);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Referencias para los inputs tipo 'file'
  const fotoRef = useRef();
  const cvRef = useRef();
  const antecedentesRef = useRef();

  const handleChange = (e) => {
    setForm({
      ...form, 
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setForm(initialForm);
    if (fotoRef.current) fotoRef.current.value = "";
    if (cvRef.current) cvRef.current.value = "";
    if (antecedentesRef.current) antecedentesRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);

    const fd = new FormData();
    Object.keys(form).forEach(key => fd.append(key, form[key]));
    
    if (fotoRef.current?.files[0]) fd.append("foto", fotoRef.current.files[0]);
    if (cvRef.current?.files[0]) fd.append("cv", cvRef.current.files[0]);
    if (antecedentesRef.current?.files[0]) fd.append("antecedentes", antecedentesRef.current.files[0]);

    try {
      if (onSubmit) {
        await onSubmit(fd, resetForm);
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  return {
    form,
    fotoRef,
    cvRef,
    antecedentesRef,
    loadingSubmit,
    handleChange,
    handleSubmit
  };
}