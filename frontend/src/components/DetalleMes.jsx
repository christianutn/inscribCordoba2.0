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
import { Box, CircularProgress, Typography } from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { getMatrizFechas } from '../services/googleSheets.service';

dayjs.locale('es');

// Registro de componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DetalleMesChart = () => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    (async () => {
      try {
        const matriz = await getMatrizFechas();
        // extraigo solo claves tipo "YYYY-MM"
        const mesesClaves = Object.keys(matriz)
          .filter(k => /^\d{4}-\d{2}$/.test(k))
          .sort();

        // etiquetas en español, p.e. "enero", "febrero", ...
        const labels = mesesClaves.map(m =>
          dayjs(m + '-01').format('MMMM YYYY')
        );

        // datos de cada mes
        const datosCupo = mesesClaves.map(m => matriz[m].cantidadCupoMensual || 0);
        const datosCursos = mesesClaves.map(m => matriz[m].cantidadCursosMensual || 0);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Total Cupo Mensual',
              data: datosCupo,
              backgroundColor: 'rgba(54,162,235,0.5)'
            },
            {
              label: 'Total Cursos Mensual',
              data: datosCursos,
              backgroundColor: 'rgba(255,99,132,0.5)'
            }
          ]
        });
      } catch (error) {
        console.error('Error cargando matriz de fechas:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Resumen Mensual de Cupo y Cursos'
      }
    },
    scales: {
      x: { title: { display: true, text: 'Mes' } },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Cantidad' }
      }
    }
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : chartData.labels.length === 0 ? (
        <Typography>No hay datos mensuales para mostrar.</Typography>
      ) : (
        <Bar data={chartData} options={options} />
      )}
    </Box>
  );
};

export default DetalleMesChart;
