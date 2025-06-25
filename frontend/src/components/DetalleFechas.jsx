import React, { useState, useEffect, useMemo } from 'react';
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
  Tabs,
  Tab
} from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
// Se elimina getMatrizFechas y buscarPosicionFecha
import { getInstancias } from '../services/instancias.service';

dayjs.locale('es');

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

const DetalleFechasChart = () => {
  const [allInstancias, setAllInstancias] = useState([]); // Almacenará todas las instancias
  const [meses, setMeses] = useState([]);
  const [mesSeleccionado, setMesSeleccionado] = useState('');

  // Estados para los datos de los gráficos
  const [dataCupo, setDataCupo] = useState([]);
  const [dataCursosInician, setDataCursosInician] = useState([]); // Renombrado para claridad
  const [dataCursosActivos, setDataCursosActivos] = useState([]); // Renombrado para claridad
  const [labels, setLabels] = useState([]);

  const [baseOptions, setBaseOptions] = useState({ /* ... (sin cambios) ... */ });
  const [averages, setAverages] = useState({ cupo: 0, cursosInician: 0, cursosActivos: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  // 1. Cargar todas las instancias una vez
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getInstancias();
        if (!Array.isArray(data)) {
            throw new Error("La respuesta de getInstancias no es un array");
        }
        setAllInstancias(data);

        // Extraer meses únicos de las fechas de inicio de los cursos
        const uniqueMonths = new Set();
        data.forEach(instancia => {
          if (instancia.fecha_inicio_curso) {
            const monthYear = dayjs(instancia.fecha_inicio_curso).format('YYYY-MM');
            uniqueMonths.add(monthYear);
          }
           if (instancia.fecha_fin_curso) { // Considerar también fechas de fin para el rango de meses
            const monthYear = dayjs(instancia.fecha_fin_curso).format('YYYY-MM');
            uniqueMonths.add(monthYear);
          }
        });
        const sortedMonths = Array.from(uniqueMonths).sort();
        setMeses(sortedMonths);

        if (sortedMonths.length > 0) {
          // Seleccionar el mes actual por defecto, o el último mes si el actual no tiene datos
          const currentMonthFormatted = dayjs().format('YYYY-MM');
          if (sortedMonths.includes(currentMonthFormatted)) {
            setMesSeleccionado(currentMonthFormatted);
          } else {
            setMesSeleccionado(sortedMonths[sortedMonths.length -1]); // O el primero: sortedMonths[0]
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setAllInstancias([]);
        setMeses([]);
        setLoading(false);
      }
    })();
  }, []);

  // 2. Procesar datos cuando cambia el mes seleccionado o las instancias
  useEffect(() => {
    if (!mesSeleccionado || allInstancias.length === 0) {
      setDataCupo([]);
      setDataCursosInician([]);
      setDataCursosActivos([]);
      setLabels([]);
      setBaseOptions(prevOptions => ({
        ...prevOptions,
        xaxis: { ...prevOptions.xaxis, categories: [] },
        title: { ...prevOptions.title, text: 'Estadísticas por día' }
      }));
      setAverages({ cupo: 0, cursosInician: 0, cursosActivos: 0 });
      setLoading(false); // Asegurarse de que loading se apague
      return;
    }

    setLoading(true);

    const [year, monthNum] = mesSeleccionado.split('-').map(Number);
    const diasDelMes = dayjs(mesSeleccionado + '-01').daysInMonth();

    const currentLabels = [];
    const currentDataCupo = [];
    const currentDataCursosInician = [];
    const currentDataCursosActivos = [];

    // Filtrar instancias activas (no CANC ni SUSP)
    const instanciasActivas = allInstancias.filter(inst =>
      inst.estado_instancia !== 'CANC' && inst.estado_instancia !== 'SUSP'
    );

    for (let d = 1; d <= diasDelMes; d++) {
      const currentDate = dayjs(`${year}-${String(monthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
      const currentDateStr = currentDate.format('YYYY-MM-DD');
      const fechaLabel = currentDate.format('DD-MM-YYYY'); // Para los labels del eje X
      currentLabels.push(fechaLabel);

      let cupoDelDia = 0;
      let cursosInicianDelDia = 0;
      let cursosActivosDelDia = 0;

      instanciasActivas.forEach(instancia => {
        const fechaInicio = dayjs(instancia.fecha_inicio_curso);
        const fechaFin = instancia.fecha_fin_curso ? dayjs(instancia.fecha_fin_curso) : null;

        // Cursos que inician hoy y Cupo de esos cursos
        if (fechaInicio.isValid() && fechaInicio.format('YYYY-MM-DD') === currentDateStr) {
          cursosInicianDelDia++;
          cupoDelDia += Number(instancia.cupo) || 0;
        }

        // Cursos activos hoy
        if (fechaInicio.isValid() && fechaFin && fechaFin.isValid()) {
          if (currentDate.isSameOrAfter(fechaInicio, 'day') && currentDate.isSameOrBefore(fechaFin, 'day')) {
            cursosActivosDelDia++;
          }
        } else if (fechaInicio.isValid() && !fechaFin) { // Si no hay fecha de fin, se asume activo si ya empezó
           if (currentDate.isSameOrAfter(fechaInicio, 'day')) {
             // Podrías decidir si esto cuenta como activo indefinidamente o requiere una fecha de fin
             // Por ahora, si no hay fecha fin, y ya empezó, lo contamos como activo.
             // O podrías omitirlo si siempre debe haber fecha de fin.
             // cursosActivosDelDia++;
           }
        }
      });

      currentDataCupo.push(cupoDelDia);
      currentDataCursosInician.push(cursosInicianDelDia);
      currentDataCursosActivos.push(cursosActivosDelDia);
    }

    setDataCupo(currentDataCupo);
    setDataCursosInician(currentDataCursosInician);
    setDataCursosActivos(currentDataCursosActivos);
    setLabels(currentLabels); // Labels para el tooltip

    setBaseOptions(prevOptions => ({
      ...prevOptions,
      xaxis: {
        ...prevOptions.xaxis,
        categories: currentLabels, // Usar los labels formateados para las categorías del eje X
      },
      title: {
        ...prevOptions.title,
        text: `Estadísticas por día — ${dayjs(mesSeleccionado + '-01').format('MMMM YYYY')}`,
      },
      tooltip: { // Actualizar tooltip para usar los labels guardados
        ...prevOptions.tooltip,
        x: {
          formatter: function (value, { seriesIndex, dataPointIndex, w }) {
            // 'value' aquí será el índice o la categoría si es string.
            // Usamos los labels que generamos.
            return currentLabels[dataPointIndex] || '';
          }
        }
      }
    }));

    const avg = arr => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
    setAverages({
      cupo: avg(currentDataCupo),
      cursosInician: avg(currentDataCursosInician),
      cursosActivos: avg(currentDataCursosActivos),
    });

    setLoading(false);

  }, [allInstancias, mesSeleccionado]); // Dependencia de allInstancias también

  const handleMonthChange = (event) => {
    setMesSeleccionado(event.target.value);
  };

  const handleChangeTab = (event, newValue) => {
    setActiveTab(newValue);
  };

  const chartHeight = baseOptions?.chart?.height || 450;

  const getChartOptions = (yAxisTitle, color) => ({
    ...baseOptions,
    yaxis: {
      ...baseOptions.yaxis,
      title: {
        text: yAxisTitle,
      },
    },
    colors: [color],
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
              <Tab label="Cupo de Cursos Iniciados" id="chart-tab-0" aria-controls="chart-tabpanel-0" />
              <Tab label="Cursos Iniciados Diarios" id="chart-tab-1" aria-controls="chart-tabpanel-1" />
              <Tab label="Cursos Activos Diarios" id="chart-tab-2" aria-controls="chart-tabpanel-2" />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            {dataCupo.length > 0 && dataCupo.some(v => v > 0) ? ( // Comprobar si hay algún valor > 0
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <ReactApexChart
                  options={getChartOptions('Cupo de Cursos Iniciados', '#36A2EB')}
                  series={[{ name: 'Cupo de cursos iniciados', data: dataCupo }]}
                  type="bar"
                  height={chartHeight}
                  width="100%"
                />
              </Box>
            ) : <Typography align="center" sx={{ p: 2 }}>No hay datos de cupo para este mes.</Typography>}
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            {dataCursosInician.length > 0 && dataCursosInician.some(v => v > 0) ? (
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <ReactApexChart
                  options={getChartOptions('Cursos Iniciados Diarios', '#FF6384')}
                  series={[{ name: 'Cursos iniciados diarios', data: dataCursosInician }]}
                  type="bar"
                  height={chartHeight}
                  width="100%"
                />
              </Box>
            ) : <Typography align="center" sx={{ p: 2 }}>No hay datos de cursos iniciados para este mes.</Typography>}
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            {dataCursosActivos.length > 0 && dataCursosActivos.some(v => v > 0) ? (
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <ReactApexChart
                  options={getChartOptions('Cursos Activos Diarios', '#4BC0C0')}
                  series={[{ name: 'Cursos activos diarios', data: dataCursosActivos }]}
                  type="bar" // Podría ser 'line' también para cursos activos
                  height={chartHeight}
                  width="100%"
                />
              </Box>
            ) : <Typography align="center" sx={{ p: 2 }}>No hay datos de cursos activos para este mes.</Typography>}
          </TabPanel>
        </Paper>
      )}

      {!loading && mesSeleccionado && (dataCupo.some(v => v > 0) || dataCursosInician.some(v => v > 0) || dataCursosActivos.some(v => v > 0)) && (
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
              <Typography>Cursos iniciados prom.:</Typography>
              <Typography variant="h5">{averages.cursosInician.toFixed(2)}</Typography>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
              <Typography>Cursos activos prom.:</Typography>
              <Typography variant="h5">{averages.cursosActivos.toFixed(2)}</Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default DetalleFechasChart;