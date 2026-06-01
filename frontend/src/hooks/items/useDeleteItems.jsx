import { deleteItem } from '@services/item.service.js';
import { deleteDataAlert, showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';

const useDeleteItem = (fetchItems, setDataItem) => {
    const handleDelete = async (dataItem) => {
        if (dataItem.length > 0) {
            try {
                const result = await deleteDataAlert();
            if (result.isConfirmed) {
                const response = await deleteItem(dataItem[0].id);
                if(response.status === 'Client error') {
                    return showErrorAlert('Error', response.details);
                }
                showSuccessAlert('¡Eliminado!','El item ha sido eliminado correctamente.');
                await fetchItems();
                setDataItem([]);
            } else {
                showErrorAlert('Cancelado', 'La operación ha sido cancelada.');
            }
            } catch (error) {
                console.error('Error al eliminar el item:', error);
                showErrorAlert('Cancelado', 'Ocurrió un error al eliminar el item.');
            }
        }
    };

    return {
        handleDelete
    };
};

export default useDeleteItem;