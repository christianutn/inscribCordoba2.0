import React, { useState, useEffect, useMemo } from 'react'; // Agregado useMemo si es necesario
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
// Se elimina getMatrizFechas
import { getInstancias } from '../services/instancias.service';

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
  const [dataCursosInician, setDataCursosInician] = useState([]); // Renombrado para claridad
  const [labels, setLabels] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  const [baseOptions, setBaseOptions] = useState({
    chart: {
      type: 'bar',
      height: 400,
      toolbar: { show: true } // Añadido toolbar por si acaso
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        // borderRadius: 4 // Opcional para barras redondeadas
      },
    },
    dataLabels: {
      enabled: false, // Habilitar si se quieren etiquetas en las barras
      // formatter: function (val) {
      //   return val;
      // },
      // offsetY: -20,
      // style: {
      //   fontSize: '12px',
      //   colors: ["#304758"]
      // }
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
      labels: {
          style: {
              fontSize: '10px' // Ajustar tamaño si los nombres de los meses son largos
          }
      }
    },
    yaxis: {
      title: {
        text: 'Cantidad',
      },
      min: 0,
      // tickAmount: 5, // Para controlar el número de ticks
      // labels: {
      //   formatter: function (val) {
      //     return val.toFixed(0); // Asegurar enteros en el eje Y
      //   }
      // }
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      // theme: 'dark', // Opcional
      x: {
        formatter: function (value, { seriesIndex, dataPointIndex, w }) {
           // 'value' aquí es el índice de la categoría, usamos 'labels' para obtener el nombre del mes
          return labels[dataPointIndex] || '';
        }
      },
      y: {
        formatter: function (val) {
          return val; // El valor numérico de la barra
        },
      },
    },
    title: {
      text: 'Resumen Mensual',
      align: 'center',
      style: {
          fontSize: '16px'
      }
    },
    legend: { show: true, position: 'top', horizontalAlign: 'center', offsetY: 10 }, // Mostrar leyenda
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const todasInstancias = await getInstancias();
        if (!Array.isArray(todasInstancias)) {
            throw new Error("La respuesta de getInstancias no es un array");
        }

        // Filtrar instancias activas (no CANC ni SUSP)
        const instanciasActivas = todasInstancias.filter(inst =>
          inst.estado_instancia !== 'CANC' && inst.estado_instancia !== 'SUSP'
        );

        // Agrupar por mes
        const datosPorMes = {};

        instanciasActivas.forEach(instancia => {
          if (instancia.fecha_inicio_curso) {
            const fechaInicio = dayjs(instancia.fecha_inicio_curso);
            if (fechaInicio.isValid()) {
              const mesClave = fechaInicio.format('YYYY-MM');

              if (!datosPorMes[mesClave]) {
                datosPorMes[mesClave] = {
                  cantidadCupoMensual: 0,
                  cantidadCursosMensual: 0,
                };
              }
              datosPorMes[mesClave].cantidadCursosMensual += 1;
              datosPorMes[mesClave].cantidadCupoMensual += Number(instancia.cupo) || 0;
            }
          }
        });

        const mesesClaves = Object.keys(datosPorMes).sort();

        if (mesesClaves.length === 0) {
          setDataCupo([]);
          setDataCursosInician([]);
          setLabels([]);
          setBaseOptions(prev => ({ ...prev, xaxis: { ...prev.xaxis, categories: [] } }));
          setLoading(false);
          return;
        }

        const currentLabels = mesesClaves.map(m =>
          dayjs(m + '-01').format('MMMM YYYY') // Formato completo del mes y año
        );

        const currentDatosCupo = mesesClaves.map(m => datosPorMes[m].cantidadCupoMensual);
        const currentDatosCursosInician = mesesClaves.map(m => datosPorMes[m].cantidadCursosMensual);

        setDataCupo(currentDatosCupo);
        setDataCursosInician(currentDatosCursosInician);
        setLabels(currentLabels); // Guardar los labels para el tooltip

        setBaseOptions(prevOptions => ({
          ...prevOptions,
          xaxis: {
            ...prevOptions.xaxis,
            categories: currentLabels, // Usar los labels formateados para el eje X
          },
          title: {
            ...prevOptions.title,
            text: 'Resumen Mensual de Cupo y Cursos Iniciados',
          }
        }));

      } catch (error) {
        console.error('Error procesando datos de instancias:', error);
        setDataCupo([]);
        setDataCursosInician([]);
        setLabels([]);
        setBaseOptions(prev => ({ ...prev, xaxis: { ...prev.xaxis, categories: [] } }));
      } finally {
        setLoading(false);
      }
    })();
  }, []); // Cargar una sola vez al montar el componente

  const handleChangeTab = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Opciones específicas para cada gráfico, heredando de baseOptions
  const cupoChartOptions = useMemo(() => ({
    ...baseOptions,
    yaxis: {
      ...baseOptions.yaxis,
      title: {
        text: 'Total Cupo Mensual',
      },
    },
    colors: ['#36A2EB'], // Color para el gráfico de cupo
  }), [baseOptions]);

  const cursosChartOptions = useMemo(() => ({
    ...baseOptions,
    yaxis: {
      ...baseOptions.yaxis,
      title: {
        text: 'Total Cursos Iniciados Mensual',
      },
    },
    colors: ['#FF6384'], // Color para el gráfico de cursos
    // legend: { show: true, position: 'top' }
  }), [baseOptions]);


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
              <Tab label="Cupo Mensual (Cursos Iniciados)" id="monthly-chart-tab-0" aria-controls="monthly-chart-tabpanel-0" />
              <Tab label="Cursos Iniciados Mensual" id="monthly-chart-tab-1" aria-controls="monthly-chart-tabpanel-1" />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            {/* Usar .some(v => v > 0) para mostrar solo si hay datos */}
            {dataCupo.length > 0 && dataCupo.some(v => v > 0) ? (
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <ReactApexChart
                  options={cupoChartOptions} // Usar opciones específicas
                  series={[{ name: 'Total Cupo Mensual (Cursos Iniciados)', data: dataCupo }]}
                  type="bar"
                  height={chartHeight}
                  width="100%"
                />
              </Box>
            ) : <Typography align="center" sx={{ p: 2 }}>No hay datos de cupo mensual.</Typography>}
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            {dataCursosInician.length > 0 && dataCursosInician.some(v => v > 0) ? (
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <ReactApexChart
                  options={cursosChartOptions} // Usar opciones específicas
                  series={[{ name: 'Total Cursos Iniciados Mensual', data: dataCursosInician }]}
                  type="bar"
                  height={chartHeight}
                  width="100%"
                />
              </Box>
            ) : <Typography align="center" sx={{ p: 2 }}>No hay datos de cursos iniciados mensuales.</Typography>}
          </TabPanel>
        </Paper>
      )}
    </Box>
  );
};

export default DetalleMesChart;