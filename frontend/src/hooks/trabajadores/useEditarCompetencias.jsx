import { useState, useEffect } from "react";

export const useEditarCompetencias = (items, competenciasIniciales, handleChange) => {
  const [listaCompetencias, setListaCompetencias] = useState(competenciasIniciales || []);
  const [competenciaActual, setCompetenciaActual] = useState("");

    useEffect(() => {
        if (competenciasIniciales) {
        setListaCompetencias(competenciasIniciales);
        }
    }, [competenciasIniciales]);

  const handleAdd = (e) => {
      e.preventDefault();
      if (!competenciaActual || listaCompetencias.includes(competenciaActual)) return;

      const nuevaLista = [...listaCompetencias, competenciaActual];
      setListaCompetencias(nuevaLista);
      setCompetenciaActual("");

      handleChange({ target: { name: "competenciasIds", value: nuevaLista } });
  };

  const handleRemove = (idRemover, e) => {
    e.preventDefault();
    const nuevaLista = listaCompetencias.filter(id => id !== idRemover);
    setListaCompetencias(nuevaLista);
    
    handleChange({ target: { name: "competenciasIds", value: nuevaLista } });
  };

  return {
    listaCompetencias,
    competenciaActual,
    setCompetenciaActual,
    handleAdd,
    handleRemove
  };
};