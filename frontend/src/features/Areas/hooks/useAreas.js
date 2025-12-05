import { useState, useEffect, useCallback } from 'react';
import { getAreas, postArea, putArea, deleteArea } from '../../../services/areas.service';
import { getMinisterios } from '../../../services/ministerios.service';

const useAreas = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Auxiliary data
    const [ministerios, setMinisterios] = useState([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [areasRes, ministeriosRes] = await Promise.all([
                getAreas(),
                getMinisterios()
            ]);

            setData(areasRes);
            setMinisterios(ministeriosRes);
            setError(null);
        } catch (err) {
            console.error("Error fetching Areas data:", err);
            setError(err.message || "Error al cargar los datos de Áreas.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const createItem = async (newItem) => {
        setLoading(true);
        try {
            await postArea(newItem);
            await fetchData();
            return { success: true };
        } catch (err) {
            setError(err.message || "Error al crear el área.");
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const updateItem = async (item) => {
        setLoading(true);
        try {
            await putArea(item);
            await fetchData();
            return { success: true };
        } catch (err) {
            setError(err.message || "Error al actualizar el área.");
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const deleteItem = async (cod) => {
        setLoading(true);
        try {
            await deleteArea(cod);
            await fetchData();
            return { success: true };
        } catch (err) {
            setError(err.message || "Error al eliminar el área.");
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        loading,
        error,
        createItem,
        updateItem,
        deleteItem,
        auxiliaryData: {
            ministerios
        }
    };
};

export default useAreas;
