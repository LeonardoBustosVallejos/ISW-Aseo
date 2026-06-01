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
