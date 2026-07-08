/**
 * Convierte una fecha en formato DD-MM-AAAA
 * @param {Date|string} dateValue 
 * @returns {string|null}
 */
export const calcularEdad = (nacimiento) => {
  if (!nacimiento) {
    return null
    }
  
  const hoy = new Date();
  const cumpleanhos = new Date(nacimiento);

  let edad = hoy.getFullYear() - cumpleanhos.getFullYear();
  let mes = hoy.getMonth() - cumpleanhos.getMonth();
  
  if (mes < 0 || (mes === 0 && hoy.getDate() <cumpleanhos.getUTCDate())) {
    edad -- 
  }
  
  return edad;
};