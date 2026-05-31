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