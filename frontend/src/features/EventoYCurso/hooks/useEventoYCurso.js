import { useState, useEffect, useCallback } from 'react';
import { getCursosConEventos, deleteEvento, putEventoYCurso, postEvento } from '../../../services/evento.service';
import { getPerfiles } from '../../../services/perfiles.service';
import { getAreasTematicas } from '../../../services/areasTematicas.service';
import { getTiposCertificaciones } from '../../../services/tiposCertificaciones.service';
import { getPlataformasDictado } from '../../../services/plataformasDictado.service';
import { getMediosInscripcion } from '../../../services/mediosInscripcion.service';
import { getTiposCapacitacion } from '../../../services/tiposCapacitacion.service';
import { getAreas } from '../../../services/areas.service';
import { putCurso } from '../../../services/cursos.service';

const useEventoYCurso = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Datos auxiliares del Evento
    const [perfiles, setPerfiles] = useState([]);
    const [areasTematicas, setAreasTematicas] = useState([]);
    const [tiposCertificacion, setTiposCertificacion] = useState([]);

    // Datos auxiliares del Curso
    const [plataformas, setPlataformas] = useState([]);
    const [medios, setMedios] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [areas, setAreas] = useState([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [
                cursosConEventosRes,
                perfilesRes,
                areasTematicasRes,
                tiposCertificacionRes,
                plataformasRes,
                mediosRes,
                tiposRes,
                areasRes
            ] = await Promise.all([
                getCursosConEventos(),
                getPerfiles(),
                getAreasTematicas(),
                getTiposCertificaciones(),
                getPlataformasDictado(),
                getMediosInscripcion(),
                getTiposCapacitacion(),
                getAreas()
            ]);

            setData(cursosConEventosRes);
            setPerfiles(perfilesRes);
            setAreasTematicas(areasTematicasRes);
            setTiposCertificacion(tiposCertificacionRes);
            setPlataformas(plataformasRes);
            setMedios(mediosRes);
            setTipos(tiposRes);
            setAreas(areasRes);
            setError(null);
        } catch (err) {
            console.error("Error fetching Cursos con Eventos data:", err);
            setError(err.message || "Error al cargar los datos.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    /**
     * Actualiza un item. Decide automáticamente si:
     * - Tiene evento: actualiza evento + curso (PUT /eventos/:curso)
     * - No tiene evento y se proporcionan datos de evento: crea evento (POST) + actualiza curso
     * - No tiene evento y no se proporcionan datos de evento: solo actualiza curso (PUT /cursos)
     */
    const updateItem = async (item) => {
        setLoading(true);
        try {
            const tieneEvento = item.tieneEvento;
            const tieneNuevosDatosEvento = item.perfil && item.area_tematica && item.tipo_certificacion;

            if (tieneEvento) {
                // Caso 1: El curso ya tiene evento → actualizar ambos
                const payload = {
                    // Campos del Curso
                    curso: item.curso,
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
                    esta_autorizado: item.esta_autorizado,
                    // Campos del Evento
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

                await putEventoYCurso(payload);
            } else if (tieneNuevosDatosEvento) {
                // Caso 2: No tiene evento pero se completaron datos de evento → crear evento + actualizar curso
                // Primero creamos el evento
                await postEvento({
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
                });

                // Luego actualizamos el curso
                await putCurso({
                    cod: item.curso,
                    nombre: item.nombre,
                    cupo: parseInt(item.cupo),
                    cantidad_horas: parseInt(item.cantidad_horas),
                    medio_inscripcion: item.codMedioInscripcion,
                    plataforma_dictado: item.codPlataformaDictado,
                    tipo_capacitacion: item.codTipoCapacitacion,
                    area: item.codArea || null,
                    esVigente: item.esVigente,
                    tiene_evento_creado: 1,
                    numero_evento: item.numero_evento ? parseInt(item.numero_evento) : null,
                    esta_maquetado: item.esta_maquetado,
                    esta_configurado: item.esta_configurado,
                    aplica_sincronizacion_certificados: item.aplica_sincronizacion_certificados,
                    url_curso: item.url_curso,
                    esta_autorizado: item.esta_autorizado
                });
            } else {
                // Caso 3: No tiene evento y no se completaron datos de evento → solo actualizar curso
                await putCurso({
                    cod: item.curso,
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
                });
            }

            await fetchData();
            return { success: true };
        } catch (err) {
            setError(err.message || "Error al actualizar.");
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
            // Evento
            perfiles,
            areasTematicas,
            tiposCertificacion,
            // Curso
            plataformas,
            medios,
            tipos,
            areas
        }
    };
};

export default useEventoYCurso;
