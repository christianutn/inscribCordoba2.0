import React, { useEffect, useState, useMemo } from "react"; // useMemo añadido
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
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'; // Icono para Ministerio
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial'; // Icono para Area

import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

// --- Helper Functions (sin cambios) ---
const parseDateString = (dateString) => { if (!dateString || typeof dateString !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) { return null; } try { const [year, month, day] = dateString.split('-').map(Number); if (month < 1 || month > 12 || day < 1 || day > 31) { return null; } const date = new Date(Date.UTC(year, month - 1, day)); if (isNaN(date.getTime()) || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) { return null; } return date; } catch (e) { console.error("Error parsing date:", dateString, e); return null; } };
function transformarEnObjetosClaveValor(matriz) { if (!Array.isArray(matriz) || matriz.length < 1) return []; const [cabecera, ...filas] = matriz; if (!Array.isArray(cabecera) || cabecera.length === 0) return []; return filas.map((fila) => { const obj = {}; if (!Array.isArray(fila)) return {}; cabecera.forEach((columna, i) => { obj[columna.trim()] = (i < fila.length && fila[i] != null) ? String(fila[i]).trim() : ''; }); return obj; }); } // Añadido trim() a claves y valores
const mesesAbrev = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const mesesFull = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const encontrarMesPico = (data, field) => { if (!data || data.length === 0) return 'N/A'; let maxVal = -Infinity; let mes = 'N/A'; data.forEach(item => { const currentVal = Number(item[field]); if (!isNaN(currentVal) && currentVal > maxVal) { maxVal = currentVal; mes = item.mesNombre; } }); return maxVal > 0 && mes !== 'N/A' ? `${mes} (${maxVal.toFixed(0)})` : (mes !== 'N/A' ? mes : 'N/A'); };

// --- KpiCard Component (sin cambios) ---
function KpiCard({ title, value, icon, color = 'primary', description }) {
    const IconComponent = icon;
    return (<Card elevation={3} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}> <CardContent sx={{ flexGrow: 1 }}> <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}> <> {IconComponent && (<Box component="span" sx={{ mr: 1.5, display: 'flex', alignItems: 'center', color: theme => theme.palette[color]?.main ?? theme.palette.primary.main }}> {React.cloneElement(IconComponent, { fontSize: 'large' })} {/* Aumentar tamaño icono */} </Box>)} <Typography variant="h6" component="div" color="text.secondary" sx={{ fontSize: '0.9rem', fontWeight: 500 }}> {title} </Typography> </> </Box> <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1, fontSize: '1.8rem' }}> {value} </Typography> {description && (<Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}> {description} </Typography>)} </CardContent> </Card>);
}

// --- Main Component ---
const ReporteCursosCC = () => {
    // Estados de Datos y Filtros
    const [rawCronogramaData, setRawCronogramaData] = useState([]); // Datos originales transformados
    const [allMonthsData, setAllMonthsData] = useState([]);       // Datos agregados por mes (después de filtros)
    const [allMinisterios, setAllMinisterios] = useState([]);     // Lista de ministerios únicos
    const [allAreas, setAllAreas] = useState([]);                 // Lista de áreas únicas

    const [selectedMonth, setSelectedMonth] = useState('all');
    const [selectedMinisterio, setSelectedMinisterio] = useState('all'); // Estado para Ministerio
    const [selectedArea, setSelectedArea] = useState('all');             // Estado para Area

    // Estados de Visualización
    const [displayChartData, setDisplayChartData] = useState(null);
    const [displayKpiData, setDisplayKpiData] = useState(null);
    const [displaySummaryData, setDisplaySummaryData] = useState(null);

    // Estados de Carga y Error
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const currentYear = new Date().getFullYear();

    // --- 1. Fetch y Procesamiento Inicial (Obtener datos crudos y opciones de filtro) ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            setRawCronogramaData([]);
            setAllMinisterios([]);
            setAllAreas([]);
            // Resetear otros estados dependientes
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
                setRawCronogramaData(cronograma); // Guardar datos crudos procesados

                // Extraer opciones únicas para filtros (Asegúrate que los nombres de columna sean correctos)
                const ministeriosSet = new Set();
                const areasSet = new Set();
                cronograma.forEach(curso => {
                    // ---- ¡¡¡IMPORTANTE!!! Ajusta "Ministerio" y "Area" si los nombres en tu Google Sheet son diferentes ----
                    if (curso["Ministerio"] && curso["Ministerio"].trim()) {
                        ministeriosSet.add(curso["Ministerio"].trim());
                    }
                    if (curso["Area"] && curso["Area"].trim()) {
                        areasSet.add(curso["Area"].trim());
                    }
                    //----------------------------------------------------------------------------------------------
                });

                setAllMinisterios(['all', ...Array.from(ministeriosSet).sort()]);
                setAllAreas(['all', ...Array.from(areasSet).sort()]);

            } catch (error) {
                console.error("Error en fetchData:", error);
                setError(error.message || "Ocurrió un error desconocido al obtener datos.");
                // Limpiar estados en caso de error
                setRawCronogramaData([]);
                setAllMinisterios([]);
                setAllAreas([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []); // Solo se ejecuta al montar

    // --- 2. Procesamiento Filtrado y Agregación por Mes (Depende de datos crudos y filtros) ---
    useEffect(() => {
        if (loading || !rawCronogramaData.length) {
             setAllMonthsData([]); // Limpiar si no hay datos o está cargando
             return; // Salir si está cargando o no hay datos base
        }

        // Filtrar cronograma según selecciones
        const filteredCronograma = rawCronogramaData.filter(curso => {
            // --- Filtro por Ministerio ---
            // Ajusta "Ministerio" si el nombre de columna es diferente
            const ministerioMatch = selectedMinisterio === 'all' || (curso["Ministerio"] === selectedMinisterio);

            // --- Filtro por Area ---
            // Ajusta "Area" si el nombre de columna es diferente
            const areaMatch = selectedArea === 'all' || (curso["Area"] === selectedArea);

            // --- Filtro por Año (solo cursos que iniciaron este año) ---
            // Esto ya está en la lógica de agregación, pero podríamos pre-filtrar aquí si es necesario
            // const fechaInicioObj = parseDateString(curso["Fecha inicio del curso"]);
            // const yearMatch = fechaInicioObj && fechaInicioObj.getUTCFullYear() === currentYear;

            return ministerioMatch && areaMatch; // && yearMatch; // Incluir yearMatch si pre-filtramos año
        });

        // Calcular datos agregados por mes A PARTIR DEL CRONOGRAMA FILTRADO
        const summaryData = [];
        for (let mesIndex = 0; mesIndex < 12; mesIndex++) {
            let cursosPorMes = 0, cursosActivosAnteriores = 0, plataformaExterna = 0, canceladosSuspendidos = 0, autogestionados = 0;

            filteredCronograma.forEach(curso => { // Usar filteredCronograma aquí
                if (!curso || typeof curso !== 'object') return;
                const fechaInicioCursoStr = curso["Fecha inicio del curso"];
                const fechaFinCursoStr = curso["Fecha fin del curso"];
                const estadoCurso = (curso["Estado"] || "").toUpperCase().trim();
                const nombreCorto = curso["Código del curso"] || "";
                const esAutogestionado = (curso["Es Autogestionado"] || "").toUpperCase() === "SI";
                const fechaInicioObj = parseDateString(fechaInicioCursoStr);
                const fechaFinObj = parseDateString(fechaFinCursoStr);

                // Validaciones de Fecha
                if (!fechaInicioObj) return; // Necesitamos al menos fecha de inicio

                const anioInicioCurso = fechaInicioObj.getUTCFullYear();

                 // Filtro PRINCIPAL por año - SOLO procesar cursos iniciados en el año actual
                 if (anioInicioCurso !== currentYear) return;

                const mesInicioCurso = fechaInicioObj.getUTCMonth();
                const mesFinCurso = fechaFinObj ? fechaFinObj.getUTCMonth() : -1; // Manejar fecha fin nula
                const anioFinCurso = fechaFinObj ? fechaFinObj.getUTCFullYear() : -1;
                const isCancelledOrSuspended = estadoCurso === "SUSPENDIDO" || estadoCurso === "CANCELADO";

                // Lógica de conteo (basada en las fechas y estado del curso ya filtrado)
                if (mesInicioCurso === mesIndex && !isCancelledOrSuspended) {
                    cursosPorMes++;
                    if (nombreCorto.startsWith("EXT-")) plataformaExterna++;
                    if (esAutogestionado) autogestionados++;
                } else if (fechaFinObj && // Necesita fecha fin para ser activo anterior
                           ((anioInicioCurso < currentYear) || (anioInicioCurso === currentYear && mesInicioCurso < mesIndex)) && // Inicia antes
                           ((anioFinCurso > currentYear) || (anioFinCurso === currentYear && mesFinCurso >= mesIndex)) && // Termina en o después
                           !isCancelledOrSuspended)
                {
                      cursosActivosAnteriores++;
                }

                if (mesInicioCurso === mesIndex && isCancelledOrSuspended) { // Se cuenta si inicia en el mes y está C/S
                     canceladosSuspendidos++;
                }
            }); // Fin forEach filteredCronograma

            const totalCursosAcumulados = cursosPorMes + cursosActivosAnteriores;
            const porcentajeAutogestionadosNum = cursosPorMes > 0 ? (autogestionados / cursosPorMes) * 100 : 0;

            summaryData.push({
                id: mesIndex, mesAbrev: mesesAbrev[mesIndex], mesNombre: mesesFull[mesIndex],
                cursosPorMes, cursosActivosAnteriores, plataformaExterna, totalCursosAcumulados,
                canceladosSuspendidos, autogestionados, porcentajeAutogestionados: porcentajeAutogestionadosNum
            });
        }
        setAllMonthsData(summaryData); // Actualizar datos mensuales agregados

    }, [rawCronogramaData, selectedMinisterio, selectedArea, currentYear, loading]); // Depende de datos crudos y filtros


    // --- 3. Efecto para Actualizar Visualizaciones (KPIs, Gráficos) ---
    //    (Depende de los datos mensuales agregados `allMonthsData` y `selectedMonth`)
    useEffect(() => {
        // Si no hay datos mensuales (quizás por filtros muy restrictivos), limpiar visualización
        if (!allMonthsData || allMonthsData.length === 0 ) {
             setDisplayKpiData(null);
             setDisplayChartData(null);
             setDisplaySummaryData(null);
             // Mantener mensaje de "No hay datos" si rawCronogramaData existe pero el filtro lo vació
             if (!loading && rawCronogramaData.length > 0) {
                 // Podríamos poner un estado específico tipo 'noResultsAfterFilter'
                 console.log("Filtros aplicados no produjeron resultados mensuales.");
             }
             return;
         }

        // Calcular KPIs, datos de gráficos y resumen basado en `allMonthsData` y `selectedMonth`
        if (selectedMonth === 'all') { // Vista Anual (basada en datos ya filtrados por Ministerio/Area)
            const totalNuevosAnual = allMonthsData.reduce((sum, m) => sum + m.cursosPorMes, 0);
            const totalCanceladosAnual = allMonthsData.reduce((sum, m) => sum + m.canceladosSuspendidos, 0);
            // Para promedio activos, sumar el total activo de cada mes y dividir por los meses CON DATOS
            const mesesConActividad = allMonthsData.filter(m => m.totalCursosAcumulados > 0 || m.cursosPorMes > 0);
            const totalActivosSum = mesesConActividad.reduce((sum, m) => sum + m.totalCursosAcumulados, 0);
            const promedioActivosMes = mesesConActividad.length > 0 ? (totalActivosSum / mesesConActividad.length) : 0;
            const totalAutogestionadosAnual = allMonthsData.reduce((sum, m) => sum + m.autogestionados, 0);
            const porcentajeAutogestionadoAnual = totalNuevosAnual > 0 ? (totalAutogestionadosAnual / totalNuevosAnual) * 100 : 0;

            setDisplayKpiData({ nuevos: totalNuevosAnual, cancelados: totalCanceladosAnual, activosPromedio: promedioActivosMes.toFixed(1), porcAutogestionado: porcentajeAutogestionadoAnual.toFixed(1) + '%', isAnnual: true });

            const labels = allMonthsData.map(d => d.mesAbrev);
            // Asegurarse que los datasets no fallen si allMonthsData está vacío (aunque ya chequeamos arriba)
            setDisplayChartData({
                labels,
                tendencias: { datasets: [ { label: 'Nuevos', data: allMonthsData.map(d => d.cursosPorMes), borderColor: 'rgb(53, 162, 235)', backgroundColor: 'rgba(53, 162, 235, 0.5)', yAxisID: 'y', tension: 0.1 }, { label: 'Total Act.', data: allMonthsData.map(d => d.totalCursosAcumulados), borderColor: 'rgb(75, 192, 192)', backgroundColor: 'rgba(75, 192, 192, 0.5)', yAxisID: 'y', tension: 0.1 }, { label: 'Canc/Susp.', data: allMonthsData.map(d => d.canceladosSuspendidos), borderColor: 'rgb(255, 99, 132)', backgroundColor: 'rgba(255, 99, 132, 0.5)', yAxisID: 'y', tension: 0.1 }, ] },
                composicionActivos: { datasets: [ { label: 'Nuevos Mes', data: allMonthsData.map(d => d.cursosPorMes), backgroundColor: 'rgba(53, 162, 235, 0.7)', stack: 'Stack 0' }, { label: 'Act. Ant.', data: allMonthsData.map(d => d.cursosActivosAnteriores), backgroundColor: 'rgba(75, 192, 192, 0.7)', stack: 'Stack 0' }, ] },
                porcentajeAutogestion: { datasets: [ { label: '% Autogest. (s/Nuevos)', data: allMonthsData.map(d => d.porcentajeAutogestionados), borderColor: 'rgb(255, 159, 64)', backgroundColor: 'rgba(255, 159, 64, 0.5)', yAxisID: 'yPercentage', tension: 0.1, pointRadius: 4, pointHoverRadius: 6, fill: false } ] }
            });
            setDisplaySummaryData(allMonthsData); // Para la lista de resumen anual

        } else { // Vista Mensual
            const monthIndex = parseInt(selectedMonth, 10);
            const monthData = allMonthsData.find(m => m.id === monthIndex);

            if (monthData) {
                setDisplayKpiData({ nuevos: monthData.cursosPorMes, cancelados: monthData.canceladosSuspendidos, activosPromedio: monthData.totalCursosAcumulados, porcAutogestionado: monthData.porcentajeAutogestionados.toFixed(1) + '%', isAnnual: false, monthName: monthData.mesNombre });

                const monthlyBarLabels = ['Nuevos', 'Act. Ant.', 'Canc/Susp.', 'Autogest. (Nuevo)'];
                const monthlyBarData = [monthData.cursosPorMes, monthData.cursosActivosAnteriores, monthData.canceladosSuspendidos, monthData.autogestionados];
                setDisplayChartData({
                    labels: monthlyBarLabels,
                    monthlyDetail: { datasets: [{ label: `Datos de ${monthData.mesNombre}`, data: monthlyBarData, backgroundColor: ['rgba(53, 162, 235, 0.7)', 'rgba(75, 192, 192, 0.7)', 'rgba(255, 99, 132, 0.7)', 'rgba(255, 159, 64, 0.7)',], borderColor: ['rgb(53, 162, 235)', 'rgb(75, 192, 192)', 'rgb(255, 99, 132)', 'rgb(255, 159, 64)',], borderWidth: 1 }] },
                    tendencias: null, composicionActivos: null, porcentajeAutogestion: null // Limpiar gráficos anuales
                });
                setDisplaySummaryData([monthData]); // Para la lista de resumen mensual
            } else {
                // Caso raro: mes seleccionado pero no hay datos para él tras filtrar Min/Area
                setDisplayKpiData(null); setDisplayChartData(null); setDisplaySummaryData(null);
                console.warn(`No se encontraron datos agregados para el mes ${selectedMonth} tras aplicar filtros.`);
            }
        }

    }, [selectedMonth, allMonthsData, loading, rawCronogramaData]); // Depende de datos mensuales y mes selecc.


    // --- Handlers para cambios en los Select ---
    const handleMonthChange = (event) => { setSelectedMonth(event.target.value); };
    const handleMinisterioChange = (event) => { setSelectedMinisterio(event.target.value); };
    const handleAreaChange = (event) => { setSelectedArea(event.target.value); };

    // --- Opciones de Gráficos (sin cambios significativos) ---
    const commonChartOptions = useMemo(() => ({ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' }, title: { display: true, font: { size: 16 }, padding: { top: 10, bottom: 20 } }, tooltip: { mode: 'index', intersect: false, backgroundColor: 'rgba(0, 0, 0, 0.8)', titleFont: { size: 14 }, bodyFont: { size: 12 }, padding: 10, cornerRadius: 4 }, }, scales: { x: { display: true, title: { display: false }, grid: { display: false }, ticks: { font: { size: 11 } } }, y: { display: true, position: 'left', title: { display: true, text: 'Cantidad de Cursos' }, beginAtZero: true, grid: { color: '#eee' }, ticks: { font: { size: 11 }, stepSize: 1 } }, // stepSize 1 si son números enteros
            yPercentage: { display: true, position: 'right', title: { display: true, text: 'Porcentaje (%)' }, min: 0, max: 100, grid: { drawOnChartArea: false }, ticks: { callback: (value) => value + '%', font: { size: 11 } } } }, interaction: { mode: 'nearest', axis: 'x', intersect: false }, animation: { duration: 500 } }), []);
    const stackedBarOptionsAnnual = useMemo(() => ({ ...commonChartOptions, plugins: { ...commonChartOptions.plugins, title: { ...commonChartOptions.plugins.title, text: 'Composición Cursos Activos/Mes' } }, scales: { x: { ...commonChartOptions.scales.x, stacked: true }, y: { ...commonChartOptions.scales.y, stacked: true, title: { display: true, text: 'Total Cursos Activos' } }, yPercentage: { display: false } } }), [commonChartOptions]);
    const lineTrendsOptionsAnnual = useMemo(() => ({ ...commonChartOptions, plugins: { ...commonChartOptions.plugins, title: { ...commonChartOptions.plugins.title, text: 'Tendencia Mensual' } }, scales: { ...commonChartOptions.scales, yPercentage: { display: false } } }), [commonChartOptions]);
    // Añadir dependencia displayKpiData al memo para actualizar título
    const barMonthlyOptions = useMemo(() => ({ ...commonChartOptions, indexAxis: 'y', plugins: { ...commonChartOptions.plugins, legend: { display: false }, title: { ...commonChartOptions.plugins.title, text: `Detalle Cursos ${displayKpiData?.monthName ?? ''}` } }, scales: { x: { ...commonChartOptions.scales.y, position: 'bottom', title: { display: true, text: 'Cantidad' } }, y: { ...commonChartOptions.scales.x, type: 'category', title: { display: false } }, yPercentage: { display: false } } }), [commonChartOptions, displayKpiData?.monthName]); // Depende del nombre del mes

    // --- Renderizado del Resumen en Texto (sin cambios significativos, ya usa displaySummaryData) ---
    const renderSummaryText = () => { /* ... (código sin cambios) ... */ if (!displaySummaryData || displaySummaryData.length === 0) return null; const textStyleProps = { primaryTypographyProps: { sx: { color: 'text.primary', fontWeight: 500 } } }; if (displayKpiData?.isAnnual) { const mesMasNuevos = encontrarMesPico(displaySummaryData, 'cursosPorMes'); const mesMasActivos = encontrarMesPico(displaySummaryData, 'totalCursosAcumulados'); return (<List dense sx={{ '& .MuiListItemText-secondary': { fontSize: '0.8rem' } }}> <ListItem disablePadding> <ListItemIcon sx={{ minWidth: '40px' }}><CheckCircleOutlineIcon color="success" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Total Nuevos Cursos (${currentYear}): ${displayKpiData.nuevos}`} secondary="Cantidad total de cursos que iniciaron durante el año (filtrado)." /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><HighlightOffIcon color="error" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Total Cancelados/Suspendidos: ${displayKpiData.cancelados}`} secondary="Cursos cuyo inicio estaba programado para este año pero fueron cancelados/suspendidos (filtrado)." /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><TrendingUpIcon color="action" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Promedio Cursos Activos por Mes: ${displayKpiData.activosPromedio}`} secondary="Número promedio de cursos en estado activo (nuevos + de meses anteriores) cada mes (filtrado)." /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><ShowChartIcon color="warning" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`% Autogestionados (sobre nuevos): ${displayKpiData.porcAutogestionado}`} secondary="Porcentaje anual de los nuevos cursos iniciados que fueron de tipo autogestionado (filtrado)." /> </ListItem> <Divider component="li" sx={{ my: 2 }} /> <ListItem disablePadding> <ListItemIcon sx={{ minWidth: '40px' }}><BarChartIcon color="info" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Mes con Más Cursos Nuevos: ${mesMasNuevos}`} /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><BarChartIcon color="secondary" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Mes con Mayor Total de Cursos Activos: ${mesMasActivos}`} /> </ListItem> </List>); } else { const monthData = displaySummaryData[0]; if (!monthData) return null; return (<List dense sx={{ '& .MuiListItemText-secondary': { fontSize: '0.8rem' } }}> <ListItem disablePadding> <ListItemIcon sx={{ minWidth: '40px' }}><CheckCircleOutlineIcon color="primary" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Nuevos Cursos en ${monthData.mesNombre}: ${monthData.cursosPorMes}`} /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><TrendingUpIcon color="success" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Cursos Activos de Meses Anteriores: ${monthData.cursosActivosAnteriores}`} /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><BarChartIcon color="secondary" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Total Cursos Activos en ${monthData.mesNombre}: ${monthData.totalCursosAcumulados}`} /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><CancelIcon color="error" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Cancelados/Suspendidos (iniciaban en ${monthData.mesNombre}): ${monthData.canceladosSuspendidos}`} /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><SettingsSuggestIcon color="warning" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Autogestionados (nuevos en ${monthData.mesNombre}): ${monthData.autogestionados} (${monthData.porcentajeAutogestionados.toFixed(1)}%)`} /> </ListItem> <ListItem disablePadding sx={{ mt: 1 }}> <ListItemIcon sx={{ minWidth: '40px' }}><ShowChartIcon color="info" /></ListItemIcon> <ListItemText {...textStyleProps} primary={`Cursos en Plataforma Externa (nuevos en ${monthData.mesNombre}): ${monthData.plataformaExterna}`} /> </ListItem> </List>); } };

    // --- Construir título dinámico ---
    const getReportTitle = () => {
        let title = `Reporte Cursos ${currentYear}`;
        const filtersApplied = [];
        if (selectedMinisterio !== 'all') filtersApplied.push(selectedMinisterio);
        if (selectedArea !== 'all') filtersApplied.push(selectedArea);
        if (selectedMonth !== 'all') filtersApplied.push(mesesFull[selectedMonth]);

        if (filtersApplied.length > 0) {
            title += ` (${filtersApplied.join(' / ')})`;
        } else if (selectedMonth === 'all') {
            title += " (Anual General)";
        }
        return title;
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}> {/* Ampliado a xl */}
            <Typography variant="h4" gutterBottom component="h1" sx={{ mb: 1, textAlign: 'center', fontWeight: 'bold' }}>
                 {getReportTitle()} {/* Título Dinámico */}
            </Typography>

            {/* --- Sección de Filtros --- */}
            <Paper elevation={1} sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
                {/* Filtro Mes */}
                <FormControl sx={{ m: 1, minWidth: 180 }} size="small" disabled={loading || !rawCronogramaData.length}>
                    <InputLabel id="select-month-label">Mes</InputLabel>
                    <Select
                        labelId="select-month-label"
                        id="select-month"
                        value={selectedMonth}
                        label="Mes"
                        onChange={handleMonthChange}
                         startAdornment={<CalendarMonthIcon sx={{ mr: 1, color: 'action.active' }} />}
                    >
                        <MenuItem value="all"> <em>Todos (Anual)</em> </MenuItem>
                        {mesesFull.map((nombreMes, index) => (<MenuItem key={index} value={index}>{nombreMes}</MenuItem>))}
                    </Select>
                </FormControl>

                {/* Filtro Ministerio */}
                <FormControl sx={{ m: 1, minWidth: 220 }} size="small" disabled={loading || !allMinisterios.length}>
                    <InputLabel id="select-ministerio-label">Ministerio</InputLabel>
                    <Select
                        labelId="select-ministerio-label"
                        id="select-ministerio"
                        value={selectedMinisterio}
                        label="Ministerio"
                        onChange={handleMinisterioChange}
                         startAdornment={<AccountBalanceIcon sx={{ mr: 1, color: 'action.active' }} />}
                    >
                        {allMinisterios.map((min, index) => (
                            <MenuItem key={index} value={min}>
                                {min === 'all' ? <em>Todos los Ministerios</em> : min}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Filtro Area */}
                <FormControl sx={{ m: 1, minWidth: 220 }} size="small" disabled={loading || !allAreas.length}>
                    <InputLabel id="select-area-label">Área</InputLabel>
                    <Select
                        labelId="select-area-label"
                        id="select-area"
                        value={selectedArea}
                        label="Área"
                        onChange={handleAreaChange}
                         startAdornment={<FolderSpecialIcon sx={{ mr: 1, color: 'action.active' }} />}
                    >
                         {allAreas.map((area, index) => (
                            <MenuItem key={index} value={area}>
                                {area === 'all' ? <em>Todas las Áreas</em> : area}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Paper>

            {/* --- Estados de Carga y Error --- */}
            {loading && (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}> <CircularProgress /> <Typography sx={{ ml: 2 }}>Cargando datos...</Typography> </Box>)}
            {error && !loading && (<Alert severity="error" sx={{ my: 2 }} elevation={3}> <strong>Error al cargar el reporte:</strong> {error} </Alert>)}

            {/* --- Contenido Principal (KPIs, Gráficos, Resumen) --- */}
            {!loading && !error && rawCronogramaData.length > 0 && ( // Mostrar si hay datos base
                 <>
                    {/* Mostrar KPIs solo si hay datos calculados */}
                    {displayKpiData && (
                        <Grid container spacing={2} sx={{ mb: 3 }}> {/* Reducido spacing y mb */}
                            <Grid item xs={12} sm={6} md={3}> <KpiCard title="Nuevos Cursos" value={displayKpiData.nuevos ?? '0'} icon={<AddCircleOutlineIcon />} color="primary" description={displayKpiData.isAnnual ? `Total ${currentYear}` : `En ${displayKpiData.monthName}`} /> </Grid>
                            <Grid item xs={12} sm={6} md={3}> <KpiCard title="Cancelados/Susp." value={displayKpiData.cancelados ?? '0'} icon={<CancelIcon />} color="error" description={displayKpiData.isAnnual ? `Iniciaban ${currentYear}` : `Iniciaban en ${displayKpiData.monthName}`} /> </Grid>
                            <Grid item xs={12} sm={6} md={3}> <KpiCard title={displayKpiData.isAnnual ? "Activos Prom./Mes" : "Total Activos Mes"} value={displayKpiData.activosPromedio ?? '0'} icon={<TrendingUpIcon />} color="success" description={displayKpiData.isAnnual ? `Promedio ${currentYear}` : `En ${displayKpiData.monthName}`} /> </Grid>
                            <Grid item xs={12} sm={6} md={3}> <KpiCard title="% Autogestionados" value={displayKpiData.porcAutogestionado ?? '0%'} icon={<SettingsSuggestIcon />} color="warning" description={displayKpiData.isAnnual ? `Anual (s/ nuevos)` : `Mes (s/ nuevos)`} /> </Grid>
                        </Grid>
                    )}

                    {/* Mostrar Gráficos y Resumen solo si hay datos agregados mensuales */}
                    {allMonthsData.length > 0 ? (
                        <Grid container spacing={3}>
                             {/* Sección Gráficos */}
                            {displayChartData && (selectedMonth === 'all') ? ( // Gráficos Anuales
                                <>
                                    <Grid item xs={12} md={6}> <Paper elevation={2} sx={{ p: 2, height: { xs: 350, md: 400 } }}> <Line options={lineTrendsOptionsAnnual} data={{ labels: displayChartData.labels, datasets: displayChartData.tendencias?.datasets ?? [] }} /> </Paper> </Grid>
                                    <Grid item xs={12} md={6}> <Paper elevation={2} sx={{ p: 2, height: { xs: 350, md: 400 } }}> <Bar options={stackedBarOptionsAnnual} data={{ labels: displayChartData.labels, datasets: displayChartData.composicionActivos?.datasets ?? [] }} /> </Paper> </Grid>
                                </>
                             ) : displayChartData && displayChartData.monthlyDetail ? ( // Gráfico Mensual
                                <>
                                    <Grid item xs={12} md={6}> <Paper elevation={2} sx={{ p: 2, height: { xs: 350, md: 400 } }}> <Bar options={barMonthlyOptions} data={{ labels: displayChartData.labels, datasets: displayChartData.monthlyDetail.datasets }} /> </Paper> </Grid>
                                    {/* Dejar espacio para el resumen o quitar este grid si no se necesita */}
                                    <Grid item xs={12} md={6}>
                                        {/* Podrías mover el Resumen aquí si prefieres layout 2 columnas */}
                                         <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
                                             <Typography variant="h6" component="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                 <BarChartIcon sx={{ mr: 1 }} color="primary" />
                                                 {`Resumen ${mesesFull[selectedMonth]} ${currentYear}`}
                                             </Typography>
                                             {renderSummaryText()}
                                         </Paper>
                                    </Grid>
                                </>
                             ) : ( /* No mostrar sección de gráficos si no hay datos para ellos */ null) }

                            {/* Sección Resumen (solo visible en vista anual si el gráfico mensual ocupa la otra mitad) */}
                            {(selectedMonth === 'all' && displaySummaryData) && (
                                <Grid item xs={12}>
                                    <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mt: 3 }}>
                                        <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <BarChartIcon sx={{ mr: 1 }} color="primary" />
                                            Resumen Anual y Observaciones ({currentYear})
                                        </Typography>
                                        {renderSummaryText()}
                                    </Paper>
                                </Grid>
                            )}
                        </Grid>
                     ) : (
                        // Mensaje si los filtros no arrojaron resultados mensuales
                        <Paper elevation={3} sx={{ p: 3, mt: 3, textAlign: 'center' }}>
                            <Typography variant="h6" gutterBottom>Sin resultados</Typography>
                            <Typography variant="body1" color="textSecondary">
                                No se encontraron datos de cursos que coincidan con los filtros seleccionados para el año {currentYear}.
                             </Typography>
                        </Paper>
                     )}
                 </>
            )}

            {/* Mensaje si no hubo datos INICIALES */}
            {!loading && !error && rawCronogramaData.length === 0 && (
                 <Paper elevation={3} sx={{ p: 3, mt: 3, textAlign: 'center' }}>
                     <Typography variant="h6" gutterBottom>No hay datos disponibles</Typography>
                     <Typography variant="body1" color="textSecondary">
                         No se encontraron datos de cursos iniciales para el año {currentYear}. Verifica la fuente de datos.
                     </Typography>
                 </Paper>
            )}
        </Container>
    );
}

export default ReporteCursosCC;