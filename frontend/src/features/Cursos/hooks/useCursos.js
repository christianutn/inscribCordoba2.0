import { useState, useEffect, useCallback } from 'react';
import { getCursos, postCurso, putCurso } from '../../../services/cursos.service';
import { getPlataformasDictado } from '../../../services/plataformasDictado.service';
import { getMediosInscripcion } from '../../../services/mediosInscripcion.service';
import { getTiposCapacitacion } from '../../../services/tiposCapacitacion.service';
import { getAreas } from '../../../services/areas.service';
import { getMinisterios } from '../../../services/ministerios.service';

const useCursos = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Auxiliary data for dropdowns
    const [plataformas, setPlataformas] = useState([]);
    const [medios, setMedios] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [areas, setAreas] = useState([]);
    const [ministerios, setMinisterios] = useState([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [
                cursosRes,
                plataformasRes,
                mediosRes,
                tiposRes,
                areasRes,
                ministeriosRes
            ] = await Promise.all([
                getCursos(),
                getPlataformasDictado(),
                getMediosInscripcion(),
                getTiposCapacitacion(),
                getAreas(),
                getMinisterios()
            ]);

            setData(cursosRes);
            setPlataformas(plataformasRes);
            setMedios(mediosRes);
            setTipos(tiposRes);
            setAreas(areasRes);
            setMinisterios(ministeriosRes);
            setError(null);
        } catch (err) {
            console.error("Error fetching Cursos data:", err);
            setError(err.message || "Error al cargar los datos de Cursos.");
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
            const payload = {
                cod: newItem.cod,
                nombre: newItem.nombre,
                cupo: parseInt(newItem.cupo),
                cantidad_horas: parseInt(newItem.cantidad_horas),
                medio_inscripcion: newItem.codMedioInscripcion,
                plataforma_dictado: newItem.codPlataformaDictado,
                tipo_capacitacion: newItem.codTipoCapacitacion,
                area: newItem.codArea || null,
                tiene_evento_creado: newItem.tiene_evento_creado,
                numero_evento: newItem.numero_evento ? parseInt(newItem.numero_evento) : null,
                esta_maquetado: newItem.esta_maquetado,
                esta_configurado: newItem.esta_configurado,
                aplica_sincronizacion_certificados: newItem.aplica_sincronizacion_certificados,
                url_curso: newItem.url_curso
            };
            await postCurso(payload);
            await fetchData(); // Refresh data
            return { success: true };
        } catch (err) {
            setError(err.message || "Error al crear el curso.");
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const updateItem = async (item) => {
        setLoading(true);
        try {
            const payload = {
                cod: item.cod,
                nombre: item.nombre,
                cupo: parseInt(item.cupo),
                cantidad_horas: parseInt(item.cantidad_horas),
                medio_inscripcion: item.codMedioInscripcion,
                plataforma_dictado: item.codPlataformaDictado,
                tipo_capacitacion: item.codTipoCapacitacion,
                area: item.codArea || null,
                esVigente: item.esVigente,
                tiene_evento_creado: item.tiene_evento_creado,
                numero_evento: item.numero_evento ? parseInt(item.numero_evento) : null,
                esta_maquetado: item.esta_maquetado,
                esta_configurado: item.esta_configurado,
                aplica_sincronizacion_certificados: item.aplica_sincronizacion_certificados,
                url_curso: item.url_curso,
                esta_autorizado: item.esta_autorizado
            };
            await putCurso(payload);
            await fetchData();
            return { success: true };
        } catch (err) {
            setError(err.message || "Error al actualizar el curso.");
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const deleteItem = async (id) => {
        setLoading(true);
        try {
            //await deleteRow(id, 'Cursos');
            await fetchData();
            return { success: true };
        } catch (err) {
            setError(err.message || "Error al eliminar el curso.");
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
            plataformas,
            medios,
            tipos,
            areas,
            ministerios
        }
    };
};

export default useCursos;
