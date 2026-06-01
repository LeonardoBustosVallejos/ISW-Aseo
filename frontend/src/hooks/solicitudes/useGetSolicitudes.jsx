import { useState, useEffect } from 'react';
import { getSolicitudes } from '@services/solicitud.service.js';

const useSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);

  const fetchSolicitudes = async () => {
    try {
      const response = await getSolicitudes();
      setSolicitudes(response);
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  return { solicitudes, fetchSolicitudes, setSolicitudes };
};

export default useSolicitudes;
