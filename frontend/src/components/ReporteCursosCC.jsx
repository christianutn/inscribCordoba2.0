import React, { useEffect, useState, useMemo } from "react";
import dayjs from "dayjs";
import 'dayjs/locale/es';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import isBetween from 'dayjs/plugin/isBetween';
import { getInstancias } from "../services/instancias.service";
import ReactApexChart from 'react-apexcharts';
import {
    Box, CircularProgress, Typography, Alert, Paper, Grid,
    Card, CardContent, FormControl, InputLabel, Select, MenuItem, Button,
    Tab, Tabs, TextField, Tooltip, IconButton
} from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import BotonCircular from "./UIElements/BotonCircular.jsx";
import { descargarExcelCronograma as descargarExcel } from "../services/excel.service.js";
import ExcelDownloadModal from "./Cronograma/Modals/ExcelDownloadModal.jsx";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(localizedFormat);
dayjs.extend(isBetween);
dayjs.locale('es');

const parseDateString = (dateString) => {
    if (!dateString || typeof dateString !== 'string') return null;
    const match = String(dateString).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return null;
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return { year, month: month - 1, day };
};

const mesesAbrev = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const mesesFull = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const getPlataforma = (inst) => {
    let codPlataforma = inst.plataforma_dictado;
    if (!codPlataforma && inst.detalle_curso) {
        codPlataforma = inst.detalle_curso.plataforma_dictado;
    }
    if (!codPlataforma && inst.detalle_curso?.detalle_plataformaDictado) {
        codPlataforma = inst.detalle_curso.detalle_plataformaDictado.cod;
    }
    return codPlataforma;
};

const isAutogestionado = (inst) => {
    const esAutogestionadoInstancia = inst.es_autogestionado;
    const esAutogestionadoDetalle = inst.detalle_curso?.es_autogestionado;
    if (esAutogestionadoInstancia === true || String(esAutogestionadoInstancia).toUpperCase() === "SI" || String(esAutogestionadoInstancia) === "1") {
        return true;
    } else if (esAutogestionadoInstancia === null && (esAutogestionadoDetalle === true || String(esAutogestionadoDetalle).toUpperCase() === "SI" || String(esAutogestionadoDetalle) === "1")) {
        return true;
    }
    return false;
};

const isInstanciaCancelada = (inst) => {
    if (!inst) return false;
    const estadoInst = inst.estado_instancia ? String(inst.estado_instancia).trim().toUpperCase() : '';
    return estadoInst === 'CANC'
};

const preProcessInstancias = (instancias) => {
    return instancias.map(c => {
        const isCANC = isInstanciaCancelada(c);
        const plat = getPlataforma(c);
        let inicioStrJs = null;
        if (c.fecha_inicio_curso && c.fecha_inicio_curso.length >= 10) {
            inicioStrJs = c.fecha_inicio_curso.substring(0, 10);
        }
        let finStrJs = null;
        if (c.fecha_fin_curso && c.fecha_fin_curso.length >= 10) {
            finStrJs = c.fecha_fin_curso.substring(0, 10);
        } else {
            finStrJs = inicioStrJs;
        }
        return { ...c, isCANC, plat, inicioStrJs, finStrJs, cupoInt: Number(c.cupo) || 0 };
    }).filter(c => c.inicioStrJs !== null);
};

const calculateMaxSimultaneous = (preProcessedActiveCourses, targetYear, targetMonthIndex = null) => {
    const sm = targetMonthIndex !== null ? targetMonthIndex + 1 : 1;
    const em = targetMonthIndex !== null ? targetMonthIndex + 1 : 12;
    const lastDay = new Date(targetYear, em, 0).getDate();

    let maxCursos = 0;
    let maxCursosDay = null;
    let maxCupos = 0;
    let maxCuposDay = null;

    let currentDate = new Date(targetYear, targetMonthIndex !== null ? targetMonthIndex : 0, 1);
    const endDate = new Date(targetYear, targetMonthIndex !== null ? targetMonthIndex : 11, lastDay);

    while (currentDate <= endDate) {
        const y = currentDate.getFullYear();
        const m = String(currentDate.getMonth() + 1).padStart(2, '0');
        const d = String(currentDate.getDate()).padStart(2, '0');
        const loopDayStr = `${y}-${m}-${d}`;

        let currentCursos = 0;
        let currentCupos = 0;

        for (let i = 0; i < preProcessedActiveCourses.length; i++) {
            const c = preProcessedActiveCourses[i];
            if (loopDayStr >= c.inicioStrJs && loopDayStr <= c.finStrJs) {
                currentCursos++;
                currentCupos += c.cupoInt;
            }
        }

        if (currentCursos > maxCursos) { maxCursos = currentCursos; maxCursosDay = loopDayStr; }
        if (currentCupos > maxCupos) { maxCupos = currentCupos; maxCuposDay = loopDayStr; }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    const formatDay = (dayStr) => {
        if (!dayStr) return 'N/A';
        const parts = dayStr.split('-');
        if (parts.length === 3) return `${parseInt(parts[2])} de ${mesesFull[parseInt(parts[1]) - 1]}`;
        return 'N/A';
    };

    return { maxCursos, maxCursosDay: formatDay(maxCursosDay), maxCupos, maxCuposDay: formatDay(maxCuposDay) };
};

const calculateMonthlyPeaksAllPlataformas = (preProcessedActiveCourses, targetYear) => {
    let CC_peaks = Array(12).fill(0);
    let EXT_peaks = Array(12).fill(0);

    for (let month = 0; month < 12; month++) {
        let maxCCForMonth = 0;
        let maxEXTForMonth = 0;
        const lastDay = new Date(targetYear, month + 1, 0).getDate();
        let currentDate = new Date(targetYear, month, 1);
        const endDate = new Date(targetYear, month, lastDay);

        while (currentDate <= endDate) {
            const y = currentDate.getFullYear();
            const m = String(currentDate.getMonth() + 1).padStart(2, '0');
            const d = String(currentDate.getDate()).padStart(2, '0');
            const loopDayStr = `${y}-${m}-${d}`;

            let currentCC = 0;
            let currentEXT = 0;

            for (let i = 0; i < preProcessedActiveCourses.length; i++) {
                const c = preProcessedActiveCourses[i];
                if (loopDayStr >= c.inicioStrJs && loopDayStr <= c.finStrJs) {
                    if (c.plat === 'EXT') currentEXT++;
                    else currentCC++;
                }
            }

            if (currentCC > maxCCForMonth) maxCCForMonth = currentCC;
            if (currentEXT > maxEXTForMonth) maxEXTForMonth = currentEXT;

            currentDate.setDate(currentDate.getDate() + 1);
        }
        CC_peaks[month] = maxCCForMonth;
        EXT_peaks[month] = maxEXTForMonth;
    }
    return { CC_peaks, EXT_peaks };
};


function KpiCard({ title, value, icon, color = 'primary', description, tooltipText }) {
    const IconComponent = icon;
    return (
        <Card elevation={3} sx={{ display: 'flex', flexDirection: 'column', height: '100%', borderRadius: 3, position: 'relative', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
            {tooltipText && (
                <Tooltip
                    title={tooltipText}
                    arrow
                    placement="top"
                    componentsProps={{
                        tooltip: { sx: { fontSize: '0.95rem', padding: '10px' } }
                    }}
                >
                    <IconButton size="small" sx={{ position: 'absolute', top: 8, right: 8, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                        <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}
            <CardContent sx={{ flexGrow: 1, p: 3, pt: tooltipText ? 4 : 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {IconComponent && (
                        <Box component="span" sx={{ mr: 2, p: 1, borderRadius: '12px', bgcolor: theme => theme.palette[color]?.light ? `${theme.palette[color].light}30` : 'action.hover', color: theme => theme.palette[color]?.main ?? theme.palette.primary.main, display: 'flex', alignItems: 'center' }}>
                            {React.cloneElement(IconComponent, { fontSize: 'medium' })}
                        </Box>
                    )}
                    <Typography variant="subtitle1" component="div" color="text.secondary" sx={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {title}
                    </Typography>
                </Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 800, mb: 1, fontSize: '2.2rem', color: 'text.primary' }}>
                    {value}
                </Typography>
                {description && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem', fontWeight: 500, mt: 1 }}>
                        {description}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`chart-tabpanel-${index}`}
            aria-labelledby={`chart-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ pt: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const DetalleDiarioSection = ({ instancias, year, globalSelectedMonth, sidebarOpen }) => {
    const defaultLocal = (globalSelectedMonth !== 'all' && globalSelectedMonth !== null) ? parseInt(globalSelectedMonth) : new Date().getMonth();
    const [localMonth, setLocalMonth] = useState(defaultLocal);
    const [activeTab, setActiveTab] = useState(0);
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        if (globalSelectedMonth !== 'all') {
            setLocalMonth(parseInt(globalSelectedMonth));
        }
    }, [globalSelectedMonth]);

    useEffect(() => {
        const currentLabels = [];
        const currentDataCupo = [];
        const currentDataCursosInician = [];
        const currentDataCursosActivos = [];

        const act = preProcessInstancias(instancias).filter(c => !c.isCANC && c.plat !== 'EXT');
        const diasDelMes = new Date(year, localMonth + 1, 0).getDate();

        for (let d = 1; d <= diasDelMes; d++) {
            const loopDayStr = `${year}-${String(localMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const fechaLabel = `${String(d).padStart(2, '0')}-${String(localMonth + 1).padStart(2, '0')}-${year}`;
            currentLabels.push(fechaLabel);

            let cupoDelDia = 0;
            let cursosInicianDelDia = 0;
            let cursosActivosDelDia = 0;

            for (let i = 0; i < act.length; i++) {
                const c = act[i];
                if (c.inicioStrJs === loopDayStr) {
                    cursosInicianDelDia++;
                    cupoDelDia += c.cupoInt;
                }
                if (loopDayStr >= c.inicioStrJs && loopDayStr <= c.finStrJs) {
                    cursosActivosDelDia++;
                }
            }

            currentDataCupo.push(cupoDelDia);
            currentDataCursosInician.push(cursosInicianDelDia);
            currentDataCursosActivos.push(cursosActivosDelDia);
        }

        const avg = arr => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

        setChartData({
            labels: currentLabels,
            cupo: currentDataCupo,
            inician: currentDataCursosInician,
            activos: currentDataCursosActivos,
            averages: {
                cupo: avg(currentDataCupo),
                cursosInician: avg(currentDataCursosInician),
                cursosActivos: avg(currentDataCursosActivos)
            }
        });
    }, [instancias, year, localMonth]);

    if (!chartData) return null;

    const baseOptions = {
        chart: {
            type: 'bar',
            height: 450,
            toolbar: { show: true },
            zoom: { enabled: false },
            redrawOnParentResize: true,
        },
        plotOptions: { bar: { columnWidth: '50%', borderRadius: 2 } },
        dataLabels: { enabled: false },
        stroke: { width: 2, colors: ['transparent'] },
        xaxis: {
            categories: chartData.labels,
            labels: {
                rotate: 0,
                trim: false,
                formatter: function (value) {
                    if (typeof value === 'string' && value.includes('-')) {
                        return value.split('-')[0]; // Muestra solo el día
                    }
                    return value;
                }
            },
            tickPlacement: 'on'
        },
        yaxis: { title: { text: '' } },
        fill: { opacity: 1 },
        tooltip: {
            y: { formatter: function (val) { return val; } },
            x: { formatter: function (value, { dataPointIndex }) { return chartData.labels[dataPointIndex] || ''; } }
        },
        title: {
            text: `Estadísticas por día — ${mesesFull[localMonth]} ${year}`,
            align: 'center',
            style: { fontSize: '18px', fontWeight: 'bold' }
        }
    };

    return (
        <Paper elevation={2} sx={{ mt: 2, p: 2, width: '100%' }}>
            <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 500, textAlign: 'center' }}>Detalle Diario por Mes</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3, textAlign: 'center' }}>
                Refleja la actividad exclusiva de <strong>Cursos en Moodle Campus Córdoba</strong> (excluye plataformas externas y cursos cancelados).
            </Typography>

            <FormControl fullWidth sx={{ mb: 3 }} disabled={globalSelectedMonth !== 'all'}>
                <InputLabel id="select-local-mes-label">Mes de Detalle</InputLabel>
                <Select
                    labelId="select-local-mes-label"
                    value={localMonth}
                    label="Mes de Detalle"
                    onChange={(e) => setLocalMonth(e.target.value)}
                >
                    {mesesFull.map((m, i) => (
                        <MenuItem key={i} value={i}>{m}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={(e, n) => setActiveTab(n)} centered>
                    <Tab label="Cupo de Cursos Iniciados" />
                    <Tab label="Cursos Iniciados Diarios" />
                    <Tab label="Cursos Activos Diarios" />
                </Tabs>
            </Box>

            <TabPanel value={activeTab} index={0}>
                {chartData.cupo.some(v => v > 0) ? (
                    <Box sx={{ width: '100%', overflowX: 'auto' }}>
                        <ReactApexChart
                            options={{ ...baseOptions, yaxis: { title: { text: 'Cupo de Cursos Iniciados' } }, colors: ['#36A2EB'] }}
                            series={[{ name: 'Cupo de cursos iniciados', data: chartData.cupo }]}
                            type="bar" height={450} width="100%" />
                    </Box>
                ) : <Typography align="center" sx={{ p: 2 }}>No hay datos de cupo para este mes.</Typography>}
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
                {chartData.inician.some(v => v > 0) ? (
                    <Box sx={{ width: '100%', overflowX: 'auto' }}>
                        <ReactApexChart
                            options={{ ...baseOptions, yaxis: { title: { text: 'Cursos Iniciados Diarios' } }, colors: ['#FF6384'] }}
                            series={[{ name: 'Cursos iniciados diarios', data: chartData.inician }]}
                            type="bar" height={450} width="100%" />
                    </Box>
                ) : <Typography align="center" sx={{ p: 2 }}>No hay datos de cursos iniciados para este mes.</Typography>}
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
                {chartData.activos.some(v => v > 0) ? (
                    <Box sx={{ width: '100%', overflowX: 'auto' }}>
                        <ReactApexChart
                            options={{ ...baseOptions, yaxis: { title: { text: 'Cursos Activos Diarios' } }, colors: ['#4BC0C0'] }}
                            series={[{ name: 'Cursos activos diarios', data: chartData.activos }]}
                            type="bar" height={450} width="100%" />
                    </Box>
                ) : <Typography align="center" sx={{ p: 2 }}>No hay datos de cursos activos para este mes.</Typography>}
            </TabPanel>

            {(chartData.cupo.some(v => v > 0) || chartData.inician.some(v => v > 0) || chartData.activos.some(v => v > 0)) && (
                <Paper elevation={1} sx={{ mt: 4, p: 2, bgcolor: '#fafafa' }}>
                    <Typography variant="h6" gutterBottom align="center">
                        Promedios — {mesesFull[localMonth]} {year}
                    </Typography>
                    <Grid container spacing={2} justifyContent="center" alignItems="center">
                        <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
                            <Typography>Cupo diario prom.:</Typography>
                            <Typography variant="h5">{chartData.averages.cupo.toFixed(2)}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
                            <Typography>Cursos iniciados prom.:</Typography>
                            <Typography variant="h5">{chartData.averages.cursosInician.toFixed(2)}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
                            <Typography>Cursos activos prom.:</Typography>
                            <Typography variant="h5">{chartData.averages.cursosActivos.toFixed(2)}</Typography>
                        </Grid>
                    </Grid>
                </Paper>
            )}
        </Paper>
    );
};

const ReporteCursosCC = ({ sidebarOpen }) => {
    const [rawCronogramaData, setRawCronogramaData] = useState([]);
    const [filteredCronogramaData, setFilteredCronogramaData] = useState([]);

    // Modal para Configurar la Descarga a Excel
    const [openExcelModal, setOpenExcelModal] = useState(false);
    const [allMinisterios, setAllMinisterios] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [selectedMinisterio, setSelectedMinisterio] = useState('all');
    const [selectedArea, setSelectedArea] = useState('all');
    const [availableAreas, setAvailableAreas] = useState(['all']);

    const [kpiData, setKpiData] = useState(null);
    const [chartData, setChartData] = useState(null);

    // Trigger de Resize Manual para corregir el ancho de los gráficos de ApexCharts
    // cuando el sidebar cambia de estado (abierto/cerrado).
    useEffect(() => {
        const timer = setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 300); // Pequeño delay para esperar el fin de la animación del sidebar
        return () => clearTimeout(timer);
    }, [sidebarOpen]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [umbralValue, setUmbralValue] = useState(80);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); setError(null);
            try {
                const instanciasData = await getInstancias();
                if (!Array.isArray(instanciasData)) throw new Error("Datos inválidos");
                setRawCronogramaData(instanciasData);

                if (instanciasData.length > 0) {
                    const minSet = new Set();
                    instanciasData.forEach(inst => {
                        const m = inst.detalle_curso?.detalle_area?.detalle_ministerio?.nombre?.trim();
                        if (m) minSet.add(m);
                    });
                    setAllMinisterios(['all', ...Array.from(minSet).sort()]);
                } else setAllMinisterios(['all']);
            } catch (err) {
                console.error(err);
                setError(err.message || "Error al obtener datos");
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
                if (instancia.detalle_curso?.detalle_area?.detalle_ministerio?.nombre === selectedMinisterio) {
                    const area = instancia.detalle_curso?.detalle_area?.nombre?.trim();
                    if (area) areasSet.add(area);
                }
            });
            const newAreas = ['all', ...Array.from(areasSet).sort()];
            setAvailableAreas(newAreas);
            if (!newAreas.includes(selectedArea)) setSelectedArea('all');
        }
    }, [selectedMinisterio, rawCronogramaData, selectedArea]);

    useEffect(() => {
        if (!loading && rawCronogramaData) {
            const filtered = rawCronogramaData.filter(inst => {
                const min = inst.detalle_curso?.detalle_area?.detalle_ministerio?.nombre;
                const area = inst.detalle_curso?.detalle_area?.nombre;
                return (selectedMinisterio === 'all' || min === selectedMinisterio) &&
                    (selectedArea === 'all' || area === selectedArea);
            });
            setFilteredCronogramaData(filtered);
        }
    }, [rawCronogramaData, selectedMinisterio, selectedArea, loading]);

    useEffect(() => {
        if (loading || !filteredCronogramaData || filteredCronogramaData.length === 0) {
            setKpiData(null); setChartData(null); return;
        }

        const preProcessedData = preProcessInstancias(filteredCronogramaData);

        let totalCursos = 0, totalCupos = 0, totalHoras = 0, cursosCC = 0, cursosExt = 0, autogestionados = 0, cancelados = 0;

        const startsPerMonthCC = Array(12).fill(0);
        const startsPerMonthEXT = Array(12).fill(0);

        filteredCronogramaData.forEach(inst => {
            const start = parseDateString(inst.fecha_inicio_curso);
            if (!start) return;

            const isCANC = isInstanciaCancelada(inst);
            const plat = getPlataforma(inst);

            let inPeriod = (selectedMonth === 'all')
                ? (start.year === selectedYear)
                : (start.year === selectedYear && start.month === parseInt(selectedMonth));

            if (start.year === selectedYear && !isCANC) {
                if (plat === 'EXT') {
                    startsPerMonthEXT[start.month]++;
                } else {
                    startsPerMonthCC[start.month]++;
                }
            }

            if (inPeriod) {
                if (isCANC) cancelados++;
                else {
                    totalCursos++;
                    if (plat === 'CC') {
                        cursosCC++;
                        totalCupos += parseInt(inst.cupo) || 0;
                        totalHoras += parseInt(inst.cantidad_horas) || 0;
                        if (isAutogestionado(inst)) autogestionados++;
                    } else if (plat === 'EXT') {
                        cursosExt++;
                    }
                }
            }
        });

        const porcAuto = cursosCC > 0 ? (autogestionados / cursosCC) * 100 : 0;

        // --- Calcular Variación Intermensual de Picos ---
        const activeCCFiltered = preProcessedData.filter(c => !c.isCANC && c.plat !== 'EXT');
        const monthPeaks = Array(12).fill(0);
        const preYearPeaks = Array(12).fill(0);

        for (let i = 0; i < 12; i++) {
            monthPeaks[i] = calculateMaxSimultaneous(activeCCFiltered, selectedYear, i).maxCursos;
            preYearPeaks[i] = calculateMaxSimultaneous(activeCCFiltered, selectedYear - 1, i).maxCursos;
        }

        let sumVars = 0;
        let numVars = 0;
        let singleVar = 0;

        if (selectedMonth === 'all') {
            const currentActualMonth = new Date().getMonth();
            const currentActualYear = new Date().getFullYear();

            for (let i = 0; i < 12; i++) {
                let prev = i === 0 ? preYearPeaks[11] : monthPeaks[i - 1];
                let curr = monthPeaks[i];

                let isFutureMonth = (selectedYear >= currentActualYear && i > currentActualMonth);

                if (prev > 0 && !isFutureMonth) {
                    sumVars += ((curr - prev) / prev) * 100;
                    numVars++;
                }
            }
        } else {
            const m = parseInt(selectedMonth);
            let prev = m === 0 ? preYearPeaks[11] : monthPeaks[m - 1];
            let curr = monthPeaks[m];
            if (prev > 0) {
                singleVar = ((curr - prev) / prev) * 100;
            }
        }

        const finalVar = selectedMonth === 'all' ? (numVars > 0 ? sumVars / numVars : 0) : singleVar;
        // ------------------------------------------------

        const maxData = calculateMaxSimultaneous(activeCCFiltered, selectedYear, selectedMonth === 'all' ? null : parseInt(selectedMonth));

        let peaksCC = [];
        let peaksEXT = [];
        if (selectedMonth === 'all') {
            const activeAllFiltered = preProcessedData.filter(c => !c.isCANC);
            const monthlyPeakData = calculateMonthlyPeaksAllPlataformas(activeAllFiltered, selectedYear);
            peaksCC = monthlyPeakData.CC_peaks;
            peaksEXT = monthlyPeakData.EXT_peaks;
        }

        setKpiData({
            totalCursos, cursosCC, cursosExt, cancelados, totalCupos, totalHoras, porcAuto,
            maxCursos: maxData.maxCursos, maxCursosDesc: `${maxData.maxCursosDay} - Cursos en Moodle Campus Córdoba`,
            maxCupos: maxData.maxCupos, maxCuposDesc: `${maxData.maxCuposDay} - Cursos en Moodle Campus Córdoba`,
            varVal: finalVar, varDesc: finalVar > 0 ? `+${finalVar.toFixed(1)}%` : `${finalVar.toFixed(1)}%`
        });

        setChartData({
            startsCC: startsPerMonthCC,
            startsEXT: startsPerMonthEXT,
            peaksCC,
            peaksEXT
        });

    }, [filteredCronogramaData, selectedYear, selectedMonth, loading]);

    const yearsOptions = useMemo(() => {
        const y = [];
        for (let i = 2021; i <= new Date().getFullYear() + 1; i++) y.push(i);
        return y;
    }, []);

    const handleClearFilters = () => {
        setSelectedYear(new Date().getFullYear());
        setSelectedMonth('all');
        setSelectedMinisterio('all');
        setSelectedArea('all');
    };

    const isFilterActive = selectedYear !== new Date().getFullYear() || selectedMonth !== 'all' || selectedMinisterio !== 'all' || selectedArea !== 'all';

    const handleOpenExcelModal = () => setOpenExcelModal(true);
    const handleCloseExcelModal = () => setOpenExcelModal(false);

    const procesarDescargaExcel = async ({ plataforma, incluirCancelados }) => {
        if (!filteredCronogramaData || filteredCronogramaData.length === 0) return;
        try {
            const dataFilteredParaExcel = filteredCronogramaData.filter(inst => {
                const start = parseDateString(inst.fecha_inicio_curso);
                if (!start) return false;

                let anioMesOk = false;
                if (selectedMonth === 'all') {
                    anioMesOk = start.year === selectedYear;
                } else {
                    anioMesOk = start.year === selectedYear && start.month === parseInt(selectedMonth);
                }
                if (!anioMesOk) return false;

                const plat = getPlataforma(inst);
                if (plataforma !== 'ALL' && plat !== plataforma) {
                    return false;
                }

                const estado = String(inst.estado_instancia || "").toUpperCase().trim();
                const isCANC = estado === 'CANC'
                if (!incluirCancelados && isCANC) {
                    return false;
                }

                return true;
            });

            if (dataFilteredParaExcel.length === 0) {
                setError("No hay datos para exportar con los filtros seleccionados.");
                setOpenExcelModal(false);
                return;
            }

            const dataParaExcel = dataFilteredParaExcel.map(inst => {
                const det = inst.detalle_curso || {};
                const min = det.detalle_area?.detalle_ministerio?.nombre || "";
                const area = det.detalle_area?.nombre || "";
                const plat = getPlataforma(inst);

                return {
                    "Curso": inst.curso,
                    "Nombre del curso": det.nombre,
                    "Ministerio": min,
                    "Área": area,
                    "Plataforma de dictado": plat,
                    "Fecha inicio curso": inst.fecha_inicio_curso,
                    "Fecha fin curso": inst.fecha_fin_curso,
                    "Estado Instancia": inst.estado_instancia,
                    "Medio de inscripción": inst.medio_inscripcion,
                    "Cupo": inst.cupo,
                    "Cantidad de horas": inst.cantidad_horas,
                    "Es Autogestionado": isAutogestionado(inst) ? "Sí" : "No",
                };
            });

            const COLUMNAS_EXCEL = [
                "Curso", "Nombre del curso", "Ministerio", "Área",
                "Plataforma de dictado", "Fecha inicio curso", "Fecha fin curso",
                "Estado Instancia", "Medio de inscripción", "Cupo",
                "Cantidad de horas", "Es Autogestionado"
            ];

            const fileName = `Reporte_Cursos_${selectedYear}${selectedMonth !== 'all' ? `_${mesesFull[selectedMonth]}` : ''}_${plataforma}`;
            await descargarExcel(dataParaExcel, COLUMNAS_EXCEL, fileName);
            setOpenExcelModal(false);
        } catch (e) {
            console.error("Error al generar Excel: ", e);
            setError("Error al generar el archivo Excel.");
            setOpenExcelModal(false);
        }
    };

    return (
        <Box sx={{ width: '100%', boxSizing: 'border-box', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                <Typography variant="h4" gutterBottom component="h1" sx={{ textAlign: 'center', mb: 0, fontWeight: 'bold' }}>
                    Reporte Cursos {selectedYear} {selectedMonth !== 'all' ? ` - ${mesesFull[selectedMonth]}` : ' - Anual'}
                </Typography>
                <Box sx={{ position: 'absolute', right: 0 }}>
                    <BotonCircular icon="descargar" onClick={handleOpenExcelModal} tooltip="Descargar Reporte Excel" disabled={loading || filteredCronogramaData.length === 0} />
                </Box>
            </Box>

            <ExcelDownloadModal
                open={openExcelModal}
                onClose={handleCloseExcelModal}
                onDownload={procesarDescargaExcel}
                infoMessage="Los filtros de fecha (Año y Mes) y las selecciones de Ministerio y Área activos en la pantalla ya están siendo aplicados a esta descarga."
            />

            <Paper elevation={1} sx={{ p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Año</InputLabel>
                            <Select value={selectedYear} label="Año" onChange={e => setSelectedYear(e.target.value)}>
                                {yearsOptions.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Mes</InputLabel>
                            <Select value={selectedMonth} label="Mes" onChange={e => setSelectedMonth(e.target.value)}>
                                <MenuItem value="all"><em>Todos (Anual)</em></MenuItem>
                                {mesesFull.map((m, i) => <MenuItem key={i} value={i}>{m}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Ministerio</InputLabel>
                            <Select value={selectedMinisterio} label="Ministerio" onChange={e => setSelectedMinisterio(e.target.value)}>
                                {allMinisterios.map((m, i) => <MenuItem key={i} value={m}>{m === 'all' ? 'Todos' : m}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Área</InputLabel>
                            <Select value={selectedArea} label="Área" onChange={e => setSelectedArea(e.target.value)}>
                                {availableAreas.map((a, i) => <MenuItem key={i} value={a}>{a === 'all' ? 'Todas' : a}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-end' } }}>
                        <Button
                            variant="text"
                            color="primary"
                            onClick={handleClearFilters}
                            disabled={!isFilterActive || loading}
                            startIcon={<ClearAllIcon />}
                            sx={{
                                textTransform: 'none',
                                width: { xs: '100%', sm: 'auto' },
                                fontWeight: 500
                            }}
                        >
                            Limpiar Filtros
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>}

            {!loading && error && <Alert severity="error">{error}</Alert>}

            {!loading && kpiData && (
                <>
                    <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                        <Typography variant="body1" sx={{ color: 'text.primary' }}>
                            <strong>Moodle Campus Córdoba:</strong> Cursos con gestión integral (Inscripción, Cursada y Certificación).
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 0.5, color: 'text.primary' }}>
                            <strong>Externos:</strong> Cursos con seguimiento en Victorius, se le da visibilidad y difusión en el Portal Institucional. Estos no tienen aula en Moodle de Campus Córdoba.
                        </Typography>
                    </Alert>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3} lg={3}> <KpiCard title="Total de Cursos Planificados" value={kpiData.totalCursos} icon={<AddCircleOutlineIcon />} color="primary" description={`Cursos en Moodle Campus Córdoba: ${kpiData.cursosCC} | Externos: ${kpiData.cursosExt}`} tooltipText="Total de cursos nuevos que inician en el periodo. Incluye Cursos en Moodle Campus Córdoba y plataformas externas. Excluye cancelados." /> </Grid>
                        <Grid item xs={12} sm={6} md={3} lg={3}> <KpiCard title="Total de Cupos" value={kpiData.totalCupos} icon={<PeopleIcon />} color="info" description={selectedMonth === 'all' ? `Total ${selectedYear} - Cursos en Moodle Campus Córdoba` : `En ${mesesFull[selectedMonth]} - Cursos en Moodle Campus Córdoba`} tooltipText="Suma acumulada de cupos de los cursos que INICIAN en el periodo. Aplica SOLO a Cursos en Moodle Campus Córdoba. Excluye cancelados y externos." /> </Grid>
                        <Grid item xs={12} sm={6} md={3} lg={3}> <KpiCard title="Total Horas de Capacitación" value={kpiData.totalHoras} icon={<AccessTimeIcon />} color="secondary" description={selectedMonth === 'all' ? `Total ${selectedYear} - Cursos en Moodle Campus Córdoba` : `En ${mesesFull[selectedMonth]} - Cursos en Moodle Campus Córdoba`} tooltipText="Suma de las horas de todos los cursos que INICIAN en el periodo. Aplica SOLO a Cursos en Moodle Campus Córdoba. Excluye cancelados y externos." /> </Grid>
                        <Grid item xs={12} sm={6} md={3} lg={3}> <KpiCard title="% Autogestionados" value={typeof kpiData.porcAuto === 'number' ? kpiData.porcAuto.toFixed(1) + '%' : kpiData.porcAuto} icon={<SettingsSuggestIcon />} color="warning" description={selectedMonth === 'all' ? `Anual - Cursos en Moodle Campus Córdoba` : `En ${mesesFull[selectedMonth]} - Cursos en Moodle Campus Córdoba`} tooltipText="Porcentaje de cursos autogestionados respecto al total del periodo. Aplica SOLO a Cursos en Moodle Campus Córdoba. Excluye cancelados y externos." /> </Grid>

                        <Grid item xs={12} sm={6} md={3} lg={3}> <KpiCard title="Cancelados" value={kpiData.cancelados} icon={<CancelIcon />} color="error" description={selectedMonth === 'all' ? `Iniciaban ${selectedYear}` : `Iniciaban en ${mesesFull[selectedMonth]}`} tooltipText="Total de cursos en estado 'Cancelado' cuyo inicio estaba previsto en este periodo. Incluye TODAS las plataformas." /> </Grid>
                        <Grid item xs={12} sm={6} md={3} lg={3}> <KpiCard title="Máx. Cursos Simultáneos" value={kpiData.maxCursos} icon={<ShowChartIcon />} color="success" description={kpiData.maxCursosDesc} tooltipText="Pico de mayor cantidad de cursos activos AL MISMO TIEMPO (según fechas de inicio y fin). Aplica SOLO a Cursos en Moodle Campus Córdoba. Excluye cancelados." /> </Grid>
                        <Grid item xs={12} sm={6} md={3} lg={3}> <KpiCard title="Máx. Cupos Simultáneos" value={kpiData.maxCupos} icon={<BarChartIcon />} color="info" description={kpiData.maxCuposDesc} tooltipText="Suma máxima simultánea de cupos de todos los cursos activos en el día pico. Aplica SOLO a Cursos en Moodle Campus Córdoba. Excluye cancelados." /> </Grid>
                        {selectedMonth !== 'all' && (
                            <Grid item xs={12} sm={6} md={3} lg={3}>
                                <KpiCard
                                    title="Variación Intermensual"
                                    value={kpiData.varDesc}
                                    icon={<TrendingUpIcon />}
                                    color={kpiData.varVal < 0 ? 'error' : 'success'}
                                    description={`Pico Máx. Cursos Simultáneos vs ${mesesFull[parseInt(selectedMonth) === 0 ? 11 : parseInt(selectedMonth) - 1]}`}
                                    tooltipText="Variación del pico de saturación del mes actual respecto al anterior. Aplica SOLO a Cursos en Moodle Campus Córdoba."
                                />
                            </Grid>
                        )}
                    </Grid>
                </>
            )}

            {!loading && chartData && selectedMonth === 'all' && (
                <>
                    <Paper elevation={2} sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2, borderRadius: 2, width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                    Picos Máximos de Cursos Activos por Mes
                                </Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                                    Indica en qué valores ocurrieron los picos de saturación observando los cursos activos en simultáneo. Se diferencia la plataforma propia (Campus) vs externas. Excluye cancelados.
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: '#f5f5f5', p: 1.5, borderRadius: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: '#000' }}>Configurar Umbral:</Typography>
                                <TextField
                                    type="number"
                                    size="small"
                                    value={umbralValue}
                                    onChange={(e) => setUmbralValue(Number(e.target.value))}
                                    InputProps={{ inputProps: { min: 0 } }}
                                    sx={{ width: 90, bgcolor: 'background.paper', borderRadius: 1 }}
                                />
                            </Box>
                        </Box>

                        <Box sx={{ width: '100%', height: 380 }}>
                            <ReactApexChart
                                options={{
                                    chart: { type: 'line', toolbar: { show: true }, zoom: { enabled: false }, redrawOnParentResize: true },
                                    stroke: { curve: 'smooth', width: 3 },
                                    colors: ['#00E396', '#FEB019'],
                                    xaxis: { categories: mesesAbrev },
                                    yaxis: { title: { text: 'Cursos Activos (Máximo del Mes)' } },
                                    annotations: {
                                        yaxis: [{
                                            y: umbralValue,
                                            borderColor: '#FF4560',
                                            strokeDashArray: 5,
                                            label: {
                                                borderColor: '#FF4560',
                                                style: { color: '#fff', background: '#FF4560', fontSize: '13px', fontWeight: 600, padding: { left: 8, right: 8, top: 4, bottom: 4 } },
                                                text: `Límite Umbral: ${umbralValue}`
                                            }
                                        }]
                                    },
                                    tooltip: { shared: true, intersect: false },
                                    markers: { size: 5, hover: { size: 7 } },
                                    grid: { borderColor: '#f1f1f1' }
                                }}
                                series={[
                                    { name: 'Campus Córdoba', data: chartData.peaksCC },
                                    { name: 'Externos', data: chartData.peaksEXT }
                                ]}
                                type="line" height={380} width="100%"
                            />
                        </Box>
                    </Paper>

                    <Paper elevation={2} sx={{ p: 4, borderRadius: 2, width: '100%' }}>
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                            Cantidad de Cursos Iniciados por Mes
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Total de nuevos cursos que comienzan cada mes, discriminado por plataforma. Excluye cancelados.
                        </Typography>
                        <Box sx={{ width: '100%', height: 380 }}>
                            <ReactApexChart
                                options={{
                                    chart: { type: 'line', toolbar: { show: true }, zoom: { enabled: false }, redrawOnParentResize: true },
                                    stroke: { curve: 'straight', width: 3 },
                                    colors: ['#008FFB', '#FF4560'],
                                    xaxis: { categories: mesesAbrev },
                                    yaxis: { title: { text: 'Nuevos Cursos Iniciados' } },
                                    tooltip: { shared: true, intersect: false },
                                    markers: { size: 5, hover: { size: 7 } },
                                    grid: { borderColor: '#f1f1f1' }
                                }}
                                series={[
                                    { name: 'Campus Córdoba', data: chartData.startsCC },
                                    { name: 'Externos', data: chartData.startsEXT }
                                ]}
                                type="line" height={380} width="100%"
                            />
                        </Box>
                    </Paper>
                </>
            )}

            {!loading && kpiData && (
                <DetalleDiarioSection
                    instancias={filteredCronogramaData}
                    year={selectedYear}
                    globalSelectedMonth={selectedMonth}
                    sidebarOpen={sidebarOpen}
                />
            )}
        </Box>
    );
};

export default ReporteCursosCC;