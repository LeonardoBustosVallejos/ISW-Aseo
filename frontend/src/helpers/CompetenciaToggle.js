export const handleCompetenciaToggle = (value, updateFilter) => (id) => {
    const actuales = Array.isArray(value?.competencias) ? value.competencias : [];
    if (actuales.includes(id)) {
        updateFilter("competencias", actuales.filter(item => item !== id));
    } else {
        updateFilter("competencias", [...actuales, id]);
    }
};