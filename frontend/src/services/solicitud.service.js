import axios from './root.service.js';

export async function createSolicitud(solicitudData) {
  try {
    const { data } = await axios.post('/solicitud/create/', solicitudData);
    return {
      success: true,
      data: data?.data || data,
      message: data?.message || 'Solicitud creada correctamente'
    };
  } catch (error) {
    console.error('Error creating solicitud', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Error al crear la solicitud'
    };
  }
}

export async function getSolicitudes() {
  try {
    const { data } = await axios.get('/solicitud/');
    return data.data || [];
  } catch (error) {
    console.error('Error fetching solicitudes', error);
    return [];
  }
}

export async function updateSolicitud(id, solicitudData) {
  try {
    const { data } = await axios.put(`/solicitud/update/${id}`, solicitudData);
    return {
      success: true,
      data: data?.data || data,
      message: data?.message || 'Solicitud actualizada correctamente'
    };
  } catch (error) {
    console.error('Error updating solicitud', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Error al actualizar la solicitud'
    };
  }
}

export async function getSolicitudById(id) {
  try {
    const solicitudes = await getSolicitudes();

    if (!Array.isArray(solicitudes)) {
      return { success: false, message: 'No se pudieron cargar las solicitudes' };
    }

    const solicitud = solicitudes.find((item) => String(item.id_solicitud) === String(id));

    if (!solicitud) {
      return { success: false, message: 'Solicitud no encontrada' };
    }

    return { success: true, data: solicitud };
  } catch (error) {
    console.error('Error fetching solicitud', error);
    return { success: false, message: error.message || 'Error al cargar la solicitud' };
  }
}
