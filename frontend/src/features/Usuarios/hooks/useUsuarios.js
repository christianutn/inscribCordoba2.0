import { useState, useEffect, useCallback } from 'react';
import { getUsuarios } from '../../../services/usuarios.service';
import { getAreas } from '../../../services/areas.service';
import { getRoles } from '../../../services/roles.service';
import { postUser, putUsuarios } from '../../../services/usuarios.service.js'


const useUsuarios = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Auxiliary data
    const [areas, setAreas] = useState([]);
    const [roles, setRoles] = useState([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [usuariosRes, areasRes, rolesRes] = await Promise.all([
                getUsuarios(),
                getAreas(),
                getRoles()
            ]);

            setData(usuariosRes);
            setAreas(areasRes);
            setRoles(rolesRes);
            setError(null);
        } catch (err) {
            console.error("Error fetching Usuarios data:", err);
            setError(err.message || "Error al cargar los datos de Usuarios.");
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
            await postUser(newItem);
            await fetchData();
            return { success: true };
        } catch (err) {
            setError(err.message || "Error al crear el usuario.");
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const updateItem = async (item) => {
        setLoading(true);
        try {
            await putUsuarios(item);
            await fetchData();
            return { success: true };
        } catch (err) {
            setError(err.message || "Error al actualizar el usuario.");
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
        auxiliaryData: {
            areas,
            roles
        }
    };
};

export default useUsuarios;
