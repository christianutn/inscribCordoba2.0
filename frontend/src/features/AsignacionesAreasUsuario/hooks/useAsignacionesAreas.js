import { useState, useEffect, useCallback } from 'react';
import {
    getAreasAsignadas,
    postAreaAsignada,

    deleteAreaAsignada
} from '../../../services/areasAsignadasUsuario.service'
import { getAreas } from '../../../services/areas.service'
const useAsignacionesAreas = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Auxiliary data
    const [areas, setAreas] = useState([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [asignacionesRes, areasRes] = await Promise.all([
                getAreasAsignadas(),
                getAreas()
            ]);

            setData(asignacionesRes);
            setAreas(areasRes);
            setError(null);
        } catch (err) {
            console.error("Error fetching Asignaciones data:", err);
            setError(err.message || "Error al cargar los datos de asignaciones.");
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
            await postAreaAsignada(newItem);
            await fetchData();
            return { success: true };
        } catch (err) {
            setError(err.message || "Error al crear la asignación.");
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const deleteItem = async (item) => {
        setLoading(true);
        try {
            // Assuming the item has cuil_usuario and cod_area
            await deleteAreaAsignada(item.cuil_usuario, item.cod_area);
            await fetchData();
            return { success: true };
        } catch (err) {
            setError(err.message || "Error al eliminar la asignación.");
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
        deleteItem,
        auxiliaryData: {
            areas
        }
    };
};

export default useAsignacionesAreas;
