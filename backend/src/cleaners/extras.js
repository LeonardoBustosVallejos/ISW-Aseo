
export const createErrorMessage = (dataInfo, message) => ({
    dataInfo,
    message
});
export const createSimpleMessage = (message) => ({
    message
})

export function cleanRut(rut) {
    if (!rut || rut === 'Sin rut')
        return "";
    const limpio = rut
        .replace(/\./g, "")                 //quitar puntos
        .replace(/^0+/, "")                 //quitar 0 inicial
        .toUpperCase()                     //reemplazar k minúscula por mayúscula si tiene
    if (limpio.length < 2) return limpio;

    const dv = limpio.slice(-1);
    const cuerpo = limpio.slice(0, -1);

    const cuerpoConPuntos = cuerpo.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        "."
    );

    return `${cuerpoConPuntos}-${dv}`;
}