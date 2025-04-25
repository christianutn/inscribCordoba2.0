import React, { useEffect, useState, useMemo } from "react";
import { getCronograma } from "../services/googleSheets.service";
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

ChartJS.register(
    CategoryScale, LinearScale, BarElement, LineElement, PointElement,
    Title, Tooltip, Legend, Filler,
    ChartDataLabels
);

const parseDateString = (dateString) => { if (!dateString || typeof dateString !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) { return null; } try { const [year, month, day] = dateString.split('-').map(Number); if (month < 1 || month > 12 || day < 1 || day > 31) { return null; } const date = new Date(Date.UTC(year, month - 1, day)); if (isNaN(date.getTime()) || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) { return null; } return date; } catch (e) { console.error("Error parsing date:", dateString, e); return null; } };
function transformarEnObjetosClaveValor(matriz) { if (!Array.isArray(matriz) || matriz.length < 1) return []; const [cabecera, ...filas] = matriz; if (!Array.isArray(cabecera) || cabecera.length === 0) return []; return filas.map((fila) => { const obj = {}; if (!Array.isArray(fila)) return {}; cabecera.forEach((columna, i) => { obj[columna.trim()] = (i < fila.length && fila[i] != null) ? String(fila[i]).trim() : ''; }); return obj; }); }
const mesesAbrev = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const mesesFull = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const encontrarMesPico = (data, field) => { if (!data || data.length === 0) return 'N/A'; let maxVal = -Infinity; let mes = 'N/A'; data.forEach(item => { const currentVal = Number(item[field]); if (!isNaN(currentVal) && currentVal > maxVal) { maxVal = currentVal; mes = item.mesNombre; } }); return maxVal > 0 && mes !== 'N/A' ? `${mes} (${maxVal.toFixed(0)})` : (mes !== 'N/A' ? mes : 'N/A'); };

function KpiCard({ title, value, icon, color = 'primary', description }) {
    const IconComponent = icon;
    return (<Card elevation={3} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}> <CardContent sx={{ flexGrow: 1 }}> <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}> <> {IconComponent && (<Box component="span" sx={{ mr: 1.5, display: 'flex', alignItems: 'center', color: theme => theme.palette[color]?.main ?? theme.palette.primary.main }}> {React.cloneElement(IconComponent, { fontSize: 'large' })} </Box>)} <Typography variant="h6" component="div" color="text.secondary" sx={{ fontSize: '0.9rem', fontWeight: 500 }}> {title} </Typography> </> </Box> <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1, fontSize: '1.8rem' }}> {value} </Typography> {description && (<Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}> {description} </Typography>)} </CardContent> </Card>);
}

const ReporteCursosCC = () => {
    const [rawCronogramaData, setRawCronogramaData] = useState([]);
    const [filteredCronogramaData, setFilteredCronogramaData] = useState([]);
    const [allMonthsData, setAllMonthsData] = useState([]);
    const [allMinisterios, setAllMinisterios] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [selectedMinisterio, setSelectedMinisterio] = useState('all');
    const [selectedArea, setSelectedArea] = useState('all');
    const [availableAreas, setAvailableAreas] = useState(['all']);
    const [displayChartData, setDisplayChartData] = useState(null);
    const [displayKpiData, setDisplayKpiData] = useState(null);
    const [displaySummaryData, setDisplaySummaryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const currentYear = new Date().getFullYear();

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
                const rawData = await getCronograma();
                if (!Array.isArray(rawData) || rawData.length < 2) {
                    throw new Error("Datos crudos no válidos o insuficientes.");
                }
                const cronograma = transformarEnObjetosClaveValor(rawData);
                if (!cronograma || cronograma.length === 0) {
                    throw new Error("No se encontraron datos válidos tras la transformación.");
                }
                setRawCronogramaData(cronograma);

                const ministeriosSet = new Set();
                cronograma.forEach(curso => {
                    const ministerio = curso["Ministerio"]?.trim();
                    if (ministerio) ministeriosSet.add(ministerio);
                });
                setAllMinisterios(['all', ...Array.from(ministeriosSet).sort()]);

            } catch (err) {
                console.error("Error en fetchData:", err);
                setError(err.message || "Ocurrió un error desconocido al obtener datos.");
                setRawCronogramaData([]);
                setAllMinisterios([]);
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
            return;
        }

        if (selectedMinisterio === 'all') {
            setAvailableAreas(['all']);
            if (selectedArea !== 'all') setSelectedArea('all');
        } else {
            const areasSet = new Set();
            rawCronogramaData.forEach(curso => {
                if (curso["Ministerio"] === selectedMinisterio) {
                    const area = curso["Area"]?.trim();
                    if (area) areasSet.add(area);
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
        if (loading || !rawCronogramaData.length) {
            setFilteredCronogramaData([]);
            return;
        }
        const filtered = rawCronogramaData.filter(curso => {
            const ministerioMatch = selectedMinisterio === 'all' || (curso["Ministerio"] === selectedMinisterio);
            const areaMatch = selectedArea === 'all' || (curso["Area"] === selectedArea);
            return ministerioMatch && areaMatch;
        });
        setFilteredCronogramaData(filtered);
    }, [rawCronogramaData, selectedMinisterio, selectedArea, loading]);

    useEffect(() => {
        if (loading || !filteredCronogramaData) {
            setAllMonthsData([]);
            return;
        }

        const summaryData = [];
        for (let mesIndex = 0; mesIndex < 12; mesIndex++) {
            let cursosPorMes = 0, cursosActivosAnteriores = 0, plataformaExterna = 0, canceladosSuspendidos = 0, autogestionados = 0;
            let participantesPorMes = 0;

            filteredCronogramaData.forEach(curso => {
                if (!curso || typeof curso !== 'object') return;
                const fechaInicioCursoStr = curso["Fecha inicio del curso"];
                const fechaFinCursoStr = curso["Fecha fin del curso"];
                const estadoCurso = (curso["Estado"] || "").toUpperCase().trim();
                const nombreCorto = curso["Código del curso"] || "";
                const esAutogestionado = (curso["Es Autogestionado"] || "").toUpperCase() === "SI";
                const participantes = Number(curso["Participantes"]) || 0;

                const fechaInicioObj = parseDateString(fechaInicioCursoStr);
                const fechaFinObj = parseDateString(fechaFinCursoStr);

                if (!fechaInicioObj) return;
                const anioInicioCurso = fechaInicioObj.getUTCFullYear();

                if (anioInicioCurso !== currentYear) return;

                const mesInicioCurso = fechaInicioObj.getUTCMonth();
                const mesFinCurso = fechaFinObj ? fechaFinObj.getUTCMonth() : -1;
                const anioFinCurso = fechaFinObj ? fechaFinObj.getUTCFullYear() : -1;
                const isCancelledOrSuspended = estadoCurso === "SUSPENDIDO" || estadoCurso === "CANCELADO";

                if (mesInicioCurso === mesIndex && !isCancelledOrSuspended) {
                    cursosPorMes++;
                    if (nombreCorto.startsWith("EXT-")) plataformaExterna++;
                    if (esAutogestionado) autogestionados++;
                    participantesPorMes += participantes;
                } else if (fechaFinObj &&
                    ((anioInicioCurso < currentYear) || (anioInicioCurso === currentYear && mesInicioCurso < mesIndex)) &&
                    ((anioFinCurso > currentYear) || (anioFinCurso === currentYear && mesFinCurso >= mesIndex)) &&
                    !isCancelledOrSuspended) {
                    cursosActivosAnteriores++;
                }

                if (mesInicioCurso === mesIndex && isCancelledOrSuspended) {
                    canceladosSuspendidos++;
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
            const mesesConActividad = allMonthsData.filter(m => m.totalCursosAcumulados > 0 || m.cursosPorMes > 0);
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
                let participantesNuevosMes = 0;
                filteredCronogramaData.forEach(curso => {
                    const fechaInicioObj = parseDateString(curso["Fecha inicio del curso"]);
                    if (fechaInicioObj && fechaInicioObj.getUTCFullYear() === currentYear && fechaInicioObj.getUTCMonth() === monthIndex) {
                        const participantes = Number(curso["Participantes"]) || 0;
                        const estadoCurso = (curso["Estado"] || "").toUpperCase().trim();
                        const isCancelledOrSuspended = estadoCurso === "SUSPENDIDO" || estadoCurso === "CANCELADO";
                        if (!isCancelledOrSuspended) {
                            participantesNuevosMes += participantes;
                        }
                    }
                });

                setDisplayKpiData({
                    nuevos: monthData.cursosPorMes, cancelados: monthData.canceladosSuspendidos,
                    activosPromedio: monthData.totalCursosAcumulados,
                    porcAutogestionado: monthData.porcentajeAutogestionados.toFixed(1) + '%',
                    totalParticipantes: participantesNuevosMes, isAnnual: false, monthName: monthData.mesNombre
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
    }, [selectedMonth, allMonthsData, filteredCronogramaData, currentYear, loading]);

    const handleMonthChange = (event) => { setSelectedMonth(event.target.value); };
    const handleMinisterioChange = (event) => {
        setSelectedMinisterio(event.target.value);
    };
    const handleAreaChange = (event) => { setSelectedArea(event.target.value); };

    const handleClearFilters = () => {
        setSelectedMonth('all');
        setSelectedMinisterio('all');
        setSelectedArea('all');
    };

    const commonDataLabelConfig = useMemo(() => ({ display: true, color: '#333', font: { size: 10, weight: 'bold', }, formatter: (value, context) => { if (value === 0 || value === null || value === undefined) return null; if (context.dataset.label?.includes('%')) { return value.toFixed(1) + '%'; } return Math.round(value); }, anchor: 'end', align: 'top', offset: 4, }), []);
    const commonChartOptions = useMemo(() => ({ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15 } }, title: { display: true, font: { size: 16 }, padding: { top: 10, bottom: 20 } }, tooltip: { mode: 'index', intersect: false, backgroundColor: 'rgba(0, 0, 0, 0.8)', titleFont: { size: 14 }, bodyFont: { size: 12 }, padding: 10, cornerRadius: 4 }, datalabels: commonDataLabelConfig }, scales: { x: { display: true, title: { display: false }, grid: { display: false }, ticks: { font: { size: 11 } } }, y: { display: true, position: 'left', title: { display: true, text: 'Cantidad de Cursos' }, beginAtZero: true, grid: { color: '#eee' }, ticks: { font: { size: 11 }, stepSize: 1 } }, yPercentage: { display: false, position: 'right', title: { display: true, text: 'Porcentaje (%)' }, min: 0, max: 100, grid: { drawOnChartArea: false }, ticks: { callback: (value) => value + '%', font: { size: 11 } } } }, interaction: { mode: 'nearest', axis: 'x', intersect: false }, animation: { duration: 500 } }), [commonDataLabelConfig]);
    const lineTrendsOptionsAnnual = useMemo(() => ({ ...commonChartOptions, plugins: { ...commonChartOptions.plugins, title: { ...commonChartOptions.plugins.title, text: 'Tendencia Mensual Cursos' }, datalabels: { ...commonDataLabelConfig, align: 'top', offset: 6, } }, scales: { ...commonChartOptions.scales, yPercentage: { display: false } } }), [commonChartOptions, commonDataLabelConfig]);
    const stackedBarOptionsAnnual = useMemo(() => ({ ...commonChartOptions, plugins: { ...commonChartOptions.plugins, title: { ...commonChartOptions.plugins.title, text: 'Composición Cursos Activos/Mes' }, datalabels: { ...commonDataLabelConfig, align: 'center', anchor: 'center', font: { size: 9 }, } }, scales: { x: { ...commonChartOptions.scales.x, stacked: true }, y: { ...commonChartOptions.scales.y, stacked: true, title: { display: true, text: 'Total Cursos Activos' } }, yPercentage: { display: false } } }), [commonChartOptions, commonDataLabelConfig]);
    const barMonthlyCourseDetailOptions = useMemo(() => ({ ...commonChartOptions, indexAxis: 'y', plugins: { ...commonChartOptions.plugins, legend: { display: false }, title: { ...commonChartOptions.plugins.title, text: `Detalle Cursos ${displayKpiData?.monthName ?? ''}` }, datalabels: { ...commonDataLabelConfig, anchor: 'end', align: 'right', offset: 8, } }, scales: { x: { ...commonChartOptions.scales.y, position: 'bottom', title: { display: true, text: 'Cantidad' } }, y: { ...commonChartOptions.scales.x, type: 'category', title: { display: false } }, yPercentage: { display: false } } }), [commonChartOptions, displayKpiData?.monthName, commonDataLabelConfig]);

    const renderSummaryText = () => { if (!displaySummaryData || displaySummaryData.length === 0) return null; const textStyleProps = { primaryTypographyProps: { sx: { color: 'text.primary', fontWeight: 500 } } }; if (displayKpiData?.isAnnual) { const mesMasNuevos = encontrarMesPico(displaySummaryData, 'cursosPorMes'); const mesMasActivos = encontrarMesPico(displaySummaryData, 'totalCursosAcumulados'); return (<List dense sx={{ '& .MuiListItemText-secondary': { fontSize: '0.8rem' } }}> <ListItem disablePadding> <ListItemIcon sx={{ minWidth: '40px' }}><CheckCircleOutlineIcon color="success" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Total Nuevos Cursos (${currentYear}): ${displayKpiData.nuevos}`} secondary="Cantidad total de cursos que iniciaron durante el año (filtrado)." /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><HighlightOffIcon color="error" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Total Cancelados/Suspendidos: ${displayKpiData.cancelados}`} secondary="Cursos cuyo inicio estaba programado para este año pero fueron cancelados/suspendidos (filtrado)." /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><TrendingUpIcon color="action" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Promedio Cursos Activos por Mes: ${displayKpiData.activosPromedio}`} secondary="Número promedio de cursos en estado activo (nuevos + de meses anteriores) cada mes (filtrado)." /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><SettingsSuggestIcon color="warning" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`% Autogestionados (sobre nuevos): ${displayKpiData.porcAutogestionado}`} secondary="Porcentaje anual de los nuevos cursos iniciados que fueron de tipo autogestionado (filtrado)." /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><PeopleIcon color="info" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Total Participantes (Cursos Nuevos ${currentYear}): ${displayKpiData.totalParticipantes}`} secondary="Suma de participantes de cursos iniciados en el año (filtrado)." /> </ListItem> <Divider component="li" sx={{ my: 2 }} /> <ListItem disablePadding> <ListItemIcon sx={{ minWidth: '40px' }}><BarChartIcon color="info" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Mes con Más Cursos Nuevos: ${mesMasNuevos}`} /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><BarChartIcon color="secondary" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Mes con Mayor Total de Cursos Activos: ${mesMasActivos}`} /> </ListItem> </List>); } else { const monthData = displaySummaryData[0]; if (!monthData) return null; return (<List dense sx={{ '& .MuiListItemText-secondary': { fontSize: '0.8rem' } }}> <ListItem disablePadding> <ListItemIcon sx={{ minWidth: '40px' }}><CheckCircleOutlineIcon color="primary" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Nuevos Cursos en ${monthData.mesNombre}: ${monthData.cursosPorMes}`} /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><TrendingUpIcon color="success" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Cursos Activos de Meses Anteriores: ${monthData.cursosActivosAnteriores}`} /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><BarChartIcon color="secondary" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Total Cursos Activos en ${monthData.mesNombre}: ${monthData.totalCursosAcumulados}`} /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><CancelIcon color="error" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Cancelados/Suspendidos (iniciaban en ${monthData.mesNombre}): ${monthData.canceladosSuspendidos}`} /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><SettingsSuggestIcon color="warning" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Autogestionados (nuevos en ${monthData.mesNombre}): ${monthData.autogestionados} (${monthData.porcentajeAutogestionados.toFixed(1)}%)`} /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><PeopleIcon color="info" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Participantes (Nuevos Cursos ${monthData.mesNombre}): ${displayKpiData.totalParticipantes}`} secondary="Suma de participantes de cursos iniciados en el mes (filtrado)." /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><ShowChartIcon color="info" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Cursos en Plataforma Externa (nuevos en ${monthData.mesNombre}): ${monthData.plataformaExterna}`} /> </ListItem> </List>); } };
    const getReportTitle = () => { let title = `Reporte Cursos ${currentYear}`; const filtersApplied = []; if (selectedMinisterio !== 'all') filtersApplied.push(selectedMinisterio); if (selectedArea !== 'all') filtersApplied.push(selectedArea); if (selectedMonth !== 'all') filtersApplied.push(mesesFull[selectedMonth]); if (filtersApplied.length > 0) { title += ` (${filtersApplied.join(' / ')})`; } else if (selectedMonth === 'all') { title += " (Anual General)"; } return title; };

    const isFilterActive = useMemo(() => {
        return selectedMonth !== 'all' || selectedMinisterio !== 'all' || selectedArea !== 'all';
    }, [selectedMonth, selectedMinisterio, selectedArea]);

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
                            <InputLabel id="select-month-label">Mes</InputLabel>
                            <Select labelId="select-month-label" id="select-month" value={selectedMonth} label="Mes" onChange={handleMonthChange} startAdornment={<CalendarMonthIcon sx={{ mr: 1, color: 'action.active' }} />}>
                                <MenuItem value="all"> <em>Todos (Anual)</em> </MenuItem>
                                {mesesFull.map((nombreMes, index) => (<MenuItem key={index} value={index}>{nombreMes}</MenuItem>))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small" disabled={loading || !allMinisterios.length}>
                            <InputLabel id="select-ministerio-label">Ministerio</InputLabel>
                            <Select labelId="select-ministerio-label" id="select-ministerio" value={selectedMinisterio} label="Ministerio" onChange={handleMinisterioChange} startAdornment={<AccountBalanceIcon sx={{ mr: 1, color: 'action.active' }} />}>
                                {allMinisterios.map((min, index) => (<MenuItem key={index} value={min}>{min === 'all' ? <em>Todos los Ministerios</em> : min}</MenuItem>))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small" disabled={loading || selectedMinisterio === 'all' || availableAreas.length <= 1}>
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

            {!loading && !error && rawCronogramaData.length > 0 && (
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

                    {allMonthsData.length > 0 ? (
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
                                            {displayChartData.monthlyCourseDetail ? (<Bar options={barMonthlyCourseDetailOptions} data={displayChartData.monthlyCourseDetail} />) : <Typography>Cargando detalle de cursos...</Typography>}
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
                                            <Typography variant="h6" component="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <BarChartIcon sx={{ mr: 1 }} color="primary" /> {`Resumen ${mesesFull[selectedMonth]} ${currentYear}`}
                                            </Typography>
                                            {renderSummaryText()}
                                        </Paper>
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    ) : (
                        !loading && <Paper elevation={3} sx={{ p: 3, mt: 3, textAlign: 'center' }}>
                            <Typography variant="h6" gutterBottom>Sin resultados</Typography>
                            <Typography variant="body1" color="textSecondary"> No se encontraron datos de cursos que coincidan con los filtros seleccionados para el año {currentYear}. </Typography>
                        </Paper>
                    )}
                </>
            )}

            {!loading && !error && rawCronogramaData.length === 0 && (
                <Paper elevation={3} sx={{ p: 3, mt: 3, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>No hay datos disponibles</Typography>
                    <Typography variant="body1" color="textSecondary"> No se encontraron datos de cursos iniciales para el año {currentYear}. Verifica la fuente de datos. </Typography>
                </Paper>
            )}
        </Box>
    );
};

export default ReporteCursosCC;