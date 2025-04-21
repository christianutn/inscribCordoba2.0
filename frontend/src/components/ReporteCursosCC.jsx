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

import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const parseDateString = (dateString) => { if (!dateString || typeof dateString !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) { return null; } try { const [year, month, day] = dateString.split('-').map(Number); if (month < 1 || month > 12 || day < 1 || day > 31) { return null; } const date = new Date(Date.UTC(year, month - 1, day)); if (isNaN(date.getTime()) || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) { return null; } return date; } catch (e) { console.error("Error parsing date:", dateString, e); return null; } };
function transformarEnObjetosClaveValor(matriz) { if (!Array.isArray(matriz) || matriz.length < 1) return []; const [cabecera, ...filas] = matriz; if (!Array.isArray(cabecera) || cabecera.length === 0) return []; return filas.map((fila) => { const obj = {}; if (!Array.isArray(fila)) return {}; cabecera.forEach((columna, i) => { obj[columna] = (i < fila.length && fila[i] != null) ? String(fila[i]) : ''; }); return obj; }); }
const mesesAbrev = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const mesesFull = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function KpiCard({ title, value, icon, color = 'primary', description }) {
    const IconComponent = icon;
    return (<Card elevation={3} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}> <CardContent sx={{ flexGrow: 1 }}> <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}> <> {IconComponent && (<Box component="span" sx={{ mr: 1.5, display: 'flex', alignItems: 'center', color: theme => theme.palette[color]?.main ?? theme.palette.primary.main }}> {IconComponent} </Box>)} <Typography variant="h6" component="div" color="text.secondary" sx={{ fontSize: '1rem' }}> {title} </Typography> </> </Box> <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1, fontSize: '2rem' }}> {value} </Typography> {description && (<Typography variant="caption" color="text.secondary"> {description} </Typography>)} </CardContent> </Card>);
}

const ReporteCursosCC = () => {
    const [allMonthsData, setAllMonthsData] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('all'); // Initialize with 'all'
    const [displayChartData, setDisplayChartData] = useState(null);
    const [displayKpiData, setDisplayKpiData] = useState(null);
    const [displaySummaryData, setDisplaySummaryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const currentYear = new Date().getFullYear();

    const encontrarMesPico = (data, field) => { if (!data || data.length === 0) return 'N/A'; let maxVal = -Infinity; let mes = 'N/A'; data.forEach(item => { const currentVal = Number(item[field]); if (!isNaN(currentVal) && currentVal > maxVal) { maxVal = currentVal; mes = item.mesNombre; } }); return maxVal > 0 && mes !== 'N/A' ? `${mes} (${maxVal.toFixed(0)})` : (mes !== 'N/A' ? mes : 'N/A'); };

    useEffect(() => {
        const fetchDataAndProcess = async () => { setLoading(true); setError(null); setAllMonthsData([]); setDisplayChartData(null); setDisplayKpiData(null); setDisplaySummaryData(null); setSelectedMonth('all'); try { const rawData = await getCronograma(); if (!Array.isArray(rawData) || rawData.length < 2) { console.warn("Datos crudos no válidos o insuficientes."); setAllMonthsData([]); } else { const cronograma = transformarEnObjetosClaveValor(rawData); if (!cronograma || cronograma.length === 0) { console.log("No se encontraron datos válidos tras transformar."); setAllMonthsData([]); } else { const summaryData = []; for (let mesIndex = 0; mesIndex < 12; mesIndex++) { let cursosPorMes = 0, cursosActivosAnteriores = 0, plataformaExterna = 0, canceladosSuspendidos = 0, autogestionados = 0; cronograma.forEach(curso => { if (!curso || typeof curso !== 'object') return; const fechaInicioCursoStr = curso["Fecha inicio del curso"]; const fechaFinCursoStr = curso["Fecha fin del curso"]; const estadoCurso = (curso["Estado"] || "").toUpperCase().trim(); const nombreCorto = curso["Código del curso"] || ""; const esAutogestionado = (curso["Es Autogestionado"] || "").toUpperCase() === "SI"; const fechaInicioObj = parseDateString(fechaInicioCursoStr); const fechaFinObj = parseDateString(fechaFinCursoStr); if (!fechaInicioObj || !fechaFinObj) return; const anioInicioCurso = fechaInicioObj.getUTCFullYear(); if (anioInicioCurso !== currentYear) return; const mesInicioCurso = fechaInicioObj.getUTCMonth(); const mesFinCurso = fechaFinObj.getUTCMonth(); const anioFinCurso = fechaFinObj.getUTCFullYear(); const isCancelledOrSuspended = estadoCurso === "SUSPENDIDO" || estadoCurso === "CANCELADO"; if (mesInicioCurso === mesIndex && !isCancelledOrSuspended) { cursosPorMes++; if (nombreCorto.startsWith("EXT-")) plataformaExterna++; if (esAutogestionado) autogestionados++; } else if (mesInicioCurso < mesIndex && anioInicioCurso === currentYear && mesFinCurso >= mesIndex && anioFinCurso === currentYear && !isCancelledOrSuspended) { cursosActivosAnteriores++; } if (mesInicioCurso === mesIndex && isCancelledOrSuspended) { canceladosSuspendidos++; } }); const totalCursosAcumulados = cursosPorMes + cursosActivosAnteriores; const porcentajeAutogestionadosNum = cursosPorMes > 0 ? (autogestionados / cursosPorMes) * 100 : 0; summaryData.push({ id: mesIndex, mesAbrev: mesesAbrev[mesIndex], mesNombre: mesesFull[mesIndex], cursosPorMes, cursosActivosAnteriores, plataformaExterna, totalCursosAcumulados, canceladosSuspendidos, autogestionados, porcentajeAutogestionados: porcentajeAutogestionadosNum }); } setAllMonthsData(summaryData); } } } catch (error) { console.error("Error en fetchDataAndProcess:", error); setError(error.message || "Ocurrió un error desconocido."); } finally { setLoading(false); } };
        fetchDataAndProcess();
    }, [currentYear]);

    useEffect(() => {
        if (allMonthsData.length === 0 && !loading) { setDisplayKpiData(null); setDisplayChartData(null); setDisplaySummaryData(null); return; }

        if (selectedMonth === 'all') {
            const totalNuevosAnual = allMonthsData.reduce((sum, m) => sum + m.cursosPorMes, 0);
            const totalCanceladosAnual = allMonthsData.reduce((sum, m) => sum + m.canceladosSuspendidos, 0);
            const totalActivosAcc = allMonthsData.reduce((sum, m) => sum + m.totalCursosAcumulados, 0);
            const promedioActivosMes = allMonthsData.length > 0 ? (totalActivosAcc / allMonthsData.length) : 0;
            const totalAutogestionadosAnual = allMonthsData.reduce((sum, m) => sum + m.autogestionados, 0);
            const porcentajeAutogestionadoAnual = totalNuevosAnual > 0 ? (totalAutogestionadosAnual / totalNuevosAnual) * 100 : 0;
            setDisplayKpiData({ nuevos: totalNuevosAnual, cancelados: totalCanceladosAnual, activosPromedio: promedioActivosMes.toFixed(1), porcAutogestionado: porcentajeAutogestionadoAnual.toFixed(1) + '%', isAnnual: true });
            const labels = allMonthsData.map(d => d.mesAbrev);
            setDisplayChartData({ labels, tendencias: { datasets: [{ label: 'Nuevos', data: allMonthsData.map(d => d.cursosPorMes), borderColor: 'rgb(53, 162, 235)', backgroundColor: 'rgba(53, 162, 235, 0.5)', yAxisID: 'y', tension: 0.1 }, { label: 'Total Act.', data: allMonthsData.map(d => d.totalCursosAcumulados), borderColor: 'rgb(75, 192, 192)', backgroundColor: 'rgba(75, 192, 192, 0.5)', yAxisID: 'y', tension: 0.1 }, { label: 'Canc/Susp.', data: allMonthsData.map(d => d.canceladosSuspendidos), borderColor: 'rgb(255, 99, 132)', backgroundColor: 'rgba(255, 99, 132, 0.5)', yAxisID: 'y', tension: 0.1 },] }, composicionActivos: { datasets: [{ label: 'Nuevos Mes', data: allMonthsData.map(d => d.cursosPorMes), backgroundColor: 'rgba(53, 162, 235, 0.7)', stack: 'Stack 0' }, { label: 'Act. Ant.', data: allMonthsData.map(d => d.cursosActivosAnteriores), backgroundColor: 'rgba(75, 192, 192, 0.7)', stack: 'Stack 0' },] }, porcentajeAutogestion: { datasets: [{ label: '% Autogest. (s/Nuevos)', data: allMonthsData.map(d => d.porcentajeAutogestionados), borderColor: 'rgb(255, 159, 64)', backgroundColor: 'rgba(255, 159, 64, 0.5)', yAxisID: 'yPercentage', tension: 0.1, pointRadius: 4, pointHoverRadius: 6, fill: false }] } });
            setDisplaySummaryData(allMonthsData);
        } else {
            const monthIndex = parseInt(selectedMonth, 10);
            const monthData = allMonthsData.find(m => m.id === monthIndex);
            if (monthData) {
                setDisplayKpiData({ nuevos: monthData.cursosPorMes, cancelados: monthData.canceladosSuspendidos, activosPromedio: monthData.totalCursosAcumulados, porcAutogestionado: monthData.porcentajeAutogestionados.toFixed(1) + '%', isAnnual: false, monthName: monthData.mesNombre });
                const monthlyBarLabels = ['Nuevos', 'Act. Ant.', 'Canc/Susp.', 'Autogest. (Nuevo)'];
                const monthlyBarData = [monthData.cursosPorMes, monthData.cursosActivosAnteriores, monthData.canceladosSuspendidos, monthData.autogestionados];
                setDisplayChartData({ labels: monthlyBarLabels, monthlyDetail: { datasets: [{ label: `Datos de ${monthData.mesNombre}`, data: monthlyBarData, backgroundColor: ['rgba(53, 162, 235, 0.7)', 'rgba(75, 192, 192, 0.7)', 'rgba(255, 99, 132, 0.7)', 'rgba(255, 159, 64, 0.7)',], borderColor: ['rgb(53, 162, 235)', 'rgb(75, 192, 192)', 'rgb(255, 99, 132)', 'rgb(255, 159, 64)',], borderWidth: 1 }] }, tendencias: null, composicionActivos: null, porcentajeAutogestion: null });
                setDisplaySummaryData([monthData]);
            } else {
                setDisplayKpiData(null); setDisplayChartData(null); setDisplaySummaryData(null); console.warn(`No se encontraron datos para el mes seleccionado: ${selectedMonth}`);
            }
        }
    }, [selectedMonth, allMonthsData, loading]); // Added loading dependency

    const handleMonthChange = (event) => { const value = event.target.value; setSelectedMonth(value); }; // Simplified

    const commonChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' }, title: { display: true, font: { size: 16 }, padding: { top: 10, bottom: 20 } }, tooltip: { mode: 'index', intersect: false, backgroundColor: 'rgba(0, 0, 0, 0.8)', titleFont: { size: 14 }, bodyFont: { size: 12 }, padding: 10, cornerRadius: 4 }, }, scales: { x: { display: true, title: { display: false }, grid: { display: false }, ticks: { font: { size: 11 } } }, y: { display: true, position: 'left', title: { display: true, text: 'Cantidad de Cursos' }, beginAtZero: true, grid: { color: '#eee' }, ticks: { font: { size: 11 } } }, yPercentage: { display: true, position: 'right', title: { display: true, text: 'Porcentaje (%)' }, min: 0, max: 100, grid: { drawOnChartArea: false }, ticks: { callback: (value) => value + '%', font: { size: 11 } } } }, interaction: { mode: 'nearest', axis: 'x', intersect: false }, animation: { duration: 500 } };
    const stackedBarOptionsAnnual = { ...commonChartOptions, plugins: { ...commonChartOptions.plugins, title: { ...commonChartOptions.plugins.title, text: 'Composición Cursos Activos/Mes' } }, scales: { x: { ...commonChartOptions.scales.x, stacked: true }, y: { ...commonChartOptions.scales.y, stacked: true, title: { display: true, text: 'Total Cursos Activos' } }, yPercentage: { display: false } } };
    const lineTrendsOptionsAnnual = { ...commonChartOptions, plugins: { ...commonChartOptions.plugins, title: { ...commonChartOptions.plugins.title, text: 'Tendencia Mensual' } }, scales: { ...commonChartOptions.scales, yPercentage: { display: false } } };
    const barMonthlyOptions = { ...commonChartOptions, indexAxis: 'y', plugins: { ...commonChartOptions.plugins, legend: { display: false }, title: { ...commonChartOptions.plugins.title, text: `Detalle Cursos ${displayKpiData?.monthName ?? ''}` } }, scales: { x: { ...commonChartOptions.scales.y, position: 'bottom', title: { display: true, text: 'Cantidad' } }, y: { ...commonChartOptions.scales.x, type: 'category', title: { display: false } }, yPercentage: { display: false } } };

    const renderSummaryText = () => { if (!displaySummaryData || displaySummaryData.length === 0) return null; const textStyleProps = { primaryTypographyProps: { sx: { color: 'text.primary', fontWeight: 500 } } }; if (displayKpiData?.isAnnual) { const mesMasNuevos = encontrarMesPico(displaySummaryData, 'cursosPorMes'); const mesMasActivos = encontrarMesPico(displaySummaryData, 'totalCursosAcumulados'); return (<List dense sx={{ '& .MuiListItemText-secondary': { fontSize: '0.8rem' } }}> <ListItem disablePadding> <ListItemIcon sx={{ minWidth: '40px' }}><CheckCircleOutlineIcon color="success" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Total Nuevos Cursos (${currentYear}): ${displayKpiData.nuevos}`} secondary="Cantidad total de cursos que iniciaron durante el año." /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><HighlightOffIcon color="error" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Total Cancelados/Suspendidos: ${displayKpiData.cancelados}`} secondary="Cursos cuyo inicio estaba programado para este año pero fueron cancelados/suspendidos." /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><TrendingUpIcon color="action" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Promedio Cursos Activos por Mes: ${displayKpiData.activosPromedio}`} secondary="Número promedio de cursos en estado activo (nuevos + de meses anteriores) cada mes." /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><ShowChartIcon color="warning" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`% Autogestionados (sobre nuevos): ${displayKpiData.porcAutogestionado}`} secondary="Porcentaje anual de los nuevos cursos iniciados que fueron de tipo autogestionado." /> </ListItem> <Divider component="li" sx={{ my: 2 }} /> <ListItem disablePadding> <ListItemIcon sx={{ minWidth: '40px' }}><BarChartIcon color="info" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Mes con Más Cursos Nuevos: ${mesMasNuevos}`} /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><BarChartIcon color="secondary" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Mes con Mayor Total de Cursos Activos: ${mesMasActivos}`} /> </ListItem> </List>); } else { const monthData = displaySummaryData[0]; if (!monthData) return null; return (<List dense sx={{ '& .MuiListItemText-secondary': { fontSize: '0.8rem' } }}> <ListItem disablePadding> <ListItemIcon sx={{ minWidth: '40px' }}><CheckCircleOutlineIcon color="primary" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Nuevos Cursos en ${monthData.mesNombre}: ${monthData.cursosPorMes}`} /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><TrendingUpIcon color="success" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Cursos Activos de Meses Anteriores: ${monthData.cursosActivosAnteriores}`} /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><BarChartIcon color="secondary" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Total Cursos Activos en ${monthData.mesNombre}: ${monthData.totalCursosAcumulados}`} /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><CancelIcon color="error" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Cancelados/Suspendidos (iniciaban en ${monthData.mesNombre}): ${monthData.canceladosSuspendidos}`} /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><SettingsSuggestIcon color="warning" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Autogestionados (nuevos en ${monthData.mesNombre}): ${monthData.autogestionados} (${monthData.porcentajeAutogestionados.toFixed(1)}%)`} /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><ShowChartIcon color="info" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Cursos en Plataforma Externa (nuevos en ${monthData.mesNombre}): ${monthData.plataformaExterna}`} /> </ListItem> </List>); } };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom component="h1" sx={{ mb: 1, textAlign: 'center', fontWeight: 'bold' }}>
                Reporte Cursos ({selectedMonth === 'all' ? currentYear : `${mesesFull[selectedMonth]} ${currentYear}`})
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <FormControl sx={{ m: 1, minWidth: 200 }} size="small" disabled={loading || !allMonthsData.length}>
                    <InputLabel id="select-month-label">Filtrar por Mes</InputLabel>
                    <Select labelId="select-month-label" id="select-month" value={selectedMonth} label="Filtrar por Mes" onChange={handleMonthChange}>
                        <MenuItem value="all"> <em>Todos los Meses (Anual)</em> </MenuItem>
                        {mesesFull.map((nombreMes, index) => (<MenuItem key={index} value={index}>{nombreMes}</MenuItem>))}
                    </Select>
                </FormControl>
            </Box>

            {loading && (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}> <CircularProgress /> <Typography sx={{ ml: 2 }}>Cargando datos...</Typography> </Box>)}
            {error && !loading && (<Alert severity="error" sx={{ my: 2 }} elevation={3}> <strong>Error al cargar el reporte:</strong> {error} </Alert>)}

            {!loading && !error && allMonthsData.length > 0 && (
                <Grid container spacing={3}>
                    {displayKpiData && (<> <Grid item xs={12} sm={6} md={3}> <KpiCard title="Nuevos Cursos" value={displayKpiData.nuevos ?? 'N/A'} icon={<AddCircleOutlineIcon />} color="primary" description={displayKpiData.isAnnual ? `Total en ${currentYear}` : `En ${displayKpiData.monthName}`} /> </Grid> <Grid item xs={12} sm={6} md={3}> <KpiCard title="Cancelados/Susp." value={displayKpiData.cancelados ?? 'N/A'} icon={<CancelIcon />} color="error" description={displayKpiData.isAnnual ? `Iniciaban en ${currentYear}` : `Iniciaban en ${displayKpiData.monthName}`} /> </Grid> <Grid item xs={12} sm={6} md={3}> <KpiCard title={displayKpiData.isAnnual ? "Activos Prom./Mes" : "Total Activos Mes"} value={displayKpiData.activosPromedio ?? 'N/A'} icon={<TrendingUpIcon />} color="success" description={displayKpiData.isAnnual ? `Promedio ${currentYear}` : `En ${displayKpiData.monthName}`} /> </Grid> <Grid item xs={12} sm={6} md={3}> <KpiCard title="% Autogestionados" value={displayKpiData.porcAutogestionado ?? 'N/A'} icon={<SettingsSuggestIcon />} color="warning" description={displayKpiData.isAnnual ? `Anual (s/ nuevos)` : `En ${displayKpiData.monthName} (s/ nuevos)`} /> </Grid> <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid> </>)}
                    {displayChartData && (
                        <>
                            {(selectedMonth === 'all') ? (
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
                    )}
                    {displaySummaryData && (<Grid item xs={12}> <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mt: 3 }}> <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}> <BarChartIcon sx={{ mr: 1 }} color="primary" /> {selectedMonth === 'all' ? `Resumen Anual y Observaciones (${currentYear})` : `Resumen ${mesesFull[selectedMonth]} ${currentYear}`} </Typography> {renderSummaryText()} </Paper> </Grid>)}
                </Grid>
            )}
            {!loading && !error && allMonthsData.length === 0 && (<Paper elevation={3} sx={{ p: 3, mt: 3, textAlign: 'center' }}> <Typography variant="h6" gutterBottom>No hay datos disponibles</Typography> <Typography variant="body1" color="textSecondary"> No se encontraron datos de cursos para el año {currentYear}. Verifica la fuente de datos. </Typography> </Paper>)}
        </Container>
    );
}

export default ReporteCursosCC;