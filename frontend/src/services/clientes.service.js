import axios from './root.service.js';

export async function listarClientesTope() {
    try {
        const response = await axios.get("/clientes")
        return response.data
    } catch (error) {
        return error.response?.data || { message: "Error de conexión" };
    }
}
export async function registerCliente(data) {
    try {
        const formData = new FormData()

        formData.append(
            "cliente",
            JSON.stringify(data.cliente)
        )

        formData.append(
            "sedes",
            JSON.stringify(data.sedes)
        )

        formData.append(
            "contrato",
            JSON.stringify(data.contrato)
        )

        formData.append(
            "anexos",
            JSON.stringify(data.anexos)
        )

        formData.append(
            "metadataDocumentosContrato",
            JSON.stringify(
                data.metadataDocumentos
                    .map(doc => ({
                        nombrePersonalizado: doc.nombrePersonalizado,
                        tipoDocumento: doc.tipoDocumento,
                        fileKey: doc.fileKey
                    }))
            )
        )

        data.metadataDocumentos.forEach(doc => {

            if (doc.file) {

                formData.append(
                    doc.fileKey,
                    doc.file
                )

            }
        })
        data.anexos.forEach(anexo => {

            anexo.documentos.forEach(doc => {

                if (doc.file) {

                    formData.append(
                        doc.fileKey,
                        doc.file
                    )
                }
            })
        })
        for (const pair of formData.entries()) {
            console.log(pair[0], pair[1])
        }

        const response = await axios.post(
            "clientes/register-gerarquico",
            formData
        )
        return response.data
    } catch (error) {
        console.error("Error 400 - Detalle del Backend:", error.response?.data);
        return error.response?.data || { message: "Error de conexión" };
    }
}