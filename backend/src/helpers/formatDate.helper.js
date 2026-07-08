
/**
 * Convierte una fecha en formato DD-MM-AAAA
 * @param {Date|string} dateValue 
 * @returns {string|null}
 */
export const formatDate = (dateValue) => {
  if (!dateValue) return null;
  
  const d = new Date(dateValue);
  
  // Extraemos dia, mes y año
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}-${month}-${year}`; // DD-MM-AAAA
};

export const formatNacimiento = (dateValue) => {
  if (!dateValue) return null;

  const dateStr = typeof dateValue === 'string' // pregunta si es un string
    ? dateValue.split('T')[0] // corta donde hay una 'T' y lo que viene después
    : dateValue.toISOString().split('T')[0]; // de no haberlo lo fuerza y asi remueve lo innecesario

  const [year, month, day] = dateStr.split('-'); // remueve el año, mes y fecha
  
  return `${day}-${month}-${year}`; // lo ordena como DD-MM-AAAA
};