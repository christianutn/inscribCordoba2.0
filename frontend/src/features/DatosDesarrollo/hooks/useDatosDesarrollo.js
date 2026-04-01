import { useState, useEffect, useCallback } from 'react';
import {
    getDatosDesarrollo,
    postDatosDesarrollo,
    putDatosDesarrollo,
    deleteDatosDesarrollo
} from '../../../services/datosDesarrollo.service';
import { getUsuarios } from '../../../services/usuarios.service';

const useDatosDesarrollo = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Auxiliary data
    const [usuarios, setUsuarios] = useState([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [datosRes, usuariosRes] = await Promise.all([
                getDatosDesarrollo(),
                getUsuarios()
            ]);

            setData(datosRes);
            setUsuarios(usuariosRes);
            setError(null);
        } catch (err) {
            console.error("Error fetching Datos Desarrollo:", err);
            setError(err.message || "Error al cargar los datos de desarrollo.");
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
            await postDatosDesarrollo(newItem);
            await fetchData();
            return { success: true };
        } catch (err) {
            setError(err.message || "Error al crear el registro.");
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const updateItem = async (id, item) => {
        setLoading(true);
        try {
            await putDatosDesarrollo(id, item);
            await fetchData();
            return { success: true };
        } catch (err) {
            setError(err.message || "Error al actualizar el registro.");
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const deleteItem = async (id) => {
        setLoading(true);
        try {
            await deleteDatosDesarrollo(id);
            await fetchData();
            return { success: true };
        } catch (err) {
            setError(err.message || "Error al eliminar el registro.");
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
            usuarios
        }
    };
};

export default useDatosDesarrollo;
