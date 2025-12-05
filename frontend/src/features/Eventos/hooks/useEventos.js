import { useState, useEffect, useCallback } from 'react';
import { getEventos, putEvento, deleteEvento } from '../../../services/evento.service';
import { getPerfiles } from '../../../services/perfiles.service';
import { getAreasTematicas } from '../../../services/areasTematicas.service';
import { getTiposCertificaciones } from '../../../services/tiposCertificaciones.service';

const useEventos = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Auxiliary data for dropdowns
    const [perfiles, setPerfiles] = useState([]);
    const [areasTematicas, setAreasTematicas] = useState([]);
    const [tiposCertificacion, setTiposCertificacion] = useState([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [
                eventosRes,
                perfilesRes,
                areasTematicasRes,
                tiposCertificacionRes
            ] = await Promise.all([
                getEventos(),
                getPerfiles(),
                getAreasTematicas(),
                getTiposCertificaciones()
            ]);

            setData(eventosRes);
            setPerfiles(perfilesRes);
            setAreasTematicas(areasTematicasRes);
            setTiposCertificacion(tiposCertificacionRes);
            setError(null);
        } catch (err) {
            console.error("Error fetching Eventos data:", err);
            setError(err.message || "Error al cargar los datos de Eventos.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateItem = async (item) => {
        setLoading(true);
        try {
            const payload = {
                curso: item.curso,
                perfil: item.perfil,
                area_tematica: item.area_tematica,
                tipo_certificacion: item.tipo_certificacion,
                presentacion: item.presentacion,
                objetivos: item.objetivos,
                requisitos_aprobacion: item.requisitos_aprobacion,
                ejes_tematicos: item.ejes_tematicos,
                certifica_en_cc: item.certifica_en_cc,
                disenio_a_cargo_cc: item.disenio_a_cargo_cc
            };
            console.log("Payload to putEvento:", payload);
            await putEvento(payload);
            await fetchData();
            return { success: true };
        } catch (err) {
            setError(err.message || "Error al actualizar el evento.");
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const deleteItem = async (curso) => {
        setLoading(true);
        try {
            await deleteEvento(curso);
            await fetchData();
            return { success: true };
        } catch (err) {
            setError(err.message || "Error al eliminar el evento.");
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        loading,
        error,
        updateItem,
        deleteItem,
        refreshData: fetchData,
        auxiliaryData: {
            perfiles,
            areasTematicas,
            tiposCertificacion
        }
    };
};

export default useEventos;
