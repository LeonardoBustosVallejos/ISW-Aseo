import { useState, useEffect } from 'react';
import { getItems } from '@services/item.service.js';

const useItems = () => {
    const [items, setItems] = useState([]);

    const fetchItems = async () => {
        try {
            const response = await getItems();
            //anteriormente, aquí trate de copiar el método de useGetUsers tributo a atributo
            //resultó que lo que en verdad hacía falta era configurar setItems como response
            setItems(response);
        } catch (error) {
            console.error('Error: ', error);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    return { items, fetchItems, setItems };
};

export default useItems;