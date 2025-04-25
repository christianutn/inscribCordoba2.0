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
  Grid
} from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import {
  getMatrizFechas,
  buscarPosicionFecha
} from '../services/googleSheets.service';

dayjs.locale('es');

const DetalleFechasChart = () => {
  const [matriz, setMatriz] = useState(null);
  const [meses, setMeses] = useState([]);
  const [mesSeleccionado, setMesSeleccionado] = useState('');
  const [series, setSeries] = useState([]);
  const [options, setOptions] = useState({
    chart: {
      type: 'bar',
      height: 450,
      stacked: false,
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
    stroke: {
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
    yaxis: {
      title: {
        text: 'Cantidad',
      },
      min: 0,
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        formatter: function (value, { seriesIndex, dataPointIndex, w }) {
          return w.globals.categoryLabels[dataPointIndex] || '';
        }
      },
      y: {
        formatter: function (val) {
          return val;
        },
      },
    },
    title: {
      text: 'Estadísticas por día',
      align: 'center',
    },
    legend: {
      position: 'top',
      horizontalAlign: 'center',
      offsetY: -5
    },
    colors: ['#36A2EB', '#FF6384', '#4BC0C0'],
  });
  const [averages, setAverages] = useState({ cupo: 0, cursos: 0, acumulado: 0 });
  const [loading, setLoading] = useState(true);

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
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setMatriz({});
        setMeses([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!matriz || !mesSeleccionado || Object.keys(matriz).length === 0) {
      setSeries([]);
      setOptions(prevOptions => ({
        ...prevOptions,
        xaxis: { ...prevOptions.xaxis, categories: [] },
        title: { ...prevOptions.title, text: 'Estadísticas por día' }
      }));
      setAverages({ cupo: 0, cursos: 0, acumulado: 0 });
      return;
    }

    const [year, month] = mesSeleccionado.split('-').map(Number);
    const diasDelMes = dayjs(mesSeleccionado + '-01').daysInMonth();

    const labels = [];
    const dataCupo = [];
    const dataCursos = [];
    const dataAcumulado = [];

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
      labels.push(fechaLabel);

      const infoDia = matriz[mesSeleccionado]?.[claveDia] || {};
      const cupoVal = infoDia.cantidadCupoDiario || 0;
      const cursosVal = infoDia.cantidadCursosDiario || 0;

      const cursosInicianHoy = infoDia.cantidadCursosInicianHoy || 0;
      const cursosTerminanHoy = infoDia.cantidadCursosTerminanHoy || 0;

      runningAccumulated += cursosInicianHoy - cursosTerminanHoy;

      dataCupo.push(cupoVal);
      dataCursos.push(cursosVal);
      dataAcumulado.push(Math.max(0, runningAccumulated));
    }

    setSeries([
      { name: 'Cupo diario', data: dataCupo },
      { name: 'Cursos diarios', data: dataCursos },
      { name: 'Cursos acumulados', data: dataAcumulado },
    ]);

    setOptions(prevOptions => ({
      ...prevOptions,
      xaxis: {
        ...prevOptions.xaxis,
        categories: labels,
      },
      title: {
        ...prevOptions.title,
        text: `Estadísticas por día — ${dayjs(mesSeleccionado + '-01').format('MMMM YYYY')}`,
      },
    }));

    const avg = arr => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
    setAverages({
      cupo: avg(dataCupo),
      cursos: avg(dataCursos),
      acumulado: avg(dataAcumulado),
    });

  }, [matriz, mesSeleccionado]);


  const handleMonthChange = (event) => {
    setMesSeleccionado(event.target.value);
  };

  const chartHeight = options?.chart?.height || 450;

  return (
    <Box sx={{ width: '100%', p: { xs: 1, sm: 2 } }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: chartHeight }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <FormControl fullWidth sx={{ mb: 3 }} disabled={meses.length === 0}>
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

          {series.length === 0 || !mesSeleccionado ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: chartHeight, border: '1px dashed grey', borderRadius: '4px', p: 2, textAlign: 'center' }}>
              <Typography>
                {meses.length > 0 ? 'Seleccione un mes para ver los datos.' : 'No hay datos disponibles para mostrar.'}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
              <ReactApexChart
                options={options}
                series={series}
                type="bar"
                height={chartHeight}
                width="100%"
              />
            </Box>
          )}

          {series.length > 0 && mesSeleccionado && (
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
        </>
      )}
    </Box>
  );
};

export default DetalleFechasChart;