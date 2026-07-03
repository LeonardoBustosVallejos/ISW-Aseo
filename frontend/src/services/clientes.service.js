import axios from './root.service.js';

export async function listarClientesTope() {
    try {
        const response = await axios.get("/clientes")
        return response.data
    } catch (error) {
        return error.response?.data || { message: "Error de conexión" };
    }
}

export async function getInfoCliente(cliente_id, rutCliente) {
    try {
        const response = await axios.get(`/clientes/${rutCliente}/${cliente_id}`)

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

        const anexosLimpios = data.anexos.map(anexo => ({
            ...anexo,
            documentos: (anexo.documentos || []).map(doc => ({
                nombrePersonalizado: doc.nombrePersonalizado,
                tipoDocumento: doc.tipoDocumento,
                fileKey: doc.fileKey
            }))
        }))

        formData.append(
            "anexos",
            JSON.stringify(anexosLimpios)
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

export async function updateSede(sede_id, data) {
    try {

        console.log(data);
        const { rutSecundario, nombre_sede, direccion, personalSolicitado, tipoSede, contactos } = data
        const body = { rutSecundario, nombre_sede, direccion, personalSolicitado, tipoSede, contactos }
        const response = await axios.patch(`/clientes/update/sede/${sede_id}`, body)

        return response.data
    } catch (error) {
        console.error("Error 400 - Detalle del Backend:", error.response?.data);
        return error.response?.data || { message: "Error de conexión" };
    }
}