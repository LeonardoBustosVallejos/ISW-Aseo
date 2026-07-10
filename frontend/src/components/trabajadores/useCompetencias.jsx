import { useState } from "react";

export const useCompetencias = (items, handleChange) => {
  const [listaCompetencias, setListaCompetencias] = useState([]);
  const [competenciaActual, setCompetenciaActual] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!competenciaActual) return;

    const nuevaLista = [...listaCompetencias, competenciaActual];
    setListaCompetencias(nuevaLista);
    setCompetenciaActual("");

    // Actualizamos el formulario principal
    handleChange({ target: { name: "competenciasIds", value: nuevaLista.join(",") } });
  };

  const handleRemove = (idRemover, e) => {
    e.preventDefault();
    const nuevaLista = listaCompetencias.filter(id => id !== idRemover);
    setListaCompetencias(nuevaLista);
    
    handleChange({ target: { name: "competenciasIds", value: nuevaLista.join(",") } });
  };

  return {
    listaCompetencias,
    competenciaActual,
    setCompetenciaActual,
    handleAdd,
    handleRemove
  };
};