import React, { useRef, useState } from "react";
import api from "@services/root.service.js";
import "@styles/ingresarTrabajador.css";
import { showSuccessAlert, showErrorAlert } from "../../helpers/sweetAlert";

export default function IngresarTrabajador(){
  const fotoRef = useRef();
  const cvRef = useRef();
  const antecedentesRef = useRef();

  const initialForm = ({ 
    nombreCompleto: "", 
    rut: "",
    nacimiento: "",
    email: "" ,
    rol: "",
    sexo: "",
    competencias: "",
    grupo_id: ""});

  const [form, setForm] = useState(initialForm);

  const handleChange = e => setForm({
    ...form, 
    [e.target.name]: 
    e.target.value});

  const handleSubmit = async (e) => {

    e.preventDefault();
    console.log('form state:', form);
    console.log('fotoRef files:', fotoRef.current?.files);
    console.log('cvRef files:', cvRef.current?.files);
    console.log('antecedentesRef files:', antecedentesRef.current?.files);

    const fd = new FormData();
    fd.append("nombreCompleto", form.nombreCompleto);
    fd.append("rut", form.rut);
    fd.append("nacimiento", form.nacimiento);
    fd.append("email", form.email);
    fd.append("rol", form.rol);
    fd.append("sexo", form.sexo);
    fd.append("competencias", form.competencias);
    fd.append("grupo_id", form.grupo_id);
    fd.append("foto", fotoRef.current.files[0]);
    fd.append("cv", cvRef.current.files[0]);
    fd.append("antecedentes", antecedentesRef.current.files[0]);

// inspeccionar FormData (muestra pares clave/valor)
for (const pair of fd.entries()) {
  console.log(pair[0], pair[1]);
}
    try {
      
    const res = await api.post("/trabajadores/create", fd, {
      headers: { "Content-Type": "multipart/form-data" }
      
    });
    console.log(res.data);
    showSuccessAlert("Exito", "Trabajador ingresado correctamnte");

    setForm(initialForm);
    fotoRef.current.value = "";
    cvRef.current.value = "";
    antecedentesRef.current.value = "";

    } catch (err) {
      console.error(err);
      }
    };

    return (
    <div>
    <h1>Ingresar Trabajador</h1>
    <div className="formIngresarTrabajador">
      <form onSubmit={handleSubmit}>
        <label 
        htmlFor="nombreCompleto">
          Nombre Completo
        .</label>
          <input 
            id="nombreCompleto" 
            name="nombreCompleto" 
            value={form.nombreCompleto} 
            onChange={handleChange} 
            placeholder="Nombre" />
        <label 
          htmlFor="rut">Rut.
        </label>
          <input 
            id="rut" 
            name="rut" 
            value={form.rut} 
            onChange={handleChange} 
            placeholder="12.345.678-9"/>
        <label 
        htmlFor="nacimiento"> 
          Fecha de nacimiento.
        </label>
          <input 
            id="nacimiento" 
            name= "nacimiento" 
            type="date" 
            value={form.nacimiento}
            onChange={handleChange}
            required/>
        <label 
          htmlFor="email">
            Correo.
        </label>
          <input 
            id="email" 
            name="email" 
            value={form.email} 
            onChange={handleChange} 
            placeholder="Email" />
        <label 
          htmlFor="rol">
            Rol.
        </label>
          <input 
          id="rol" 
          name="rol" 
          value={form.rol} 
          onChange={handleChange} 
          placeholder="Insertar rol"/>
        <label 
          htmlFor="sexo">
            Sexo
        </label>
          <select 
          id="sexo" 
          name="sexo"
          value={form.sexo}
          onChange={handleChange}
          required>
            <option
              value="">
                Seleccione sexo
            </option>
            <option 
              value="M">
                Masculino
            </option>
            <option   
              value="F">
                Femenino
            </option>
          </select>
        <label 
          htmlFor="competencias">
            Competencias.
          </label>
          <input 
            id="competencias" 
            name="competencias" 
            value={form.competencias} 
            onChange={handleChange} 
            placeholder="Ser absurdamente guap@"/>
        <label 
          htmlFor="grupo_id">
            Grupo.
        </label>
          <input 
            id="grupo_id" 
            name="grupo_id" 
            value={form.grupo_id} 
            onChange={handleChange}/>
        <label 
          htmlFor="foto">
            Foto del empleado.
          </label>
          <input 
            id="foto" 
            name="foto" 
            type="file" 
            ref={fotoRef}/>
        <label 
          htmlFor="cv"> 
            Curriculum del empleado.
        </label>
          <input 
            id="cv" 
            name="curriculum" 
            type="file" 
            ref={cvRef}/>
        <label 
          htmlFor="antecedentes">
            Antecedentes del empleado.
          </label>
          <input 
            id="antecedentes" 
            name="antecedentes" 
            type="file" 
            ref={antecedentesRef}/>
        
        <button type="submit">Guardar</button>
          </form>
      </div>
    </div>
    );
}