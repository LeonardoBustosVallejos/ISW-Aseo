export function calcularPersonalTotal(sedes = [], filiales = []) {

    let total = 0

    for (const sede of sedes) {

        total += Number(sede.personalSolicitado || 0)
    }

    for (const filial of filiales) {

        total += calcularPersonalTotal(
            filial.sedes || [],
            filial.filiales || []
        )
    }

    return total
}

export function obtenerLimitePersonalContrato(
    contrato,
    anexos = []
) {

    let limite =
        contrato.cantidadMaxTrabajadores || 0

    for (const anexo of anexos) {

        const datos = anexo?.datos || {}

        // si el anexo redefine límite
        if (
            datos.cantidadMaxTrabajadores &&
            datos.cantidadMaxTrabajadores > 0
        ) {

            limite =
                datos.cantidadMaxTrabajadores
        }
    }

    return limite
}