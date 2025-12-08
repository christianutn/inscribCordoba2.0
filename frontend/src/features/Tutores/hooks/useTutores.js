import { useState, useCallback, useEffect } from 'react';
import { getTutores, postTutores, putTutores, deleteTutor } from '../../../services/tutores.service.js';

const useTutores = () => {
    const [tutores, setTutores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTutores = useCallback(async (busqueda = "") => {
        setLoading(true);
        setError(null);
        try {
            const data = await getTutores(busqueda);
            if (Array.isArray(data)) {
                setTutores(data);
            } else {
                setTutores([]);
            }
        } catch (err) {
            console.error("Error fetching tutores:", err);
            setError(err.message || "Error al cargar los tutores");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTutores();
    }, [fetchTutores]);

    const crearTutor = async (tutorData) => {
        setLoading(true);
        try {
            await postTutores(tutorData);
            await fetchTutores();
            return { success: true };
        } catch (err) {
            setError(err.message || "Error al crear el tutor");
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const actualizarTutor = async (tutorData) => {
        setLoading(true);
        try {
            await putTutores(tutorData);
            await fetchTutores();
            return { success: true };
        } catch (err) {
            setError(err.message || "Error al actualizar el tutor");
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const eliminarTutor = async (cuil) => {
        setLoading(true);
        try {
            await deleteTutor(cuil);
            await fetchTutores();
            return { success: true };
        } catch (err) {
            setError(err.message || "Error al eliminar el tutor");
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    return {
        tutores,
        loading,
        error,
        fetchTutores,
        crearTutor,
        actualizarTutor,
        eliminarTutor
    };
};

export default useTutores;
