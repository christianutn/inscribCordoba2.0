import { useState, useEffect, useCallback } from 'react';
import { getCursos } from '../../../services/cursos.service';
import { getHistoricoTutoresVigentesPorCurso, asignarNuevoRol } from '../../../services/historicoTutoresEnCurso.service';
import { getRolesDeTutor } from '../../../services/rolesDeTutor.service.js';
import { getTutores } from '../../../services/tutores.service';

const useRolTutores = () => {
    const [cursos, setCursos] = useState([]);
    const [tutoresCurso, setTutoresCurso] = useState([]);
    const [roles, setRoles] = useState([]);
    const [tutoresDisponibles, setTutoresDisponibles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingTutores, setLoadingTutores] = useState(false);
    const [error, setError] = useState(null);

    // Cargar cursos inicialmente
    const fetchCursos = useCallback(async () => {
        setLoading(true);
        try {
            const cursosRes = await getCursos();
            setCursos(cursosRes);
            setError(null);
        } catch (err) {
            console.error("Error fetching cursos:", err);
            setError(err.message || "Error al cargar los cursos.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Cargar roles disponibles
    const fetchRoles = useCallback(async () => {
        try {
            const rolesRes = await getRolesDeTutor();
            setRoles(rolesRes);
        } catch (err) {
            console.error("Error fetching roles:", err);
        }
    }, []);

    // Cargar tutores de un curso específico
    const fetchTutoresCurso = useCallback(async (codCurso) => {
        setLoadingTutores(true);
        try {
            const tutoresRes = await getHistoricoTutoresVigentesPorCurso(codCurso);
            setTutoresCurso(tutoresRes);
            return tutoresRes;
        } catch (err) {
            console.error("Error fetching tutores del curso:", err);
            setError(err.message || "Error al cargar los tutores del curso.");
            return [];
        } finally {
            setLoadingTutores(false);
        }
    }, []);

    // Cargar todos los tutores disponibles para búsqueda
    const fetchTutoresDisponibles = useCallback(async (busqueda = "") => {
        try {
            const tutoresRes = await getTutores(busqueda);
            setTutoresDisponibles(tutoresRes);
            return tutoresRes;
        } catch (err) {
            console.error("Error fetching tutores disponibles:", err);
            return [];
        }
    }, []);

    // Asignar o modificar rol de un tutor
    const asignarRol = async (tutor_cuil, curso_cod, rol_tutor_cod) => {
        setLoadingTutores(true);
        try {
            const payload = {
                tutor_cuil,
                curso_cod,
                rol_tutor_cod
            };
            await asignarNuevoRol(payload);
            // Recargar tutores del curso
            await fetchTutoresCurso(curso_cod);
            return { success: true };
        } catch (err) {
            console.error("Error asignando rol:", err);
            return { success: false, error: err.message || "Error al asignar el rol." };
        } finally {
            setLoadingTutores(false);
        }
    };

    useEffect(() => {
        fetchCursos();
        fetchRoles();
    }, [fetchCursos, fetchRoles]);

    return {
        cursos,
        tutoresCurso,
        roles,
        tutoresDisponibles,
        loading,
        loadingTutores,
        error,
        fetchTutoresCurso,
        fetchTutoresDisponibles,
        asignarRol
    };
};

export default useRolTutores;
