export const formatRut = (value) => {
    if (!value) return "";

    // Dejar solo números y K
    let clean = value
        .replace(/[^0-9kK]/g, "")
        .toUpperCase();

    // Permitir solo una K y dejarla al final
    const hasK = clean.includes("K");
    clean = clean.replace(/K/g, "");

    if (hasK) {
        clean += "K";
    }

    // Máximo: 8 dígitos + DV
    clean = clean.slice(0, 9);

    // Si solo hay un carácter, aún no hay cuerpo
    if (clean.length === 1) {
        return clean;
    }

    // Separar cuerpo y DV
    const body = clean.slice(0, -1);
    const dv = clean.slice(-1);

    // Agregar puntos cada 3 dígitos
    const formattedBody = body
        .split("")
        .reverse()
        .join("")
        .replace(/(\d{3})(?=\d)/g, "$1.")
        .split("")
        .reverse()
        .join("");

    return `${formattedBody}-${dv}`;
};