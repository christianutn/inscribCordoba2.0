import React, { useEffect, useState, useMemo } from "react";
import { getInstancias } from "../services/instancias.service";
import {
    Box,
    CircularProgress, Typography, Alert, Paper, Grid,
    Card, CardContent, Divider, List, ListItem, ListItemIcon, ListItemText,
    FormControl, InputLabel, Select, MenuItem,
    Button
} from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import PeopleIcon from '@mui/icons-material/People';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import dayjs from 'dayjs';

ChartJS.register(
    CategoryScale, LinearScale, BarElement, LineElement, PointElement,
    Title, Tooltip, Legend, Filler,
    ChartDataLabels
);

const parseDateString = (dateString) => {
    if (!dateString || typeof dateString !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return null;
    }
    try {
        const [year, month, day] = dateString.split('-').map(Number);
        if (month < 1 || month > 12 || day < 1 || day > 31) { return null; }
        const date = new Date(Date.UTC(year, month - 1, day)); // Use Date.UTC
        if (isNaN(date.getTime()) || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
            return null;
        }
        return date; // Devuelve un objeto Date de JavaScript
    } catch (e) {
        console.error("Error parsing date:", dateString, e);
        return null;
    }
};

// Helper para convertir objeto Date de JS a Dayjs y verificar validez
const getValidDayjsObject = (dateString) => {
    const jsDate = parseDateString(dateString);
    if (jsDate) {
        const djsObject = dayjs(jsDate); // Convierte el objeto Date de JS a Dayjs
        return djsObject.isValid() ? djsObject : null;
    }
    return null;
};


const mesesAbrev = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const mesesFull = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const encontrarMesPico = (data, field) => {
    if (!data || data.length === 0) return 'N/A';
    let maxVal = -Infinity;
    let mes = 'N/A';
    data.forEach(item => {
        const currentVal = Number(item[field]);
        if (!isNaN(currentVal) && currentVal > maxVal) {
            maxVal = currentVal;
            mes = item.mesNombre;
        }
    });
    return maxVal > 0 && mes !== 'N/A' ? `${mes} (${maxVal.toFixed(0)})` : (mes !== 'N/A' ? mes : 'N/A');
};

function KpiCard({ title, value, icon, color = 'primary', description }) {
    const IconComponent = icon;
    return (
        <Card elevation={3} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <>
                        {IconComponent && (
                            <Box component="span" sx={{ mr: 1.5, display: 'flex', alignItems: 'center', color: theme => theme.palette[color]?.main ?? theme.palette.primary.main }}>
                                {React.cloneElement(IconComponent, { fontSize: 'large' })}
                            </Box>
                        )}
                        <Typography variant="h6" component="div" color="text.secondary" sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                            {title}
                        </Typography>
                    </>
                </Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1, fontSize: '1.8rem' }}>
                    {value}
                </Typography>
                {description && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {description}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}

const ReporteCursosCC = () => {
    const [rawCronogramaData, setRawCronogramaData] = useState([]);
    const [filteredCronogramaData, setFilteredCronogramaData] = useState([]);
    const [allMonthsData, setAllMonthsData] = useState([]);
    const [allMinisterios, setAllMinisterios] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [selectedMinisterio, setSelectedMinisterio] = useState('all');
    const [selectedArea, setSelectedArea] = useState('all');
    const [availableAreas, setAvailableAreas] = useState(['all']);
    const [displayChartData, setDisplayChartData] = useState(null);
    const [displayKpiData, setDisplayKpiData] = useState(null);
    const [displaySummaryData, setDisplaySummaryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // const currentYear = new Date().getFullYear();
    const currentYear = selectedYear;
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            setRawCronogramaData([]);
            setFilteredCronogramaData([]);
            setAllMinisterios([]);
            setAvailableAreas(['all']);
            setAllMonthsData([]);
            setDisplayChartData(null);
            setDisplayKpiData(null);
            setDisplaySummaryData(null);
            setSelectedMonth('all');
            setSelectedMinisterio('all');
            setSelectedArea('all');

            try {
                const instanciasData = await getInstancias();
                if (!Array.isArray(instanciasData)) {
                    throw new Error("La respuesta de getInstancias no es un array.");
                }
                setRawCronogramaData(instanciasData);

                if (instanciasData.length > 0) {
                    const ministeriosSet = new Set();
                    instanciasData.forEach(instancia => {
                        const ministerio = instancia.detalle_curso?.detalle_area?.detalle_ministerio?.nombre?.trim();
                        if (ministerio) ministeriosSet.add(ministerio);
                    });
                    setAllMinisterios(['all', ...Array.from(ministeriosSet).sort()]);
                } else {
                    setAllMinisterios(['all']);
                }
            } catch (err) {
                console.error("Error en fetchData:", err);
                setError(err.message || "Ocurrió un error desconocido al obtener datos.");
                setRawCronogramaData([]);
                setAllMinisterios(['all']);
                setAvailableAreas(['all']);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!rawCronogramaData || rawCronogramaData.length === 0) {
            setAvailableAreas(['all']);
            if (selectedArea !== 'all') setSelectedArea('all');
            return;
        }

        if (selectedMinisterio === 'all') {
            setAvailableAreas(['all']);
            if (selectedArea !== 'all') setSelectedArea('all');
        } else {
            const areasSet = new Set();
            rawCronogramaData.forEach(instancia => {
                const ministerioNombre = instancia.detalle_curso?.detalle_area?.detalle_ministerio?.nombre;
                if (ministerioNombre === selectedMinisterio) {
                    const areaNombre = instancia.detalle_curso?.detalle_area?.nombre?.trim();
                    if (areaNombre) areasSet.add(areaNombre);
                }
            });
            const newAvailableAreas = ['all', ...Array.from(areasSet).sort()];
            setAvailableAreas(newAvailableAreas);
            if (!newAvailableAreas.includes(selectedArea)) {
                setSelectedArea('all');
            }
        }
    }, [selectedMinisterio, rawCronogramaData, selectedArea]);

    useEffect(() => {
        if (loading || !rawCronogramaData || rawCronogramaData.length === 0) {
            setFilteredCronogramaData([]);
            return;
        }
        const filtered = rawCronogramaData.filter(instancia => {
            const ministerioNombre = instancia.detalle_curso?.detalle_area?.detalle_ministerio?.nombre;
            const areaNombre = instancia.detalle_curso?.detalle_area?.nombre;

            const ministerioMatch = selectedMinisterio === 'all' || (ministerioNombre === selectedMinisterio);
            const areaMatch = selectedArea === 'all' || (areaNombre === selectedArea);
            return ministerioMatch && areaMatch;
        });
        setFilteredCronogramaData(filtered);
    }, [rawCronogramaData, selectedMinisterio, selectedArea, loading]);

    useEffect(() => {
        if (loading || filteredCronogramaData == null) {
            setAllMonthsData([]);
            return;
        }

        const summaryData = [];
        for (let mesIndex = 0; mesIndex < 12; mesIndex++) {
            let cursosPorMes = 0, cursosActivosAnteriores = 0, plataformaExterna = 0, canceladosSuspendidos = 0, autogestionados = 0;
            let participantesPorMes = 0;

            filteredCronogramaData.forEach(instancia => {
                if (!instancia || typeof instancia !== 'object') return;

                const fechaInicioCursoStr = instancia.fecha_inicio_curso;
                const fechaFinCursoStr = instancia.fecha_fin_curso;
                const estadoCurso = (instancia.estado_instancia || "").toUpperCase().trim();

                const esAutogestionadoInstancia = instancia.es_autogestionado;
                const esAutogestionadoDetalle = instancia.detalle_curso?.es_autogestionado;
                let esAutogestionado = false;
                if (esAutogestionadoInstancia === true || String(esAutogestionadoInstancia).toUpperCase() === "SI" || String(esAutogestionadoInstancia) === "1") {
                    esAutogestionado = true;
                } else if (esAutogestionadoInstancia === null && (esAutogestionadoDetalle === true || String(esAutogestionadoDetalle).toUpperCase() === "SI" || String(esAutogestionadoDetalle) === "1")) {
                    esAutogestionado = true;
                }

                const participantes = parseInt(instancia.cupo, 10) || 0;

                const fechaInicioObj = getValidDayjsObject(fechaInicioCursoStr); // Usa el helper
                const fechaFinObj = getValidDayjsObject(fechaFinCursoStr);     // Usa el helper

                if (!fechaInicioObj) return;
                const anioInicioCurso = fechaInicioObj.year(); // Dayjs usa .year()

                if (anioInicioCurso !== currentYear) return;

                const mesInicioCurso = fechaInicioObj.month(); // Dayjs usa .month() (0-11)

                const esFechaFinValida = fechaFinObj !== null; // Simplificado gracias al helper

                const mesFinCurso = esFechaFinValida ? fechaFinObj.month() : -1;
                const anioFinCurso = esFechaFinValida ? fechaFinObj.year() : -1;

                const isCancelledOrSuspended = estadoCurso === "SUSP" || estadoCurso === "CANC";

                if (mesInicioCurso === mesIndex) {
                    if (!isCancelledOrSuspended) {
                        cursosPorMes++;
                        const plataforma = instancia.plataforma_dictado || instancia.detalle_curso?.plataforma_dictado;
                        if (String(plataforma).toUpperCase().includes("EXT")) {
                            plataformaExterna++;
                        }
                        if (esAutogestionado) autogestionados++;
                        participantesPorMes += participantes;
                    } else {
                        canceladosSuspendidos++;
                    }
                } else if (!isCancelledOrSuspended && esFechaFinValida &&
                    (fechaInicioObj.isBefore(dayjs().year(currentYear).month(mesIndex).startOf('month'))) &&
                    (fechaFinObj.isSameOrAfter(dayjs().year(currentYear).month(mesIndex).startOf('month')))
                ) {
                    // Lógica más precisa para cursos activos de meses anteriores:
                    // Inició antes del mes actual Y termina en o después del mes actual
                    // (Considerando que el curso pudo haber iniciado en un año anterior)
                    // (O que inicia en un mes anterior del mismo año)
                    // Y que termina en este mes, o en un mes posterior, o en un año posterior.
                    if ((anioInicioCurso < currentYear || (anioInicioCurso === currentYear && mesInicioCurso < mesIndex)) &&
                        (anioFinCurso > currentYear || (anioFinCurso === currentYear && mesFinCurso >= mesIndex))
                    ) {
                        cursosActivosAnteriores++;
                    }
                }
            });

            const totalCursosAcumulados = cursosPorMes + cursosActivosAnteriores;
            const porcentajeAutogestionadosNum = cursosPorMes > 0 ? (autogestionados / cursosPorMes) * 100 : 0;

            summaryData.push({
                id: mesIndex, mesAbrev: mesesAbrev[mesIndex], mesNombre: mesesFull[mesIndex],
                cursosPorMes, cursosActivosAnteriores, plataformaExterna, totalCursosAcumulados,
                canceladosSuspendidos, autogestionados, porcentajeAutogestionados: porcentajeAutogestionadosNum,
                participantesPorMes
            });
        }
        setAllMonthsData(summaryData);
    }, [filteredCronogramaData, currentYear, loading]);


    useEffect(() => {
        if (loading || !allMonthsData || allMonthsData.length === 0) {
            setDisplayKpiData(null);
            setDisplayChartData(null);
            setDisplaySummaryData(null);
            return;
        }

        const totalParticipantesAnual = allMonthsData.reduce((sum, m) => sum + m.participantesPorMes, 0);

        if (selectedMonth === 'all') {
            const totalNuevosAnual = allMonthsData.reduce((sum, m) => sum + m.cursosPorMes, 0);
            const totalCanceladosAnual = allMonthsData.reduce((sum, m) => sum + m.canceladosSuspendidos, 0);

            const mesesConActividad = allMonthsData.filter(m => m.totalCursosAcumulados > 0 || m.cursosPorMes > 0 || m.canceladosSuspendidos > 0);
            const totalActivosSum = mesesConActividad.reduce((sum, m) => sum + m.totalCursosAcumulados, 0);
            const promedioActivosMes = mesesConActividad.length > 0 ? (totalActivosSum / mesesConActividad.length) : 0;

            const totalAutogestionadosAnual = allMonthsData.reduce((sum, m) => sum + m.autogestionados, 0);
            const porcentajeAutogestionadoAnual = totalNuevosAnual > 0 ? (totalAutogestionadosAnual / totalNuevosAnual) * 100 : 0;

            setDisplayKpiData({
                nuevos: totalNuevosAnual, cancelados: totalCanceladosAnual,
                activosPromedio: promedioActivosMes.toFixed(1),
                porcAutogestionado: porcentajeAutogestionadoAnual.toFixed(1) + '%',
                totalParticipantes: totalParticipantesAnual, isAnnual: true
            });

            const labels = allMonthsData.map(d => d.mesAbrev);
            setDisplayChartData({
                labels,
                tendencias: { datasets: [{ label: 'Nuevos', data: allMonthsData.map(d => d.cursosPorMes), borderColor: 'rgb(53, 162, 235)', backgroundColor: 'rgba(53, 162, 235, 0.5)', yAxisID: 'y', tension: 0.1 }, { label: 'Total Act.', data: allMonthsData.map(d => d.totalCursosAcumulados), borderColor: 'rgb(75, 192, 192)', backgroundColor: 'rgba(75, 192, 192, 0.5)', yAxisID: 'y', tension: 0.1 }, { label: 'Canc/Susp.', data: allMonthsData.map(d => d.canceladosSuspendidos), borderColor: 'rgb(255, 99, 132)', backgroundColor: 'rgba(255, 99, 132, 0.5)', yAxisID: 'y', tension: 0.1 },] },
                composicionActivos: { datasets: [{ label: 'Nuevos Mes', data: allMonthsData.map(d => d.cursosPorMes), backgroundColor: 'rgba(53, 162, 235, 0.7)', stack: 'Stack 0' }, { label: 'Act. Ant.', data: allMonthsData.map(d => d.cursosActivosAnteriores), backgroundColor: 'rgba(75, 192, 192, 0.7)', stack: 'Stack 0' },] },
            });
            setDisplaySummaryData(allMonthsData);

        } else {
            const monthIndex = parseInt(selectedMonth, 10);
            const monthData = allMonthsData.find(m => m.id === monthIndex);

            if (monthData) {
                const participantesNuevosMes = monthData.participantesPorMes;

                setDisplayKpiData({
                    nuevos: monthData.cursosPorMes, cancelados: monthData.canceladosSuspendidos,
                    activosPromedio: monthData.totalCursosAcumulados,
                    porcAutogestionado: monthData.porcentajeAutogestionados.toFixed(1) + '%',
                    totalParticipantes: participantesNuevosMes,
                    isAnnual: false, monthName: monthData.mesNombre
                });

                const monthlyCourseDetailLabels = ['Nuevos', 'Act. Ant.', 'Canc/Susp.'];
                const monthlyCourseDetailData = [monthData.cursosPorMes, monthData.cursosActivosAnteriores, monthData.canceladosSuspendidos];

                setDisplayChartData({
                    monthlyCourseDetail: {
                        labels: monthlyCourseDetailLabels,
                        datasets: [{ label: `Detalle Cursos ${monthData.mesNombre}`, data: monthlyCourseDetailData, backgroundColor: ['rgba(53, 162, 235, 0.7)', 'rgba(75, 192, 192, 0.7)', 'rgba(255, 99, 132, 0.7)'], borderColor: ['rgb(53, 162, 235)', 'rgb(75, 192, 192)', 'rgb(255, 99, 132)'], borderWidth: 1 }]
                    },
                    tendencias: null, composicionActivos: null
                });
                setDisplaySummaryData([monthData]);

            } else {
                setDisplayKpiData(null); setDisplayChartData(null); setDisplaySummaryData(null);
            }
        }
    }, [selectedMonth, allMonthsData, currentYear, loading]);

    const yearsOptions = useMemo(() => {
        const start = 2022;
        const currentYear = new Date().getFullYear();
        const endYear = Math.max(currentYear + 1, start + 1); // al menos 2 años en total
        const years = [];
        for (let y = start; y <= endYear; y++) {
            years.push(y);
        }
        return years;
    }, []);

    const handleMonthChange = (event) => { setSelectedMonth(event.target.value); };
    const handleMinisterioChange = (event) => {
        setSelectedMinisterio(event.target.value);
    };
    const handleAreaChange = (event) => { setSelectedArea(event.target.value); };

    const handleClearFilters = () => {
        setSelectedYear(new Date().getFullYear());
        setSelectedMonth('all');
        setSelectedMinisterio('all');
        setSelectedArea('all');
    };

    const commonDataLabelConfig = useMemo(() => ({ display: true, color: '#333', font: { size: 10, weight: 'bold', }, formatter: (value) => { if (value === 0 || value === null || value === undefined) return ''; return Math.round(value); }, anchor: 'end', align: 'top', offset: 4, }), []); // Removido context de formatter si no se usa
    const commonChartOptions = useMemo(() => ({ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15 } }, title: { display: true, font: { size: 16 }, padding: { top: 10, bottom: 20 } }, tooltip: { mode: 'index', intersect: false, backgroundColor: 'rgba(0, 0, 0, 0.8)', titleFont: { size: 14 }, bodyFont: { size: 12 }, padding: 10, cornerRadius: 4 }, datalabels: commonDataLabelConfig }, scales: { x: { display: true, title: { display: false }, grid: { display: false }, ticks: { font: { size: 11 } } }, y: { display: true, position: 'left', title: { display: true, text: 'Cantidad de Cursos' }, beginAtZero: true, grid: { color: '#eee' }, ticks: { font: { size: 11 }, callback: function (value) { if (Number.isInteger(value)) { return value; } } } }, yPercentage: { display: false, position: 'right', title: { display: true, text: 'Porcentaje (%)' }, min: 0, max: 100, grid: { drawOnChartArea: false }, ticks: { callback: (value) => value + '%', font: { size: 11 } } } }, interaction: { mode: 'nearest', axis: 'x', intersect: false }, animation: { duration: 500 } }), [commonDataLabelConfig]);
    const lineTrendsOptionsAnnual = useMemo(() => ({ ...commonChartOptions, plugins: { ...commonChartOptions.plugins, title: { ...commonChartOptions.plugins.title, text: 'Tendencia Mensual Cursos' }, datalabels: { ...commonDataLabelConfig, align: 'top', offset: 6, } }, scales: { ...commonChartOptions.scales, yPercentage: { display: false } } }), [commonChartOptions, commonDataLabelConfig]);
    const stackedBarOptionsAnnual = useMemo(() => ({ ...commonChartOptions, plugins: { ...commonChartOptions.plugins, title: { ...commonChartOptions.plugins.title, text: 'Composición Cursos Activos/Mes' }, datalabels: { ...commonDataLabelConfig, align: 'center', anchor: 'center', font: { size: 9 }, } }, scales: { x: { ...commonChartOptions.scales.x, stacked: true }, y: { ...commonChartOptions.scales.y, stacked: true, title: { display: true, text: 'Total Cursos Activos' } }, yPercentage: { display: false } } }), [commonChartOptions, commonDataLabelConfig]);
    const barMonthlyCourseDetailOptions = useMemo(() => ({ ...commonChartOptions, indexAxis: 'y', plugins: { ...commonChartOptions.plugins, legend: { display: false }, title: { ...commonChartOptions.plugins.title, text: `Detalle Cursos ${displayKpiData?.monthName ?? ''}` }, datalabels: { ...commonDataLabelConfig, anchor: 'end', align: 'right', offset: 8, } }, scales: { x: { ...commonChartOptions.scales.y, position: 'bottom', title: { display: true, text: 'Cantidad' } }, y: { ...commonChartOptions.scales.x, type: 'category', title: { display: false } }, yPercentage: { display: false } } }), [commonChartOptions, displayKpiData?.monthName, commonDataLabelConfig]);

    const renderSummaryText = () => {
        if (!displaySummaryData || displaySummaryData.length === 0 || !displayKpiData) return null;
        const textStyleProps = { primaryTypographyProps: { sx: { color: 'text.primary', fontWeight: 500 } } };

        if (displayKpiData.isAnnual) {
            const mesMasNuevos = encontrarMesPico(displaySummaryData, 'cursosPorMes');
            const mesMasActivos = encontrarMesPico(displaySummaryData, 'totalCursosAcumulados');
            return (
                <List dense sx={{ '& .MuiListItemText-secondary': { fontSize: '0.8rem' } }}>
                    <ListItem disablePadding> <ListItemIcon sx={{ minWidth: '40px' }}><CheckCircleOutlineIcon color="success" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Total Nuevos Cursos (${currentYear}): ${displayKpiData.nuevos}`} secondary="Cantidad total de cursos que iniciaron durante el año (filtrado)." /> </ListItem>
                    <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><HighlightOffIcon color="error" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Total Cancelados/Suspendidos: ${displayKpiData.cancelados}`} secondary="Cursos cuyo inicio estaba programado para este año pero fueron cancelados/suspendidos (filtrado)." /> </ListItem>
                    <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><TrendingUpIcon color="action" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Promedio Cursos Activos por Mes: ${displayKpiData.activosPromedio}`} secondary="Número promedio de cursos en estado activo (nuevos + de meses anteriores) cada mes (filtrado)." /> </ListItem>
                    <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><SettingsSuggestIcon color="warning" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`% Autogestionados (sobre nuevos): ${displayKpiData.porcAutogestionado}`} secondary="Porcentaje anual de los nuevos cursos iniciados que fueron de tipo autogestionado (filtrado)." /> </ListItem>
                    <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><PeopleIcon color="info" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Total Participantes (Cursos Nuevos ${currentYear}): ${displayKpiData.totalParticipantes}`} secondary="Suma de participantes de cursos iniciados en el año (filtrado)." /> </ListItem>
                    <Divider component="li" sx={{ my: 2 }} />
                    <ListItem disablePadding> <ListItemIcon sx={{ minWidth: '40px' }}><BarChartIcon color="info" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Mes con Más Cursos Nuevos: ${mesMasNuevos}`} /> </ListItem>
                    <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><BarChartIcon color="secondary" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Mes con Mayor Total de Cursos Activos: ${mesMasActivos}`} /> </ListItem>
                </List>
            );
        } else {
            const monthData = displaySummaryData[0];
            if (!monthData) return null;
            return (
                <List dense sx={{ '& .MuiListItemText-secondary': { fontSize: '0.8rem' } }}>
                    <ListItem disablePadding> <ListItemIcon sx={{ minWidth: '40px' }}><CheckCircleOutlineIcon color="primary" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Nuevos Cursos en ${monthData.mesNombre}: ${monthData.cursosPorMes}`} /> </ListItem>
                    <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><TrendingUpIcon color="success" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Cursos Activos de Meses Anteriores: ${monthData.cursosActivosAnteriores}`} /> </ListItem>
                    <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><BarChartIcon color="secondary" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Total Cursos Activos en ${monthData.mesNombre}: ${monthData.totalCursosAcumulados}`} /> </ListItem>
                    <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><CancelIcon color="error" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Cancelados/Suspendidos (iniciaban en ${monthData.mesNombre}): ${monthData.canceladosSuspendidos}`} /> </ListItem>
                    <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><SettingsSuggestIcon color="warning" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Autogestionados (nuevos en ${monthData.mesNombre}): ${monthData.autogestionados} (${monthData.porcentajeAutogestionados.toFixed(1)}%)`} /> </ListItem>
                    <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><PeopleIcon color="info" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Participantes (Nuevos Cursos ${monthData.mesNombre}): ${displayKpiData.totalParticipantes}`} secondary="Suma de participantes de cursos iniciados en el mes (filtrado)." /> </ListItem>
                    <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><ShowChartIcon color="info" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Cursos en Plataforma Externa (nuevos en ${monthData.mesNombre}): ${monthData.plataformaExterna}`} /> </ListItem>
                </List>
            );
        }
    };

    const getReportTitle = () => {
        let title = `Reporte Cursos ${currentYear}`;
        const filtersApplied = [];
        if (selectedMinisterio !== 'all') filtersApplied.push(selectedMinisterio);
        if (selectedArea !== 'all') filtersApplied.push(selectedArea);
        if (selectedMonth !== 'all' && typeof selectedMonth === 'number' && mesesFull[selectedMonth]) {
            filtersApplied.push(mesesFull[selectedMonth]);
        }
        if (filtersApplied.length > 0) {
            title += ` (${filtersApplied.join(' / ')})`;
        } else if (selectedMonth === 'all') {
            title += " (Anual General)";
        }
        return title;
    };

    const defaultYear = new Date().getFullYear();


    const isFilterActive = useMemo(() =>
        selectedYear !== defaultYear ||
        selectedMonth !== 'all' ||
        selectedMinisterio !== 'all' ||
        selectedArea !== 'all',
        [defaultYear, selectedYear, selectedMonth, selectedMinisterio, selectedArea]);

    return (
        <Box sx={{
            width: '100%',
            py: 4,
        }}>
            <Typography variant="h4" gutterBottom component="h1" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold' }}>
                {getReportTitle()}
            </Typography>

            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="flex-end">
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small" disabled={loading}>
                            <InputLabel id="select-year-label">Año</InputLabel>
                            <Select
                                labelId="select-year-label"
                                id="select-year"
                                value={selectedYear}
                                label="Año"
                                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                                startAdornment={<CalendarMonthIcon sx={{ mr: 1, color: 'action.active' }} />}
                            >
                                {yearsOptions.map((year) => (
                                    <MenuItem
                                        key={year}
                                        value={year}
                                        sx={year === new Date().getFullYear() ? {
                                            fontWeight: 600,
                                            color: 'primary.main',
                                            '& .MuiTypography-root': { fontWeight: 700 }
                                        } : {}}
                                    >
                                        {year === new Date().getFullYear() ? `${year} (Año Actual)` : year}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small" disabled={loading}>
                            <InputLabel id="select-month-label">Mes</InputLabel>
                            <Select labelId="select-month-label" id="select-month" value={selectedMonth} label="Mes" onChange={handleMonthChange} startAdornment={<CalendarMonthIcon sx={{ mr: 1, color: 'action.active' }} />}>
                                <MenuItem value="all"> <em>Todos (Anual)</em> </MenuItem>
                                {mesesFull.map((nombreMes, index) => (<MenuItem key={index} value={index}>{nombreMes}</MenuItem>))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small" disabled={loading || !allMinisterios || allMinisterios.length <= 1}>
                            <InputLabel id="select-ministerio-label">Ministerio</InputLabel>
                            <Select labelId="select-ministerio-label" id="select-ministerio" value={selectedMinisterio} label="Ministerio" onChange={handleMinisterioChange} startAdornment={<AccountBalanceIcon sx={{ mr: 1, color: 'action.active' }} />}>
                                {allMinisterios.map((min, index) => (<MenuItem key={index} value={min}>{min === 'all' ? <em>Todos los Ministerios</em> : min}</MenuItem>))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small" disabled={loading || selectedMinisterio === 'all' || !availableAreas || availableAreas.length <= 1}>
                            <InputLabel id="select-area-label">Área</InputLabel>
                            <Select labelId="select-area-label" id="select-area" value={selectedArea} label="Área" onChange={handleAreaChange} startAdornment={<FolderSpecialIcon sx={{ mr: 1, color: 'action.active' }} />}>
                                {availableAreas.map((area, index) => (
                                    <MenuItem key={index} value={area}>{area === 'all' ? <em>Todas las Áreas</em> : area}</MenuItem>
                                ))}
                                {selectedMinisterio !== 'all' && availableAreas.length <= 1 && (
                                    <MenuItem value="all" disabled><em>(No hay áreas)</em></MenuItem>
                                )}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Button
                            fullWidth
                            variant="outlined"
                            size="medium"
                            onClick={handleClearFilters}
                            disabled={!isFilterActive || loading}
                            startIcon={<ClearAllIcon />}
                            sx={{ height: '40px' }}
                        >
                            Limpiar Filtros
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {loading && (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}> <CircularProgress /> <Typography sx={{ ml: 2 }}>Cargando datos...</Typography> </Box>)}
            {error && !loading && (<Alert severity="error" sx={{ my: 2 }} elevation={3}> <strong>Error al cargar el reporte:</strong> {error} </Alert>)}

            {!loading && !error && rawCronogramaData && rawCronogramaData.length > 0 && (
                <>
                    {displayKpiData && (
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={6} md={4} lg={2.4}> <KpiCard title="Nuevos Cursos" value={displayKpiData.nuevos ?? '0'} icon={<AddCircleOutlineIcon />} color="primary" description={displayKpiData.isAnnual ? `Total ${currentYear}` : `En ${displayKpiData.monthName}`} /> </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={2.4}> <KpiCard title="Cancelados/Susp." value={displayKpiData.cancelados ?? '0'} icon={<CancelIcon />} color="error" description={displayKpiData.isAnnual ? `Iniciaban ${currentYear}` : `Iniciaban en ${displayKpiData.monthName}`} /> </Grid>
                            <Grid item xs={12} sm={6} md={4} lg={2.4}> <KpiCard title={displayKpiData.isAnnual ? "Activos Prom./Mes" : "Total Activos Mes"} value={displayKpiData.activosPromedio ?? '0'} icon={<TrendingUpIcon />} color="success" description={displayKpiData.isAnnual ? `Promedio ${currentYear}` : `En ${displayKpiData.monthName}`} /> </Grid>
                            <Grid item xs={12} sm={6} md={6} lg={2.4}> <KpiCard title="Participantes" value={displayKpiData.totalParticipantes ?? '0'} icon={<PeopleIcon />} color="info" description={displayKpiData.isAnnual ? `Total ${currentYear} (Nuevos)` : `En ${displayKpiData.monthName} (Nuevos)`} /> </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={2.4}> <KpiCard title="% Autogestionados" value={displayKpiData.porcAutogestionado ?? '0%'} icon={<SettingsSuggestIcon />} color="warning" description={displayKpiData.isAnnual ? `Anual (s/ nuevos)` : `Mes (s/ nuevos)`} /> </Grid>
                        </Grid>
                    )}

                    {allMonthsData && allMonthsData.length > 0 ? (
                        <Grid container spacing={3}>
                            {displayChartData && selectedMonth === 'all' && (
                                <>
                                    <Grid item xs={12} lg={6}> <Paper elevation={2} sx={{ p: { xs: 1, sm: 2 }, height: { xs: 300, md: 400 } }}> <Line options={lineTrendsOptionsAnnual} data={{ labels: displayChartData.labels, datasets: displayChartData.tendencias?.datasets ?? [] }} /> </Paper> </Grid>
                                    <Grid item xs={12} lg={6}> <Paper elevation={2} sx={{ p: { xs: 1, sm: 2 }, height: { xs: 300, md: 400 } }}> <Bar options={stackedBarOptionsAnnual} data={{ labels: displayChartData.labels, datasets: displayChartData.composicionActivos?.datasets ?? [] }} /> </Paper> </Grid>
                                    <Grid item xs={12}>
                                        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mt: { xs: 2, lg: 0 }, height: '100%' }}>
                                            <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <BarChartIcon sx={{ mr: 1 }} color="primary" /> Resumen Anual ({currentYear})
                                            </Typography>
                                            {renderSummaryText()}
                                        </Paper>
                                    </Grid>
                                </>
                            )}

                            {displayChartData && selectedMonth !== 'all' && (
                                <>
                                    <Grid item xs={12} md={6}>
                                        <Paper elevation={2} sx={{ p: { xs: 1, sm: 2 }, height: { xs: 300, md: 400 } }}>
                                            {displayChartData.monthlyCourseDetail ? (<Bar options={barMonthlyCourseDetailOptions} data={displayChartData.monthlyCourseDetail} />)
                                                : <Typography sx={{ textAlign: 'center', pt: 'calc(50% - 1em)' }}>No hay datos para el mes seleccionado.</Typography>} {/* Centrado vertical aproximado */}
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
                                            <Typography variant="h6" component="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <BarChartIcon sx={{ mr: 1 }} color="primary" /> {`Resumen ${(typeof selectedMonth === 'number' && mesesFull[selectedMonth]) ? mesesFull[selectedMonth] : ''} ${currentYear}`}
                                            </Typography>
                                            {renderSummaryText()}
                                        </Paper>
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    ) : (
                        !loading && rawCronogramaData && rawCronogramaData.length > 0 && <Paper elevation={3} sx={{ p: 3, mt: 3, textAlign: 'center' }}>
                            <Typography variant="h6" gutterBottom>Sin resultados</Typography>
                            <Typography variant="body1" color="textSecondary"> No se encontraron datos de cursos que coincidan con los filtros seleccionados para el año {currentYear}. </Typography>
                        </Paper>
                    )}
                </>
            )}

            {!loading && !error && (!rawCronogramaData || rawCronogramaData.length === 0) && (
                <Paper elevation={3} sx={{ p: 3, mt: 3, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>No hay datos disponibles</Typography>
                    <Typography variant="body1" color="textSecondary"> No se encontraron datos de cursos para el año {currentYear}. Verifica la fuente de datos. </Typography>
                </Paper>
            )}
        </Box>
    );
};

export default ReporteCursosCC;