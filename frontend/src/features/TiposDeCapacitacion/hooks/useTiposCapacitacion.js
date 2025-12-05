import { useState, useEffect, useCallback } from 'react';
import { getTiposCapacitacion, postTiposCapacitacion, putTiposCapacitacion, deleteTiposCapacitacion } from '../../../services/tiposCapacitacion.service';

const useTiposCapacitacion = () => {
    const [tipos, setTipos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTipos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getTiposCapacitacion();
            setTipos(data);
        } catch (err) {
            setError(err.message || 'Error al cargar tipos de capacitación');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTipos();
    }, [fetchTipos]);

    const createTipo = async (tipo) => {
        setLoading(true);
        setError(null);
        try {
            await postTiposCapacitacion(tipo);
            await fetchTipos();
            return true;
        } catch (err) {
            setError(err.message || 'Error al crear tipo de capacitación');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateTipo = async (tipo) => {
        setLoading(true);
        setError(null);
        try {
            await putTiposCapacitacion(tipo);
            await fetchTipos();
            return true;
        } catch (err) {
            setError(err.message || 'Error al actualizar tipo de capacitación');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deleteTipo = async (cod) => {
        setLoading(true);
        setError(null);
        try {
            await deleteTiposCapacitacion(cod);
            await fetchTipos();
            return true;
        } catch (err) {
            setError(err.message || 'Error al eliminar tipo de capacitación');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        tipos,
        loading,
        error,
        fetchTipos,
        createTipo,
        updateTipo,
        deleteTipo
    };
};

export default useTiposCapacitacion;
