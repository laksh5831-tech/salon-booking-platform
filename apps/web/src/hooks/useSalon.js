import { useState, useEffect } from 'react';
import salonService from '../services/salonService';
import toast from 'react-hot-toast';

const useSalon = () => {
  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSalon = async () => {
      try {
        const res = await salonService.getMySalon();
        setSalon(res.data.data);
      } catch (err) {
        setError(err);
        toast.error(err.response?.data?.message || 'No salon is associated with this account');
      } finally {
        setLoading(false);
      }
    };
    fetchSalon();
  }, []);

  return { salon, loading, error };
};

export default useSalon;