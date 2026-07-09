import React, { useState } from "react";
import Header from "@components/misc/Header.jsx";
import { useGetGrupos } from "@hooks/trabajadores/useGetGrupos.jsx";
import { useCreateTrabajador } from "@hooks/trabajadores/useCreateTrabajadores.jsx";
import { useIngresarTrabajadorForm } from "@components/trabajadores/useIngresarTrabajadorForm.jsx";
import Acordeon from "@components/acordeon";
import "@styles/ingresarTrabajador.css";

export default function IngresarTrabajador() {
  // Consumimos el hook de grupos
  const { grupos, loadingGrupos, errorGrupos } = useGetGrupos();
  const { executeCreate, loadingCreate } = useCreateTrabajador();
  
  // Consumimos el hook del formulario
  const {
    form,
    fotoRef,
    cvRef,
    antecedentesRef,
    loadingSubmit,
    handleChange,
    handleSubmit
  } = useIngresarTrabajadorForm((formData, resetForm) => executeCreate(formData, resetForm));

  // Estado para controlar qué sección del acordeón está abierta
  const [openSection, setOpenSection] = useState("infoPersonal");

  const toggleSection = (sectionName) => {
    setOpenSection(openSection === sectionName ? null : sectionName);
  };

  return (
    <div>
      <Header title="Ingresar Trabajador"/>
      <div className="formIngresarTrabajador">
        <form onSubmit={handleSubmit}>

          {/* SECCIÓN 1: INFORMACIÓN PERSONAL */}
          <Acordeon 
            title="Información Personal" 
            level={0} 
            isOpen={openSection === "infoPersonal"}
            required={true}
            onToggle={() => toggleSection("infoPersonal")}
            content={
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "10px 0" }}>
                <label htmlFor="nombres">Nombres</label>
                <input id="nombres" name="nombres" value={form.nombres} onChange={handleChange} placeholder="Juan Antonio" required />
                
                <label htmlFor="apellidoPaterno">Apellido Paterno</label>
                <input id="apellidoPaterno" name="apellidoPaterno" value={form.apellidoPaterno} onChange={handleChange} placeholder="Ignacio" required />
                
                <label htmlFor="apellidoMaterno">Apellido Materno</label>
                <input id="apellidoMaterno" name="apellidoMaterno" value={form.apellidoMaterno} onChange={handleChange} placeholder="García" required />
                
                <label htmlFor="rut">Rut.</label>
                <input id="rut" name="rut" value={form.rut} onChange={handleChange} placeholder="12.345.678-9" required />
                
                <label htmlFor="sexo">Sexo</label>
                <select id="sexo" name="sexo" value={form.sexo} onChange={handleChange} required>
                  <option value="">Seleccione sexo</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>

                <label htmlFor="nacimiento">Fecha de nacimiento.</label>
                <input id="nacimiento" name="nacimiento" type="date" value={form.nacimiento} onChange={handleChange} required />
              </div>
            } 
          />

          {/* SECCIÓN 2: CONTACTO */}
          <Acordeon 
            title="Contacto" 
            level={0} 
            isOpen={openSection === "contacto"}
            required={true}
            onToggle={() => toggleSection("contacto")}
            content={
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "10px 0" }}>
                <label htmlFor="telefono">Teléfono</label>
                <input id="telefono" name="telefono" value={form.telefono} onChange={handleChange} placeholder="+56123456789" />
                
                <label htmlFor="email">Correo.</label>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required />
              </div>
            } 
          />

          {/* SECCIÓN 3: COMPETENCIAS */}
          <Acordeon 
            title="Competencias" 
            level={0} 
            isOpen={openSection === "competencias"}
            required={false}
            onToggle={() => toggleSection("competencias")}
            content={
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "10px 0" }}>
                <label htmlFor="competencias">Competencias</label>
                <select id="competencias" name="competencias" value={form.competencias} onChange={handleChange}>
                  <option value="">{loadingGrupos ? "Cargando grupos..." : "Seleccione una competencia"}</option>
                  {/* Nota: Asegúrate de mapear las competencias reales si tu backend las provee por separado */}
                  {!loadingGrupos && grupos.map((item) => (
                    <option key={item.grupo_id} value={item.grupo_id}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </div>
            } 
          />

          {/* SECCIÓN 4: DOCUMENTOS */}
          <Acordeon 
            title="Documentos" 
            level={0} 
            isOpen={openSection === "documentos"}
            required={false}
            onToggle={() => toggleSection("documentos")}
            content={
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "10px 0" }}>
                <label htmlFor="foto">Foto del empleado.</label>
                <input id="foto" name="foto" type="file" ref={fotoRef} />
                
                <label htmlFor="cv">Curriculum del empleado.</label>
                <input id="cv" name="cv" type="file" ref={cvRef} />
                
                <label htmlFor="antecedentes">Antecedentes del empleado.</label>
                <input id="antecedentes" name="antecedentes" type="file" ref={antecedentesRef} />
              </div>
            } 
          />

          {/* SECCIÓN 5: ROL Y GRUPOS */}
          <Acordeon 
            title="Rol y Grupos" 
            level={0} 
            isOpen={openSection === "rolYGrupos"}
            required={true}
            onToggle={() => toggleSection("rolYGrupos")}
            content={
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "10px 0" }}>
                <label htmlFor="rol">Rol.</label>
                <select id="rol" name="rol" value={form.rol} onChange={handleChange} required >
                    <option value="">Seleccione un Rol</option>            
                    <option value={3}>Trabajador</option>
                    <option value={4}>Supervisor</option>
                </select>

                <label htmlFor="grupo_id">Grupo Asignado</label>
                <select id="grupo_id" name="grupo_id" value={form.grupo_id} onChange={handleChange} required>
                  <option value="">{loadingGrupos ? "Cargando grupos..." : "Seleccione un grupo"}</option>
                  {!loadingGrupos && grupos.map((grupo) => (
                    <option key={grupo.grupo_id} value={grupo.grupo_id}>
                      {grupo.nombre}
                    </option>
                  ))}
                </select>
                {errorGrupos && <p style={{ color: "#b91c1c" }}>{errorGrupos}</p>}
              </div>
            } 
          />

          {/* BOTÓN DE ENVÍO */}
          <button 
            type="submit" 
            disabled={loadingSubmit || loadingCreate}
            style={{ marginTop: "20px", width: "100%" }}
          >
            {loadingSubmit || loadingCreate ? "Guardando..." : "Guardar"}
          </button>
        </form>
      </div>
    </div>
  );
}