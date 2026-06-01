import { useState } from 'react';
import { updateEdit } from '@services/item.service.js';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';
import { formatItemPostUpdate } from '@helpers/formatData.js';

const useEditItems = (setItems) => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [dataItems, setDataItems] = useState([]);
    
    const handleClickUpdate = () => {
        if (dataItems.length > 0) {
            setIsPopupOpen(true);
        }
    };

    const handleUpdate = async (updatedItemData) => {
        if (updatedItemData) {
            try {
            const updatedItem = await updateEdit(updatedItemData, dataItems[0].id);
            showSuccessAlert('¡Actualizado!','El item ha sido actualizado correctamente.');
            setIsPopupOpen(false);
            const formattedItem = formatItemPostUpdate(updatedItem);

            setItems(prevItems => prevItems.map(item => {
                console.log("Item actual:", item);
                if (item.id === formattedItem.id) {
                    console.log("Reemplazando con:", formattedItem);
                }
                return item.name === formattedItem.name ? formattedItem : item;
            }));
            

            setDataItems([]);
            } catch (error) {
                console.error('Error al actualizar el item:', error);
                showErrorAlert('Cancelado','Ocurrió un error al actualizar el item.');
            }
        }
    };

    return {
        handleClickUpdate,
        handleUpdate,
        isPopupOpen,
        setIsPopupOpen,
        dataItems,
        setDataItems
    };
};

export default useEditItems;