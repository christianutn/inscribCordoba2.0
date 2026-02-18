import { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { parseDate } from '../components/Cronograma/utils';

export const useCronogramaFilters = (cursosData, loading) => {
    const [filteredData, setFilteredData] = useState([]);
    const [ministerioFilter, setMinisterioFilter] = useState('all');
    const [areaFilter, setAreaFilter] = useState('all');
    const [nombreFilter, setNombreFilter] = useState('');
    const [monthFilter, setMonthFilter] = useState('all');
    const [activosFilterActive, setActivosFilterActive] = useState(false);
    const [asignadoFilter, setAsignadoFilter] = useState('');
    const [omitirCancelados, setOmitirCancelados] = useState(false);
    const [areaOptions, setAreaOptions] = useState(['all']);

    useEffect(() => {
        if (loading || !cursosData.length) {
            setAreaOptions(['all']);
            if (areaFilter !== 'all') setAreaFilter('all');
            return;
        }
        let relevantCourses = [];
        if (ministerioFilter === 'all') {
            relevantCourses = cursosData;
        } else {
            relevantCourses = cursosData.filter(c => c["ADM"] === ministerioFilter);
        }
        const areasSet = new Set(relevantCourses.map(c => c["Area"]).filter(Boolean));
        const newAreaOptions = ['all', ...Array.from(areasSet).sort()];
        setAreaOptions(newAreaOptions);

        if (ministerioFilter !== 'all' && !newAreaOptions.includes(areaFilter)) {
            setAreaFilter('all');
        }
    }, [ministerioFilter, cursosData, loading, areaFilter]);

    useEffect(() => {
        if (loading && cursosData.length === 0) {
            setFilteredData([]);
            return;
        };

        let data = [...cursosData];
        const today = dayjs().startOf('day');

        if (ministerioFilter !== 'all') data = data.filter(c => c["ADM"] === ministerioFilter);
        if (areaFilter !== 'all') data = data.filter(c => c["Area"] === areaFilter);
        if (nombreFilter.trim()) {
            const term = nombreFilter.trim().toLowerCase();
            data = data.filter(c => c["Nombre del curso"]?.toLowerCase().includes(term) || c["Código del curso"]?.toLowerCase().includes(term));
        }
        if (monthFilter !== 'all') {
            const targetMonth = parseInt(monthFilter, 10);
            data = data.filter(c => {
                const parsedDate = parseDate(c["Fecha inicio del curso"]);
                return parsedDate && parsedDate.month() === targetMonth;
            });
        }
        if (activosFilterActive) {
            data = data.filter(c => {
                const startDate = parseDate(c["Fecha inicio del curso"]);
                const endDate = parseDate(c["Fecha fin del curso"]);
                return startDate && endDate && startDate.isSameOrBefore(today) && endDate.isSameOrAfter(today);
            });
        }
        if (omitirCancelados) {
            data = data.filter(c => c["Estado"] !== 'CANC');
        }
        if (asignadoFilter.trim()) {
            const term = asignadoFilter.trim().toLowerCase();
            data = data.filter(c => c["Asignado"]?.toLowerCase().includes(term));
        }
        setFilteredData(data);
    }, [cursosData, ministerioFilter, areaFilter, nombreFilter, monthFilter, activosFilterActive, asignadoFilter, omitirCancelados, loading]);

    const handleClearFilters = () => {
        setMinisterioFilter('all');
        setAreaFilter('all');
        setNombreFilter('');
        setMonthFilter('all');
        setActivosFilterActive(false);
        setAsignadoFilter('');
        setOmitirCancelados(false);
    };

    const isFilterActive = useMemo(() =>
        nombreFilter || ministerioFilter !== 'all' || areaFilter !== 'all' || monthFilter !== 'all' || activosFilterActive || asignadoFilter || omitirCancelados,
        [nombreFilter, ministerioFilter, areaFilter, monthFilter, activosFilterActive, asignadoFilter, omitirCancelados]
    );

    return {
        filteredData,
        filters: {
            ministerioFilter,
            areaFilter,
            nombreFilter,
            monthFilter,
            activosFilterActive,
            asignadoFilter,
            omitirCancelados,
        },
        setFilters: {
            setMinisterioFilter,
            setAreaFilter,
            setNombreFilter,
            setMonthFilter,
            setActivosFilterActive,
            setAsignadoFilter,
            setOmitirCancelados,
        },
        areaOptions,
        handleClearFilters,
        isFilterActive,
    };
};