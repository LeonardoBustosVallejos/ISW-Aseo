import { useState, useRef } from "react";

const initialForm = { 
  nombreCompleto: "", 
  rut: "",
  nacimiento: "",
  email: "",
  rol: "",
  sexo: "",
  competencias: "",
  grupo_id: ""
};

export function useIngresarTrabajadorForm(executeCreate) {
  const [form, setForm] = useState(initialForm);
  
  // Referencias para capturar ficheros del DOM
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

    // Empaquetamos todo en una estructura FormData
    const fd = new FormData();
    Object.keys(form).forEach(key => fd.append(key, form[key]));
    
    if (fotoRef.current?.files[0]) fd.append("foto", fotoRef.current.files[0]);
    if (cvRef.current?.files[0]) fd.append("cv", cvRef.current.files[0]);
    if (antecedentesRef.current?.files[0]) fd.append("antecedentes", antecedentesRef.current.files[0]);

    // Ejecuta la mutación y si es exitosa, limpia el formulario
    await executeCreate(fd, () => {
      resetForm();
    });
  };

  return {
    form,
    fotoRef,
    cvRef,
    antecedentesRef,
    handleChange,
    handleSubmit
  };
}