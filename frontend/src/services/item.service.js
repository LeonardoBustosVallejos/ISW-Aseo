import axios from './root.service.js';
import { formatItemData } from '@helpers/formatData.js';

export async function getItems() {
    try {
        const { data } = await axios.get('/item/');
        const formattedData = data.data.map(formatItemData);
        return formattedData;
    } catch (error) {
        return error.response.data;
    }
}

export async function getItemById(id) {
    try {
        const { data } = await axios.get('/item/');
        const item = data?.data?.find((entry) => Number(entry.id) === Number(id));

        if (!item) {
            return { success: false, message: 'Item no encontrado' };
        }

        return { success: true, data: formatItemData(item) };
    } catch (error) {
        return error.response?.data || { success: false, message: 'Error al cargar el item' };
    }
}

export async function getCapacitacionesByItemId(id) {
    try {
        const { data } = await axios.get(`/capacitaciones/itemId/${id}`);
        return data;
    } catch (error) {
        return error.response?.data || { success: false, message: 'Error al cargar las capacitaciones' };
    }
}

export async function createItem(itemData) {
    try {
        const response = await axios.post('/item/create', itemData);
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || 'Error al crear item' };
    }
}

export async function updateEdit(data, id) {
    try {
        const response = await axios.patch(`/item/update/?id=${id}`, data);
        console.log(response);
        return response.data.data;
    } catch (error) {
        console.log(error);
        return error.response.data;
    }
}

export async function deleteItem(id) {
    try {
        const response = await axios.delete(`/item/delete/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting item', error);
        return error.response?.data || { success: false, message: 'Error deleting item' };
    }
}
