import { useState, useEffect, useCallback } from 'react';
import { getMediosInscripcion, postMedioInscripcion, putMedioInscripcion, deleteMedioInscripcion } from '../../../services/mediosInscripcion.service';

const useMediosInscripcion = () => {
    const [medios, setMedios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMedios = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMediosInscripcion();
            setMedios(data);
        } catch (err) {
            setError(err.message || 'Error al cargar medios de inscripción');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMedios();
    }, [fetchMedios]);

    const createMedio = async (medio) => {
        setLoading(true);
        setError(null);
        try {
            await postMedioInscripcion(medio);
            await fetchMedios();
            return true;
        } catch (err) {
            setError(err.message || 'Error al crear medio de inscripción');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateMedio = async (medio) => {
        setLoading(true);
        setError(null);
        try {
            await putMedioInscripcion(medio);
            await fetchMedios();
            return true;
        } catch (err) {
            setError(err.message || 'Error al actualizar medio de inscripción');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deleteMedio = async (cod) => {
        setLoading(true);
        setError(null);
        try {
            await deleteMedioInscripcion(cod);
            await fetchMedios();
            return true;
        } catch (err) {
            setError(err.message || 'Error al eliminar medio de inscripción');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        medios,
        loading,
        error,
        fetchMedios,
        createMedio,
        updateMedio,
        deleteMedio
    };
};

export default useMediosInscripcion;
