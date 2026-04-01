import { useState, useEffect, useCallback } from 'react';
import { getDatosDesarrollo, postDatosDesarrollo, putDatosDesarrollo, deleteDatosDesarrollo } from '../../../services/datosDesarrollo.service';
import Swal from 'sweetalert2';

export const useDatosDesarrollo = () => {
    const [datos, setDatos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [mes, setMes] = useState('');
    const [anio, setAnio] = useState('');

    const fetchDatos = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getDatosDesarrollo(busqueda, mes, anio);
            setDatos(data);
        } catch (error) {
            console.error(error);
            Swal.fire('Error', error.message, 'error');
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
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, borrar!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await deleteDatosDesarrollo(id);
                await fetchDatos();
                Swal.fire('Borrado!', 'El registro ha sido eliminado.', 'success');
            } catch (error) {
                Swal.fire('Error', error.message, 'error');
            }
        }
    };

    return {
        datos,
        loading,
        fetchDatos,
        handleCreate,
        handleUpdate,
        handleDelete,
        busqueda,
        setBusqueda,
        mes,
        setMes,
        anio,
        setAnio
    };
};
