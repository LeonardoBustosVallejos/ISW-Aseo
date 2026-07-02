export function formatDate(fecha) {

    if (!fecha) return "-";

    return new Date(fecha).toLocaleDateString(
        "es-CL",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}
export function formatDateTime(fecha) {

    if (!fecha) return "-";

    return new Date(fecha).toLocaleString(
        "es-CL",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}