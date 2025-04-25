import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Box, CircularProgress, Typography } from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { getMatrizFechas } from '../services/googleSheets.service';

dayjs.locale('es');

const DetalleMesChart = () => {
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState([]);
  const [options, setOptions] = useState({
    chart: {
      type: 'bar',
      height: 400,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
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
        text: 'Mes',
      },
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
      y: {
        formatter: function (val) {
          return val;
        },
      },
    },
    title: {
      text: 'Resumen Mensual de Cupo y Cursos',
      align: 'center',
    },
    legend: {
      position: 'top',
    },
    colors: ['#36A2EB', '#FF6384'],
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const matriz = await getMatrizFechas();
        const mesesClaves = Object.keys(matriz)
          .filter(k => /^\d{4}-\d{2}$/.test(k))
          .sort();

        const labels = mesesClaves.map(m =>
          dayjs(m + '-01').format('MMMM YYYY')
        );

        const datosCupo = mesesClaves.map(m => matriz[m].cantidadCupoMensual || 0);
        const datosCursos = mesesClaves.map(m => matriz[m].cantidadCursosMensual || 0);

        setSeries([
          {
            name: 'Total Cupo Mensual',
            data: datosCupo,
          },
          {
            name: 'Total Cursos Mensual',
            data: datosCursos,
          },
        ]);

        setOptions(prevOptions => ({
          ...prevOptions,
          xaxis: {
            ...prevOptions.xaxis,
            categories: labels,
          },
        }));

      } catch (error) {
        console.error('Error cargando matriz de fechas:', error);
        setSeries([]);
        setOptions(prevOptions => ({
          ...prevOptions,
          xaxis: {
            ...prevOptions.xaxis,
            categories: [],
          },
        }));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress />
        </Box>
      ) : series.length === 0 || series[0]?.data.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <Typography>No hay datos mensuales para mostrar.</Typography>
        </Box>
      ) : (
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={options.chart.height}
        />
      )}
    </Box>
  );
};

export default DetalleMesChart;