import { useState, useEffect, useCallback } from 'react';
import { getInstancias } from '../services/instancias.service';
import { getUsuarios } from '../services/usuarios.service';
import { getEstadosInstancia } from '../services/estadosInstancia.service';
import { getCursos } from '../services/cursos.service';
import { getDepartamentos } from '../services/departamentos.service';
import { formatValue, formatBooleanToSiNo } from '../components/Cronograma/utils';

export const useCronogramaData = () => {
    const [cursosData, setCursosData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [allUsers, setAllUsers] = useState([]);
    const [adminUsers, setAdminUsers] = useState([]);
    const [allEstados, setAllEstados] = useState([]);
    const [allCursos, setAllCursos] = useState([]);
    const [allDepartamentos, setAllDepartamentos] = useState([]);
    const [ministerioOptions, setMinisterioOptions] = useState(['all']);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [instanciasData, usuariosData, estadosData, cursos, departamentos] = await Promise.all([
                getInstancias(), getUsuarios(), getEstadosInstancia(), getCursos(), getDepartamentos()
            ]);

            if (!Array.isArray(instanciasData)) throw new Error("Datos de instancias no válidos.");
            if (!Array.isArray(usuariosData)) throw new Error("Datos de usuarios no válidos.");
            if (!Array.isArray(estadosData)) throw new Error("Datos de estados no válidos.");
            if (!Array.isArray(cursos)) throw new Error("Datos de cursos no válidos.");
            if (!Array.isArray(departamentos)) throw new Error("Datos de departamentos no válidos.");

            setAllUsers(usuariosData);
            setAllEstados(estadosData);
            setAllCursos(cursos);
            setAllDepartamentos(departamentos);
            
            const filteredAdminUsers = usuariosData.filter(user => user.rol === 'ADM');
            setAdminUsers(filteredAdminUsers);

            const usersMap = new Map(usuariosData.map(u => [u.cuil, `${u.detalle_persona?.nombre || ''} ${u.detalle_persona?.apellido || ''}`.trim()]));
            const admSet = new Set();

            const dataObjs = instanciasData.map((instancia, idx) => {
                const detalle = instancia.detalle_curso || {};
                const areaDetalle = detalle.detalle_area || {};
                const ministerioDetalle = areaDetalle.detalle_ministerio || {};
                const admValue = formatValue(ministerioDetalle.nombre);
                if (admValue) admSet.add(admValue);

                let autogestionadoVal = instancia.es_autogestionado;
                if (autogestionadoVal === null && detalle.es_autogestionado !== null) {
                    autogestionadoVal = detalle.es_autogestionado;
                }

                const asignadoCuil = formatValue(instancia.asignado);
                const asignadoNombreCompleto = usersMap.get(asignadoCuil) || asignadoCuil || 'No asignado';

                return {
                    id: idx,
                    originalInstancia: instancia,
                    "Asignado": asignadoNombreCompleto,
                    "ADM": admValue,
                    "Area": formatValue(areaDetalle.nombre),
                    "Código del curso": formatValue(instancia.curso || detalle.cod),
                    "Nombre del curso": formatValue(detalle.nombre),
                    "Fecha inicio del curso": formatValue(instancia.fecha_inicio_curso),
                    "Fecha fin del curso": formatValue(instancia.fecha_fin_curso),
                    "Es Autogestionado": formatBooleanToSiNo(autogestionadoVal),
                    "Estado": formatValue(instancia.estado_instancia)
                };
            });

            setCursosData(dataObjs);
            setMinisterioOptions(['all', ...Array.from(admSet).sort()]);
        } catch (err) {
            console.error("Error loading data:", err);
            setError(err.message || "Error al cargar datos.");
            setCursosData([]);
            setMinisterioOptions(['all']);
            setAllUsers([]);
            setAdminUsers([]);
            setAllEstados([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        cursosData,
        loading,
        error,
        fetchData,
        allUsers,
        adminUsers,
        allEstados,
        allCursos,
        allDepartamentos,
        ministerioOptions,
        setError,
        setLoading
    };
};