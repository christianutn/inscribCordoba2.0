import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import {
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Grid,
  Tabs, // <-- Importar Tabs
  Tab   // <-- Importar Tab
} from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import {
  getMatrizFechas,
  buscarPosicionFecha
} from '../services/googleSheets.service';

dayjs.locale('es');

// Helper function for TabPanel (optional but good practice)
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
        <Box sx={{ pt: 3 }}> {/* Add padding top to separate from tabs */}
          {children}
        </Box>
      )}
    </div>
  );
}

const DetalleFechasChart = () => {
  const [matriz, setMatriz] = useState(null);
  const [meses, setMeses] = useState([]);
  const [mesSeleccionado, setMesSeleccionado] = useState('');
  // States for individual data series
  const [dataCupo, setDataCupo] = useState([]);
  const [dataCursos, setDataCursos] = useState([]);
  const [dataAcumulado, setDataAcumulado] = useState([]);
  const [labels, setLabels] = useState([]); // State for labels

  const [baseOptions, setBaseOptions] = useState({ // Renamed to baseOptions
    chart: {
      type: 'bar',
      height: 450,
      stacked: false, // No longer stacked by default
      toolbar: {
        show: true
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '75%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: { // Can keep this for single bars too
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: [],
      title: {
        text: 'Día del Mes',
      },
      labels: {
        formatter: function (value) {
          return value ? dayjs(value, 'DD-MM-YYYY').format('DD') : '';
        },
        rotate: -45,
        hideOverlappingLabels: true,
        trim: true,
      },
      tickAmount: undefined,
    },
    yaxis: { // Will be customized per chart
      title: {
        text: 'Cantidad', // Default, will be overridden
      },
      min: 0,
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        formatter: function (value, { seriesIndex, dataPointIndex, w }) {
          // Use labels state here
          return labels[dataPointIndex] || '';
        }
      },
      y: {
        formatter: function (val) {
          return val;
        },
      },
    },
    title: { // Main title updated based on month
      text: 'Estadísticas por día',
      align: 'center',
    },
    legend: { show: false }, // Hide legend for single-series charts
    // colors: ['#36A2EB', '#FF6384', '#4BC0C0'], // Colors will be set per chart
  });
  const [averages, setAverages] = useState({ cupo: 0, cursos: 0, acumulado: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // State for active tab index

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getMatrizFechas();
        setMatriz(data);
        const keys = Object.keys(data)
          .filter(k => /^\d{4}-\d{2}$/.test(k))
          .sort();
        setMeses(keys);
        if (keys.length > 0) {
          setMesSeleccionado(keys[0]);
        } else {
          setLoading(false); // Stop loading if no months
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setMatriz({});
        setMeses([]);
        setLoading(false); // Stop loading on error
      }
      // setLoading(false) moved to data processing useEffect or initial load end
    })();
  }, []);

  useEffect(() => {
    if (!matriz || !mesSeleccionado || Object.keys(matriz).length === 0) {
      setDataCupo([]);
      setDataCursos([]);
      setDataAcumulado([]);
      setLabels([]);
      setBaseOptions(prevOptions => ({
        ...prevOptions,
        xaxis: { ...prevOptions.xaxis, categories: [] },
        title: { ...prevOptions.title, text: 'Estadísticas por día' }
      }));
      setAverages({ cupo: 0, cursos: 0, acumulado: 0 });
      if (meses.length > 0 && mesSeleccionado === '') setLoading(false); // Stop loading if month deselected
      return;
    }

    setLoading(true); // Start loading for data processing

    const [year, month] = mesSeleccionado.split('-').map(Number);
    const diasDelMes = dayjs(mesSeleccionado + '-01').daysInMonth();

    const currentLabels = [];
    const currentDataCupo = [];
    const currentDataCursos = [];
    const currentDataAcumulado = [];

    let runningAccumulated = 0;

    const firstDayOfMonth = dayjs(`${mesSeleccionado}-01`);
    const lastDayOfPrevMonth = firstDayOfMonth.subtract(1, 'day');
    const prevMonthKey = lastDayOfPrevMonth.format('YYYY-MM');
    const prevDayKey = lastDayOfPrevMonth.format('YYYY-MM-DD');

    const prevMonthData = matriz[prevMonthKey];
    let initialAccumulated = 0;

    if (prevMonthData && prevMonthData[prevDayKey]) {
      const posFinPrev = buscarPosicionFecha(prevDayKey, matriz.listaFechasFin || []);
      initialAccumulated = posFinPrev >= 0 ? (matriz.listaFechasFin[posFinPrev]?.acumulado || 0) : 0;
    } else {
      const finEntriesBefore = (matriz.listaFechasFin || [])
        .filter(entry => dayjs(entry.fecha).isBefore(firstDayOfMonth))
        .sort((a, b) => dayjs(b.fecha).diff(dayjs(a.fecha)));
      if (finEntriesBefore.length > 0) {
        initialAccumulated = finEntriesBefore[0].acumulado || 0;
      }
    }
    runningAccumulated = initialAccumulated;

    for (let d = 1; d <= diasDelMes; d++) {
      const day = String(d).padStart(2, '0');
      const mesStr = String(month).padStart(2, '0');
      const claveDia = `${year}-${mesStr}-${day}`;
      const fechaLabel = dayjs(claveDia).format('DD-MM-YYYY');
      currentLabels.push(fechaLabel);

      const infoDia = matriz[mesSeleccionado]?.[claveDia] || {};
      const cupoVal = infoDia.cantidadCupoDiario || 0;
      const cursosVal = infoDia.cantidadCursosDiario || 0;

      // Cursos cursos activos meses anteriores
      const posInicio = buscarPosicionFecha(claveDia, matriz.listaFechasInicio);
      const posFin = buscarPosicionFecha(claveDia, matriz.listaFechasFin);

      const acumulado = posInicio >= 0 && posFin >= 0
        ? matriz.listaFechasInicio[posInicio].acumulado - matriz.listaFechasFin[posFin].acumulado
        : 0;

      currentDataCupo.push(cupoVal);
      currentDataCursos.push(cursosVal);
      currentDataAcumulado.push(acumulado);
    }

    // Set individual data states
    setDataCupo(currentDataCupo);
    setDataCursos(currentDataCursos);
    setDataAcumulado(currentDataAcumulado);
    setLabels(currentLabels); // Set labels state

    // Update base options (xaxis categories and main title)
    setBaseOptions(prevOptions => ({
      ...prevOptions,
      xaxis: {
        ...prevOptions.xaxis,
        categories: currentLabels, // Use the calculated labels
      },
      title: {
        ...prevOptions.title,
        text: `Estadísticas por día — ${dayjs(mesSeleccionado + '-01').format('MMMM YYYY')}`,
      },
    }));

    // Calculate averages
    const avg = arr => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
    setAverages({
      cupo: avg(currentDataCupo),
      cursos: avg(currentDataCursos),
      acumulado: avg(currentDataAcumulado),
    });

    setLoading(false); // Stop loading after processing

  }, [matriz, mesSeleccionado, meses]); // Added meses dependency

  const handleMonthChange = (event) => {
    setMesSeleccionado(event.target.value);
  };

  const handleChangeTab = (event, newValue) => {
    setActiveTab(newValue);
  };

  const chartHeight = baseOptions?.chart?.height || 450;

  // Function to generate specific options for each chart
  const getChartOptions = (yAxisTitle, color) => ({
    ...baseOptions,
    yaxis: {
      ...baseOptions.yaxis,
      title: {
        text: yAxisTitle,
      },
    },
    colors: [color], // Set specific color
  });

  return (
    <Box sx={{ width: '100%', p: { xs: 1, sm: 2 } }}>
      <FormControl fullWidth sx={{ mb: 3 }} disabled={meses.length === 0 || loading}>
        <InputLabel id="select-mes-label">Mes</InputLabel>
        <Select
          labelId="select-mes-label"
          value={mesSeleccionado}
          label="Mes"
          onChange={handleMonthChange}
        >
          {meses.length === 0 && <MenuItem value="" disabled>No hay meses disponibles</MenuItem>}
          {meses.map(m => (
            <MenuItem key={m} value={m}>
              {dayjs(m + '-01').format('MMMM YYYY')}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: chartHeight + 50 }}>
          <CircularProgress />
        </Box>
      ) : !mesSeleccionado || meses.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: chartHeight + 50, border: '1px dashed grey', borderRadius: '4px', p: 2, textAlign: 'center' }}>
          <Typography>
            {meses.length > 0 ? 'Seleccione un mes para ver los datos.' : 'No hay datos disponibles para mostrar.'}
          </Typography>
        </Box>
      ) : (
        <Paper elevation={1} sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleChangeTab} aria-label="Gráficos de detalle diario" centered>
              <Tab label="Cupo Diario" id="chart-tab-0" aria-controls="chart-tabpanel-0" />
              <Tab label="Cursos Diarios" id="chart-tab-1" aria-controls="chart-tabpanel-1" />
              <Tab label="Cursos Acumulados" id="chart-tab-2" aria-controls="chart-tabpanel-2" />
            </Tabs>
          </Box>

          {/* Cupo Diario Panel */}
          <TabPanel value={activeTab} index={0}>
            {dataCupo.length > 0 ? (
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <ReactApexChart
                  options={getChartOptions('Cupo Diario', '#36A2EB')}
                  series={[{ name: 'Cupo diario', data: dataCupo }]}
                  type="bar"
                  height={chartHeight}
                  width="100%"
                />
              </Box>
            ) : <Typography align="center" sx={{ p: 2 }}>No hay datos de cupo para este mes.</Typography>}
          </TabPanel>

          {/* Cursos Diarios Panel */}
          <TabPanel value={activeTab} index={1}>
            {dataCursos.length > 0 ? (
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <ReactApexChart
                  options={getChartOptions('Cursos Diarios', '#FF6384')}
                  series={[{ name: 'Cursos diarios', data: dataCursos }]}
                  type="bar"
                  height={chartHeight}
                  width="100%"
                />
              </Box>
            ) : <Typography align="center" sx={{ p: 2 }}>No hay datos de cursos diarios para este mes.</Typography>}
          </TabPanel>

          {/* Cursos Acumulados Panel */}
          <TabPanel value={activeTab} index={2}>
            {dataAcumulado.length > 0 ? (
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <ReactApexChart
                  options={getChartOptions('Cursos Acumulados', '#4BC0C0')}
                  series={[{ name: 'Cursos acumulados', data: dataAcumulado }]}
                  type="bar" // Could be 'line' or 'area' too for accumulated
                  height={chartHeight}
                  width="100%"
                />
              </Box>
            ) : <Typography align="center" sx={{ p: 2 }}>No hay datos de cursos acumulados para este mes.</Typography>}
          </TabPanel>
        </Paper>
      )}

      {/* Promedios Section (Only show if not loading and data exists) */}
      {!loading && mesSeleccionado && (dataCupo.length > 0 || dataCursos.length > 0 || dataAcumulado.length > 0) && (
        <Paper elevation={2} sx={{ mt: 4, p: 2 }}>
          <Typography variant="h6" gutterBottom align="center">
            Promedios — {dayjs(mesSeleccionado + '-01').format('MMMM YYYY')}
          </Typography>
          <Grid container spacing={2} justifyContent="center" alignItems="center">
            <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
              <Typography>Cupo diario prom.:</Typography>
              <Typography variant="h5">{averages.cupo.toFixed(2)}</Typography>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
              <Typography>Cursos diarios prom.:</Typography>
              <Typography variant="h5">{averages.cursos.toFixed(2)}</Typography>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
              <Typography>Cursos acum. prom.:</Typography>
              <Typography variant="h5">{averages.acumulado.toFixed(2)}</Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default DetalleFechasChart;