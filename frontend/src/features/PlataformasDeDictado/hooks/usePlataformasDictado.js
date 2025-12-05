import { useState, useEffect, useCallback } from 'react';
import { getPlataformasDictado, postPlataformaDictado, putPlataformaDictado, deletePlataformaDictado } from '../../../services/plataformasDictado.service';

const usePlataformasDictado = () => {
    const [plataformas, setPlataformas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPlataformas = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getPlataformasDictado();
            setPlataformas(data);
        } catch (err) {
            setError(err.message || 'Error al cargar plataformas de dictado');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlataformas();
    }, [fetchPlataformas]);

    const createPlataforma = async (plataforma) => {
        setLoading(true);
        setError(null);
        try {
            await postPlataformaDictado(plataforma);
            await fetchPlataformas();
            return true;
        } catch (err) {
            setError(err.message || 'Error al crear plataforma de dictado');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updatePlataforma = async (plataforma) => {
        setLoading(true);
        setError(null);
        try {
            await putPlataformaDictado(plataforma);
            await fetchPlataformas();
            return true;
        } catch (err) {
            setError(err.message || 'Error al actualizar plataforma de dictado');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deletePlataforma = async (cod) => {
        setLoading(true);
        setError(null);
        try {
            await deletePlataformaDictado(cod);
            await fetchPlataformas();
            return true;
        } catch (err) {
            setError(err.message || 'Error al eliminar plataforma de dictado');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        plataformas,
        loading,
        error,
        fetchPlataformas,
        createPlataforma,
        updatePlataforma,
        deletePlataforma
    };
};

export default usePlataformasDictado;
