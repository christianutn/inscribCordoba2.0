// src/components/DetalleFechasChart.jsx
import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
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

// Registro de componentes Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DetalleFechasChart = () => {
  const [matriz, setMatriz] = useState(null);
  const [meses, setMeses] = useState([]);
  const [mesSeleccionado, setMesSeleccionado] = useState('');
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [averages, setAverages] = useState({ cupo: 0, cursos: 0, acumulado: 0 });
  const [loading, setLoading] = useState(true);

  // 1) Cargo datos
  useEffect(() => {
    (async () => {
      const data = await getMatrizFechas();
      setMatriz(data);
      // extraigo claves que sean "YYYY-MM"
      const keys = Object.keys(data)
        .filter(k => /^\d{4}-\d{2}$/.test(k))
        .sort();
      setMeses(keys);
      setMesSeleccionado(keys[0] || '');
      setLoading(false);
    })();
  }, []);

  // 2) Cada vez que cambia mes o matriz, recalculo chartData y averages
  useEffect(() => {
    if (!matriz || !mesSeleccionado) return;

    const [year, month] = mesSeleccionado.split('-').map(Number);
    // cuántos días tiene el mes
    const diasDelMes = new Date(year, month, 0).getDate();

    const labels = [];
    const dataCupo = [];
    const dataCursos = [];
    const dataAcumulado = [];

    for (let d = 1; d <= diasDelMes; d++) {
      const day = String(d).padStart(2, '0');
      const mesStr = String(month).padStart(2, '0');
      const claveDia = `${year}-${mesStr}-${day}`;
      const fechaLabel = dayjs(claveDia).format('DD-MM-YYYY');
      labels.push(fechaLabel);

      // datos diarios
      const infoDia = matriz[mesSeleccionado]?.[claveDia] || {};
      const cupoVal = infoDia.cantidadCupoDiario || 0;
      const cursosVal = infoDia.cantidadCursosDiario || 0;

      // acumulado: listaFechasInicio - listaFechasFin
      const posIni = buscarPosicionFecha(claveDia, matriz.listaFechasInicio);
      const posFin = buscarPosicionFecha(claveDia, matriz.listaFechasFin);
      const ini = posIni >= 0 ? matriz.listaFechasInicio[posIni].acumulado : 0;
      const fin = posFin >= 0 ? matriz.listaFechasFin[posFin].acumulado : 0;
      const acumVal = ini - fin;

      dataCupo.push(cupoVal);
      dataCursos.push(cursosVal);
      dataAcumulado.push(acumVal);
    }

    // set chart data
    setChartData({
      labels,
      datasets: [
        {
          label: 'Cupo diario',
          data: dataCupo,
          backgroundColor: 'rgba(54,162,235,0.5)'
        },
        {
          label: 'Cursos diarios',
          data: dataCursos,
          backgroundColor: 'rgba(255,99,132,0.5)'
        },
        {
          label: 'Cursos acumulados',
          data: dataAcumulado,
          backgroundColor: 'rgba(75,192,192,0.5)'
        }
      ]
    });

    // calculo de promedios
    const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    setAverages({
      cupo: avg(dataCupo),
      cursos: avg(dataCursos),
      acumulado: avg(dataAcumulado)
    });
  }, [matriz, mesSeleccionado]);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: `Estadísticas por día — ${mesSeleccionado}`
      }
    },
    scales: {
      x: { stacked: false },
      y: { beginAtZero: true }
    }
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="select-mes-label">Mes</InputLabel>
            <Select
              labelId="select-mes-label"
              value={mesSeleccionado}
              label="Mes"
              onChange={e => setMesSeleccionado(e.target.value)}
            >
              {meses.map(m => (
                <MenuItem key={m} value={m}>
                  {dayjs(m + '-01').format('MMMM YYYY')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {chartData.labels.length === 0 ? (
            <Typography>No hay datos para este mes.</Typography>
          ) : (
            <Bar data={chartData} options={options} />
          )}

          {/* Caja de promedios debajo del gráfico */}
          <Paper elevation={2} sx={{ mt: 4, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Promedios — {dayjs(mesSeleccionado + '-01').format('MMMM YYYY')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography>Cupo diario promedio:</Typography>
                <Typography variant="h5">{averages.cupo.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography>Cursos diarios promedio:</Typography>
                <Typography variant="h5">{averages.cursos.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography>Cursos acumulados promedio:</Typography>
                <Typography variant="h5">{averages.acumulado.toFixed(2)}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default DetalleFechasChart;
