import axios from './root.service.js';

export async function createItemSede(itemSedeData) {
  try {
    const { data } = await axios.post('/item-sede/create/', itemSedeData);
    return {
      success: true,
      data: data?.data || data,
      message: data?.message || 'Item_sede creado correctamente'
    };
  } catch (error) {
    console.error('Error creating item_sede', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Error al crear el item_sede'
    };
  }
}

export async function getItemSedes() {
  try {
    const { data } = await axios.get('/item-sede/');
    return data.data || [];
  } catch (error) {
    console.error('Error fetching item_sede', error);
    return [];
  }
}
