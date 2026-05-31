import { useEffect, useState } from "react";
import { getResumen } from "../../services/activofijo.service.js";
import { showErrorAlert } from "../../helpers/sweetAlert.js";

const useActivos = (cliente_id) => {
    const [resumen, setResumen] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchResumen = async () => {
        setError(null);
        setLoading(true);

        try{
            const respuesta = await getResumen(cliente_id);
            if(respuesta?.status === "Success" && Array.isArray(respuesta?.data)) {
                setResumen(respuesta.data);
            }else{
                throw new Error(respuesta?.message || "Estructura de datos inesperada");
            }
        }catch(error){
            console.error('Error al obtener el resumen:', error);
            showErrorAlert('Error', 'Ocurrió un problema al obtener el resumen de los clientes');
        }finally{
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResumen();
    }, [cliente_id]);

    return {resumen, loading, error, refetch: fetchResumen};
};

export default useActivos;
