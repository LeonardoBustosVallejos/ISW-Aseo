import { useState, useEffect } from 'react';
import { getStockBodega } from '@services/activoFijo.service.js';

const useGetStockBodega = () => {
    const [stockActivos, setStockActivos] = useState([]);
    const [loading, setLoading] = useState(true);
    const fetchStock = async () => {
        setLoading(true);
        try {
            const data = await getStockBodega();
            setStockActivos(data);
        } catch (error) {
            console.error("Error cargando el stock de bodega", error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchStock();
    }, []);

    return { stockActivos, loading, fetchStock };
};

export default useGetStockBodega;