import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  CircularProgress
} from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { getMatrizFechas } from '../services/googleSheets.service';

dayjs.locale('es');

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`monthly-chart-tabpanel-${index}`}
      aria-labelledby={`monthly-chart-tab-${index}`}
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

const DetalleMesChart = () => {
  const [loading, setLoading] = useState(true);
  const [dataCupo, setDataCupo] = useState([]);
  const [dataCursos, setDataCursos] = useState([]);
  const [labels, setLabels] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  const [baseOptions, setBaseOptions] = useState({
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
      x: {
        formatter: function (value, { seriesIndex, dataPointIndex, w }) {
          return labels[dataPointIndex] || '';
        }
      },
      y: {
        formatter: function (val) {
          return val;
        },
      },
    },
    title: {
      text: 'Resumen Mensual',
      align: 'center',
    },
    legend: { show: false },
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const matriz = await getMatrizFechas();
        const mesesClaves = Object.keys(matriz)
          .filter(k => /^\d{4}-\d{2}$/.test(k))
          .sort();

        if (mesesClaves.length === 0) {
          setDataCupo([]);
          setDataCursos([]);
          setLabels([]);
          setBaseOptions(prev => ({ ...prev, xaxis: { ...prev.xaxis, categories: [] } }));
          setLoading(false);
          return;
        }

        const currentLabels = mesesClaves.map(m =>
          dayjs(m + '-01').format('MMMM YYYY')
        );

        const currentDatosCupo = mesesClaves.map(m => matriz[m].cantidadCupoMensual || 0);
        const currentDatosCursos = mesesClaves.map(m => matriz[m].cantidadCursosMensual || 0);

        setDataCupo(currentDatosCupo);
        setDataCursos(currentDatosCursos);
        setLabels(currentLabels);

        setBaseOptions(prevOptions => ({
          ...prevOptions,
          xaxis: {
            ...prevOptions.xaxis,
            categories: currentLabels,
          },
          title: {
            ...prevOptions.title,
            text: 'Resumen Mensual de Cupo y Cursos',
          }
        }));

      } catch (error) {
        console.error('Error cargando matriz de fechas:', error);
        setDataCupo([]);
        setDataCursos([]);
        setLabels([]);
        setBaseOptions(prev => ({ ...prev, xaxis: { ...prev.xaxis, categories: [] } }));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChangeTab = (event, newValue) => {
    setActiveTab(newValue);
  };

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

  const chartHeight = baseOptions?.chart?.height || 400;

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: chartHeight + 50 }}>
          <CircularProgress />
        </Box>
      ) : labels.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: chartHeight + 50, border: '1px dashed grey', borderRadius: '4px', p: 2, textAlign: 'center' }}>
          <Typography>No hay datos mensuales disponibles para mostrar.</Typography>
        </Box>
      ) : (
        <Paper elevation={1} sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleChangeTab} aria-label="Gráficos de resumen mensual" centered>
              <Tab label="Cupo Mensual" id="monthly-chart-tab-0" aria-controls="monthly-chart-tabpanel-0" />
              <Tab label="Cursos Mensuales" id="monthly-chart-tab-1" aria-controls="monthly-chart-tabpanel-1" />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            {dataCupo.length > 0 ? (
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <ReactApexChart
                  options={getChartOptions('Total Cupo Mensual', '#36A2EB')}
                  series={[{ name: 'Total Cupo Mensual', data: dataCupo }]}
                  type="bar"
                  height={chartHeight}
                  width="100%"
                />
              </Box>
            ) : <Typography align="center" sx={{ p: 2 }}>No hay datos de cupo mensual.</Typography>}
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            {dataCursos.length > 0 ? (
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <ReactApexChart
                  options={getChartOptions('Total Cursos Mensual', '#FF6384')}
                  series={[{ name: 'Total Cursos Mensual', data: dataCursos }]}
                  type="bar"
                  height={chartHeight}
                  width="100%"
                />
              </Box>
            ) : <Typography align="center" sx={{ p: 2 }}>No hay datos de cursos mensuales.</Typography>}
          </TabPanel>
        </Paper>
      )}
    </Box>
  );
};

export default DetalleMesChart;