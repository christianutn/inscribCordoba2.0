import { useState, useEffect, useCallback } from 'react';
import { getDatosDesarrollo, postDatosDesarrollo, putDatosDesarrollo, deleteDatosDesarrollo } from '../../../services/datosDesarrollo.service';

export const useDatosDesarrollo = () => {
    const [datos, setDatos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [mes, setMes] = useState('');
    const [anio, setAnio] = useState('');
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

    const fetchDatos = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getDatosDesarrollo(busqueda, mes, anio);
            setDatos(data);
        } catch (error) {
            console.error(error);
            setAlert({ open: true, message: error.message || 'Error al cargar los datos', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [busqueda, mes, anio]);

    useEffect(() => {
        fetchDatos();
    }, [fetchDatos]);

    const handleCreate = async (nuevo) => {
        try {
            await postDatosDesarrollo(nuevo);
            await fetchDatos();
        } catch (error) {
            throw error;
        }
    };

    const handleUpdate = async (id, actualizado) => {
        try {
            await putDatosDesarrollo(id, actualizado);
            await fetchDatos();
        } catch (error) {
            throw error;
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteDatosDesarrollo(id);
            await fetchDatos();
            setAlert({ open: true, message: 'El registro ha sido eliminado correctamente.', severity: 'success' });
        } catch (error) {
            setAlert({ open: true, message: error.message || 'Error al eliminar el registro', severity: 'error' });
        }
    };

    return {
        datos,
        loading,
        fetchDatos,
        handleCreate,
        handleUpdate,
        handleDelete,
        alert,
        setAlert,
        busqueda,
        setBusqueda,
        mes,
        setMes,
        anio,
        setAnio
    };
};
