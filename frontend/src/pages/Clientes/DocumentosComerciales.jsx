import { useState } from "react";
import AddButton from "../../components/misc/add-button";
import Header from "../../components/misc/Header";
import { useEffect } from "react";
import { getContratosComerciales } from "../../services/documentos.service";
import ContratosTable from "./Tabs/ContratosTable";




export default function VistaDocumentosComerciales() {

    const [contratos, setContratos] = useState({})
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const obtenerContratos = async () => {

            try {
                const response = await getContratosComerciales()
                if (response.status !== "Success") {
                    throw (response || "Contratos no encontrados");
                }
                setContratos(response.data)

            } catch (error) {
                console.log(error);

            } finally {
                setLoading(false);
            }
        }
        obtenerContratos()
        console.log(contratos);

    }, [])
    if (loading) {
        return <div>Cargando...</div>;
    }
    if (error) {
        return (
            <Error404 error={error.message} status={error.status} />
        );
    }
    return (<>
        <ContratosTable contratos={contratos} noTitle isGeneral />

    </>)
}