import { useState, useEffect, useCallback } from 'react';
import { getMinisterios, postMinisterios, putMinisterios } from '../../../services/ministerios.service';

const useMinisterios = () => {
    const [ministerios, setMinisterios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMinisterios = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMinisterios();
            setMinisterios(data);
        } catch (err) {
            setError(err.message || 'Error al cargar ministerios');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMinisterios();
    }, [fetchMinisterios]);

    const createMinisterio = async (ministerio) => {
        setLoading(true);
        setError(null);
        try {
            await postMinisterios(ministerio);
            await fetchMinisterios();
            return true;
        } catch (err) {
            setError(err.message || 'Error al crear ministerio');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateMinisterio = async (ministerio) => {
        setLoading(true);
        setError(null);
        try {
            await putMinisterios(ministerio);
            await fetchMinisterios();
            return true;
        } catch (err) {
            setError(err.message || 'Error al actualizar ministerio');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        ministerios,
        loading,
        error,
        fetchMinisterios,
        createMinisterio,
        updateMinisterio
    };
};

export default useMinisterios;
