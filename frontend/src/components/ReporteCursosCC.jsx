import React, { useEffect, useState } from "react";
import { getCronograma } from "../services/googleSheets.service";
import {
    Box, CircularProgress, Typography, Alert, Container, Paper, Grid,
    Card, CardContent, Divider, List, ListItem, ListItemIcon, ListItemText,
    FormControl, InputLabel, Select, MenuItem
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
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';


import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const parseDateString = (dateString) => { if (!dateString || typeof dateString !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) { return null; } try { const [year, month, day] = dateString.split('-').map(Number); if (month < 1 || month > 12 || day < 1 || day > 31) { return null; } const date = new Date(Date.UTC(year, month - 1, day)); if (isNaN(date.getTime()) || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) { return null; } return date; } catch (e) { console.error("Error parsing date:", dateString, e); return null; } };
function transformarEnObjetosClaveValor(matriz) { if (!Array.isArray(matriz) || matriz.length < 1) return []; const [cabecera, ...filas] = matriz; if (!Array.isArray(cabecera) || cabecera.length === 0) return []; return filas.map((fila) => { const obj = {}; if (!Array.isArray(fila)) return {}; cabecera.forEach((columna, i) => { obj[columna] = (i < fila.length && fila[i] != null) ? String(fila[i]).trim() : ''; }); return obj; }); }
const mesesAbrev = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const mesesFull = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const ALL_FILTER_VALUE = 'all';

function KpiCard({ title, value, icon, color = 'primary', description }) { const IconComponent = icon; return (<Card elevation={3} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}> <CardContent sx={{ flexGrow: 1 }}> <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}> <> {IconComponent && (<Box component="span" sx={{ mr: 1.5, display: 'flex', alignItems: 'center', color: theme => theme.palette[color]?.main ?? theme.palette.primary.main }}> {IconComponent} </Box>)} <Typography variant="h6" component="div" color="text.secondary" sx={{ fontSize: '1rem' }}> {title} </Typography> </> </Box> <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1, fontSize: '2rem' }}> {value} </Typography> {description && (<Typography variant="caption" color="text.secondary"> {description} </Typography>)} </CardContent> </Card>); }

const ReporteCursosCC = () => {
    const [rawCourseData, setRawCourseData] = useState([]);
    const [ministryOptions, setMinistryOptions] = useState([]);
    const [areaOptions, setAreaOptions] = useState([]);
    const [selectedMinistry, setSelectedMinistry] = useState(ALL_FILTER_VALUE);
    const [selectedArea, setSelectedArea] = useState(ALL_FILTER_VALUE);
    const [selectedMonth, setSelectedMonth] = useState(ALL_FILTER_VALUE);
    const [processedMonthlyData, setProcessedMonthlyData] = useState([]);
    const [displayChartData, setDisplayChartData] = useState(null);
    const [displayKpiData, setDisplayKpiData] = useState(null);
    const [displaySummaryData, setDisplaySummaryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const currentYear = new Date().getFullYear();

    const encontrarMesPico = (data, field) => { if (!data || data.length === 0) return 'N/A'; let maxVal = -Infinity; let mes = 'N/A'; data.forEach(item => { const currentVal = Number(item[field]); if (!isNaN(currentVal) && currentVal > maxVal) { maxVal = currentVal; mes = item.mesNombre; } }); return maxVal > 0 && mes !== 'N/A' ? `${mes} (${maxVal.toFixed(0)})` : (mes !== 'N/A' ? mes : 'N/A'); };
    const getUniqueSortedOptions = (data, field) => { if (!data || data.length === 0) return []; const uniqueValues = [...new Set(data.map(item => item[field]?.trim()))].filter(Boolean); return uniqueValues.sort((a, b) => a.localeCompare(b)); };

    useEffect(() => {
        const fetchDataAndInit = async () => { setLoading(true); setError(null); setRawCourseData([]); setMinistryOptions([]); setAreaOptions([]); setSelectedMinistry(ALL_FILTER_VALUE); setSelectedArea(ALL_FILTER_VALUE); setSelectedMonth(ALL_FILTER_VALUE); try { const rawData = await getCronograma(); if (!Array.isArray(rawData) || rawData.length < 2) { console.warn("Datos crudos no válidos o insuficientes."); } else { const transformedData = transformarEnObjetosClaveValor(rawData); setRawCourseData(transformedData); setMinistryOptions(getUniqueSortedOptions(transformedData, 'Ministerio')); setAreaOptions(getUniqueSortedOptions(transformedData, 'Área')); } } catch (err) { console.error("Error fetching or processing initial data:", err); setError(err.message || "Error al cargar datos iniciales."); } finally { setLoading(false); } };
        fetchDataAndInit();
    }, []);

    useEffect(() => {
        if (loading || rawCourseData.length === 0) { setProcessedMonthlyData([]); setDisplayKpiData(null); setDisplayChartData(null); setDisplaySummaryData(null); return; }

        const filteredCourses = rawCourseData.filter(curso => {
            const ministryMatch = selectedMinistry === ALL_FILTER_VALUE || curso['Ministerio'] === selectedMinistry;
            const areaMatch = selectedArea === ALL_FILTER_VALUE || curso['Área'] === selectedArea;
            return ministryMatch && areaMatch;
        });

        const monthlySummary = [];
        for (let mesIndex = 0; mesIndex < 12; mesIndex++) { let cursosPorMes = 0, cursosActivosAnteriores = 0, plataformaExterna = 0, canceladosSuspendidos = 0, autogestionados = 0; filteredCourses.forEach(curso => { if (!curso || typeof curso !== 'object') return; const fechaInicioCursoStr = curso["Fecha inicio del curso"]; const fechaFinCursoStr = curso["Fecha fin del curso"]; const estadoCurso = (curso["Estado"] || "").toUpperCase().trim(); const nombreCorto = curso["Código del curso"] || ""; const esAutogestionado = (curso["Es Autogestionado"] || "").toUpperCase() === "SI"; const fechaInicioObj = parseDateString(fechaInicioCursoStr); const fechaFinObj = parseDateString(fechaFinCursoStr); if (!fechaInicioObj || !fechaFinObj) return; const anioInicioCurso = fechaInicioObj.getUTCFullYear(); if (anioInicioCurso !== currentYear) return; const mesInicioCurso = fechaInicioObj.getUTCMonth(); const mesFinCurso = fechaFinObj.getUTCMonth(); const anioFinCurso = fechaFinObj.getUTCFullYear(); const isCancelledOrSuspended = estadoCurso === "SUSPENDIDO" || estadoCurso === "CANCELADO"; if (mesInicioCurso === mesIndex && !isCancelledOrSuspended) { cursosPorMes++; if (nombreCorto.startsWith("EXT-")) plataformaExterna++; if (esAutogestionado) autogestionados++; } else if (mesInicioCurso < mesIndex && anioInicioCurso === currentYear && mesFinCurso >= mesIndex && anioFinCurso === currentYear && !isCancelledOrSuspended) { cursosActivosAnteriores++; } if (mesInicioCurso === mesIndex && isCancelledOrSuspended) { canceladosSuspendidos++; } }); const totalCursosAcumulados = cursosPorMes + cursosActivosAnteriores; const porcentajeAutogestionadosNum = cursosPorMes > 0 ? (autogestionados / cursosPorMes) * 100 : 0; monthlySummary.push({ id: mesIndex, mesAbrev: mesesAbrev[mesIndex], mesNombre: mesesFull[mesIndex], cursosPorMes, cursosActivosAnteriores, plataformaExterna, totalCursosAcumulados, canceladosSuspendidos, autogestionados, porcentajeAutogestionados: porcentajeAutogestionadosNum }); }
        setProcessedMonthlyData(monthlySummary);

        if (selectedMonth === ALL_FILTER_VALUE) { const totalNuevosAnual = monthlySummary.reduce((sum, m) => sum + m.cursosPorMes, 0); const totalCanceladosAnual = monthlySummary.reduce((sum, m) => sum + m.canceladosSuspendidos, 0); const totalActivosAcc = monthlySummary.reduce((sum, m) => sum + m.totalCursosAcumulados, 0); const promedioActivosMes = monthlySummary.length > 0 ? (totalActivosAcc / monthlySummary.length) : 0; const totalAutogestionadosAnual = monthlySummary.reduce((sum, m) => sum + m.autogestionados, 0); const porcentajeAutogestionadoAnual = totalNuevosAnual > 0 ? (totalAutogestionadosAnual / totalNuevosAnual) * 100 : 0; setDisplayKpiData({ nuevos: totalNuevosAnual, cancelados: totalCanceladosAnual, activosPromedio: promedioActivosMes.toFixed(1), porcAutogestionado: porcentajeAutogestionadoAnual.toFixed(1) + '%', isAnnual: true }); const labels = monthlySummary.map(d => d.mesAbrev); setDisplayChartData({ labels, tendencias: { datasets: [{ label: 'Nuevos', data: monthlySummary.map(d => d.cursosPorMes), borderColor: 'rgb(53, 162, 235)', backgroundColor: 'rgba(53, 162, 235, 0.5)', yAxisID: 'y', tension: 0.1 }, { label: 'Total Act.', data: monthlySummary.map(d => d.totalCursosAcumulados), borderColor: 'rgb(75, 192, 192)', backgroundColor: 'rgba(75, 192, 192, 0.5)', yAxisID: 'y', tension: 0.1 }, { label: 'Canc/Susp.', data: monthlySummary.map(d => d.canceladosSuspendidos), borderColor: 'rgb(255, 99, 132)', backgroundColor: 'rgba(255, 99, 132, 0.5)', yAxisID: 'y', tension: 0.1 },] }, composicionActivos: { datasets: [{ label: 'Nuevos Mes', data: monthlySummary.map(d => d.cursosPorMes), backgroundColor: 'rgba(53, 162, 235, 0.7)', stack: 'Stack 0' }, { label: 'Act. Ant.', data: monthlySummary.map(d => d.cursosActivosAnteriores), backgroundColor: 'rgba(75, 192, 192, 0.7)', stack: 'Stack 0' },] } }); setDisplaySummaryData(monthlySummary); }
        else { const monthIndex = parseInt(selectedMonth, 10); const monthData = monthlySummary.find(m => m.id === monthIndex); if (monthData) { setDisplayKpiData({ nuevos: monthData.cursosPorMes, cancelados: monthData.canceladosSuspendidos, activosPromedio: monthData.totalCursosAcumulados, porcAutogestionado: monthData.porcentajeAutogestionados.toFixed(1) + '%', isAnnual: false, monthName: monthData.mesNombre }); const monthlyBarLabels = ['Nuevos', 'Act. Ant.', 'Canc/Susp.', 'Autogest.']; const monthlyBarData = [monthData.cursosPorMes, monthData.cursosActivosAnteriores, monthData.canceladosSuspendidos, monthData.autogestionados]; setDisplayChartData({ labels: monthlyBarLabels, monthlyDetail: { datasets: [{ label: `Datos de ${monthData.mesNombre}`, data: monthlyBarData, backgroundColor: ['rgba(53, 162, 235, 0.7)', 'rgba(75, 192, 192, 0.7)', 'rgba(255, 99, 132, 0.7)', 'rgba(255, 159, 64, 0.7)',], borderColor: ['rgb(53, 162, 235)', 'rgb(75, 192, 192)', 'rgb(255, 99, 132)', 'rgb(255, 159, 64)',], borderWidth: 1 }] } }); setDisplaySummaryData(monthlySummary.filter(m => m.id === monthIndex)); } else { setDisplayKpiData(null); setDisplayChartData(null); setDisplaySummaryData(null); console.warn(`No se encontraron datos para el mes seleccionado: ${selectedMonth}`); } }
    }, [rawCourseData, selectedMinistry, selectedArea, selectedMonth, loading, currentYear, setDisplayKpiData, setDisplayChartData, setDisplaySummaryData, setProcessedMonthlyData]);

    const handleMinistryChange = (event) => { setSelectedMinistry(event.target.value); };
    const handleAreaChange = (event) => { setSelectedArea(event.target.value); };
    const handleMonthChange = (event) => { setSelectedMonth(event.target.value); };

    const commonChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' }, title: { display: true, font: { size: 16 }, padding: { top: 10, bottom: 20 } }, tooltip: { mode: 'index', intersect: false, backgroundColor: 'rgba(0, 0, 0, 0.8)', titleFont: { size: 14 }, bodyFont: { size: 12 }, padding: 10, cornerRadius: 4 }, }, scales: { x: { display: true, title: { display: false }, grid: { display: false }, ticks: { font: { size: 11 } } }, y: { display: true, position: 'left', title: { display: true, text: 'Cantidad de Cursos' }, beginAtZero: true, grid: { color: '#eee' }, ticks: { font: { size: 11 } } }, yPercentage: { display: true, position: 'right', title: { display: true, text: 'Porcentaje (%)' }, min: 0, max: 100, grid: { drawOnChartArea: false }, ticks: { callback: (value) => value + '%', font: { size: 11 } } } }, interaction: { mode: 'nearest', axis: 'x', intersect: false }, animation: { duration: 500 } };
    const stackedBarOptionsAnnual = { ...commonChartOptions, plugins: { ...commonChartOptions.plugins, title: { ...commonChartOptions.plugins.title, text: 'Composición Cursos Activos/Mes' } }, scales: { x: { ...commonChartOptions.scales.x, stacked: true }, y: { ...commonChartOptions.scales.y, stacked: true, title: { display: true, text: 'Total Cursos Activos' } }, yPercentage: { display: false } } };
    const lineTrendsOptionsAnnual = { ...commonChartOptions, plugins: { ...commonChartOptions.plugins, title: { ...commonChartOptions.plugins.title, text: 'Tendencia Mensual' } }, scales: { ...commonChartOptions.scales, yPercentage: { display: false } } };
    const barMonthlyOptions = { ...commonChartOptions, indexAxis: 'y', plugins: { ...commonChartOptions.plugins, legend: { display: false }, title: { ...commonChartOptions.plugins.title, text: `Detalle Cursos ${displayKpiData?.monthName ?? ''}` } }, scales: { x: { ...commonChartOptions.scales.y, position: 'bottom', title: { display: true, text: 'Cantidad' } }, y: { ...commonChartOptions.scales.x, type: 'category', title: { display: false } }, yPercentage: { display: false } } };

    const renderSummaryText = () => { if (!displaySummaryData || displaySummaryData.length === 0 || !displayKpiData) return null; const textStyleProps = { primaryTypographyProps: { sx: { color: 'text.primary', fontWeight: 500 } } }; if (displayKpiData?.isAnnual) { const mesMasNuevos = encontrarMesPico(displaySummaryData, 'cursosPorMes'); const mesMasActivos = encontrarMesPico(displaySummaryData, 'totalCursosAcumulados'); return (<List dense sx={{ '& .MuiListItemText-secondary': { fontSize: '0.8rem' } }}> <ListItem disablePadding> <ListItemIcon sx={{ minWidth: '40px' }}><CheckCircleOutlineIcon color="success" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Total Nuevos Cursos (${currentYear}): ${displayKpiData.nuevos}`} secondary="Cantidad total de cursos que iniciaron durante el año." /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><HighlightOffIcon color="error" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Total Cancelados/Suspendidos: ${displayKpiData.cancelados}`} secondary="Cursos cuyo inicio estaba programado para este año pero fueron cancelados/suspendidos." /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><TrendingUpIcon color="action" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Promedio Cursos Activos por Mes: ${displayKpiData.activosPromedio}`} secondary="Número promedio de cursos en estado activo (nuevos + de meses anteriores) cada mes." /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><ShowChartIcon color="warning" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`% Autogestionados (sobre nuevos): ${displayKpiData.porcAutogestionado}`} secondary="Porcentaje anual de los nuevos cursos iniciados que fueron de tipo autogestionado." /> </ListItem> <Divider component="li" sx={{ my: 2 }} /> <ListItem disablePadding> <ListItemIcon sx={{ minWidth: '40px' }}><BarChartIcon color="info" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Mes con Más Cursos Nuevos: ${mesMasNuevos}`} /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><BarChartIcon color="secondary" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Mes con Mayor Total de Cursos Activos: ${mesMasActivos}`} /> </ListItem> </List>); } else { const monthData = displaySummaryData[0]; if (!monthData) return null; return (<List dense sx={{ '& .MuiListItemText-secondary': { fontSize: '0.8rem' } }}> <ListItem disablePadding> <ListItemIcon sx={{ minWidth: '40px' }}><CheckCircleOutlineIcon color="primary" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Nuevos Cursos en ${monthData.mesNombre}: ${monthData.cursosPorMes}`} /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><TrendingUpIcon color="success" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Cursos Activos de Meses Anteriores: ${monthData.cursosActivosAnteriores}`} /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><BarChartIcon color="secondary" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Total Cursos Activos en ${monthData.mesNombre}: ${monthData.totalCursosAcumulados}`} /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><CancelIcon color="error" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Cancelados/Suspendidos (iniciaban en ${monthData.mesNombre}): ${monthData.canceladosSuspendidos}`} /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><SettingsSuggestIcon color="warning" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Autogestionados (nuevos en ${monthData.mesNombre}): ${monthData.autogestionados} (${monthData.porcentajeAutogestionados.toFixed(1)}%)`} /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><ShowChartIcon color="info" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Cursos en Plataforma Externa (nuevos en ${monthData.mesNombre}): ${monthData.plataformaExterna}`} /> </ListItem> </List>); } };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom component="h1" sx={{ mb: 1, textAlign: 'center', fontWeight: 'bold' }}>
                Reporte Cursos ({currentYear})
            </Typography>

            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center" justifyContent="center">
                    <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth size="small" disabled={loading || ministryOptions.length === 0}>
                            <InputLabel id="select-ministry-label">Ministerio</InputLabel>
                            <Select labelId="select-ministry-label" id="select-ministry" value={selectedMinistry} label="Ministerio" onChange={handleMinistryChange}>
                                <MenuItem value={ALL_FILTER_VALUE}><em>Todos</em></MenuItem>
                                {ministryOptions.map((min, index) => (<MenuItem key={index} value={min}>{min}</MenuItem>))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth size="small" disabled={loading /* || areaOptions.length === 0 */}> {/* CORRECCIÓN AQUÍ */}
                            <InputLabel id="select-area-label">Área</InputLabel>
                            <Select labelId="select-area-label" id="select-area" value={selectedArea} label="Área" onChange={handleAreaChange}>
                                <MenuItem value={ALL_FILTER_VALUE}><em>Todas</em></MenuItem>
                                {areaOptions.map((area, index) => (<MenuItem key={index} value={area}>{area}</MenuItem>))}
                                {/* Descomentar cuando tengas areaOptions */}
                                {/* <MenuItem value="Area 1 (Ejemplo)">Area 1 (Ejemplo)</MenuItem>
                                   <MenuItem value="Area 2 (Ejemplo)">Area 2 (Ejemplo)</MenuItem> */}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth size="small" disabled={loading || rawCourseData.length === 0}>
                            <InputLabel id="select-month-label">Mes</InputLabel>
                            <Select labelId="select-month-label" id="select-month" value={selectedMonth} label="Mes" onChange={handleMonthChange}>
                                <MenuItem value={ALL_FILTER_VALUE}><em>Todo el Año</em></MenuItem>
                                {mesesFull.map((nombreMes, index) => (<MenuItem key={index} value={index}>{nombreMes}</MenuItem>))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {loading && (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}> <CircularProgress /> <Typography sx={{ ml: 2 }}>Cargando datos...</Typography> </Box>)}
            {error && !loading && (<Alert severity="error" sx={{ my: 2 }} elevation={3}> <strong>Error al cargar el reporte:</strong> {error} </Alert>)}

            {!loading && !error && rawCourseData.length > 0 && (
                <Grid container spacing={3}>
                    {displayKpiData && (<> <Grid item xs={12} sm={6} md={3}> <KpiCard title="Nuevos Cursos" value={displayKpiData.nuevos ?? 'N/A'} icon={<AddCircleOutlineIcon />} color="primary" description={displayKpiData.isAnnual ? `Total ${currentYear}` : `En ${displayKpiData.monthName}`} /> </Grid> <Grid item xs={12} sm={6} md={3}> <KpiCard title="Cancelados/Susp." value={displayKpiData.cancelados ?? 'N/A'} icon={<CancelIcon />} color="error" description={displayKpiData.isAnnual ? `Iniciaban en ${currentYear}` : `En ${displayKpiData.monthName}`} /> </Grid> <Grid item xs={12} sm={6} md={3}> <KpiCard title={displayKpiData.isAnnual ? "Activos Prom./Mes" : "Total Activos Mes"} value={displayKpiData.activosPromedio ?? 'N/A'} icon={<TrendingUpIcon />} color="success" description={displayKpiData.isAnnual ? `Promedio ${currentYear}` : `En ${displayKpiData.monthName}`} /> </Grid> <Grid item xs={12} sm={6} md={3}> <KpiCard title="% Autogestionados" value={displayKpiData.porcAutogestionado ?? 'N/A'} icon={<SettingsSuggestIcon />} color="warning" description={displayKpiData.isAnnual ? `Anual (s/ nuevos)` : `En ${displayKpiData.monthName} (s/ nuevos)`} /> </Grid> <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid> </>)}
                    {displayChartData && processedMonthlyData.length > 0 ? (
                        <>
                            {(selectedMonth === ALL_FILTER_VALUE) ? (
                                <>
                                    <Grid item xs={12} md={6}> <Paper elevation={2} sx={{ p: 2, height: { xs: 350, md: 400 } }}> <Line options={lineTrendsOptionsAnnual} data={{ labels: displayChartData.labels, datasets: displayChartData.tendencias?.datasets ?? [] }} /> </Paper> </Grid>
                                    <Grid item xs={12} md={6}> <Paper elevation={2} sx={{ p: 2, height: { xs: 350, md: 400 } }}> <Bar options={stackedBarOptionsAnnual} data={{ labels: displayChartData.labels, datasets: displayChartData.composicionActivos?.datasets ?? [] }} /> </Paper> </Grid>
                                </>
                            ) : (
                                <>
                                    <Grid item xs={12} md={6}>
                                        <Paper elevation={2} sx={{ p: 2, height: { xs: 350, md: 400 } }}>
                                            {displayChartData.monthlyDetail ? (<Bar options={barMonthlyOptions} data={{ labels: displayChartData.labels, datasets: displayChartData.monthlyDetail.datasets }} />) : (<Typography>No hay datos para el gráfico mensual.</Typography>)}
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }} />
                                </>
                            )}
                        </>
                    ) : (!loading && <Grid item xs={12}> <Typography sx={{ textAlign: 'center', my: 4, color: 'text.secondary' }}> {selectedMonth !== ALL_FILTER_VALUE ? 'No hay datos para mostrar en gráficos para la selección actual.' : 'No hay datos anuales para mostrar en gráficos.'} </Typography> </Grid>)}
                    {displaySummaryData && processedMonthlyData.length > 0 ? (<Grid item xs={12}> <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mt: 3 }}> <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}> <BarChartIcon sx={{ mr: 1 }} color="primary" /> {selectedMonth === ALL_FILTER_VALUE ? `Resumen Anual y Observaciones (${currentYear})` : `Resumen ${mesesFull[selectedMonth]} ${currentYear}`} </Typography> {renderSummaryText()} </Paper> </Grid>) : (!loading && <Grid item xs={12}> <Typography sx={{ textAlign: 'center', my: 4, color: 'text.secondary' }}> No hay datos para generar el resumen para la selección actual. </Typography> </Grid>)}
                </Grid>
            )}
            {!loading && !error && rawCourseData.length === 0 && (<Paper elevation={3} sx={{ p: 3, mt: 3, textAlign: 'center' }}> <Typography variant="h6" gutterBottom>No hay datos disponibles</Typography> <Typography variant="body1" color="textSecondary"> No se encontraron datos de cursos para el año {currentYear}. Verifica la fuente de datos. </Typography> </Paper>)}
        </Container>
    );
}

export default ReporteCursosCC;