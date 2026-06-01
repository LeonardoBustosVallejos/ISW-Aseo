
export const createErrorMessage = (dataInfo, message) => ({
    dataInfo,
    message
});
export const createSimpleMessage = (message) => ({
    message
})

export function cleanRut(rut) {
    if (!rut)
        return "";
    return rut
        .replace(/\./g, "")                 //quitar puntos
        .replace(/^0+/, "")                 //quitar 0 inicial
        .toUpperCase()                     //reemplazar k minúscula por mayúscula si tiene
}