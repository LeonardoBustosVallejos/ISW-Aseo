import axios from './root.service.js';

export async function getSolicitudes() {
  try {
    const { data } = await axios.get('/solicitud/');
    return data.data || [];
  } catch (error) {
    console.error('Error fetching solicitudes', error);
    return [];
  }
}
