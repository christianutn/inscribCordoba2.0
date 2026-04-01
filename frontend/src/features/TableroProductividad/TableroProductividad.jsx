import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Button,
  useTheme,
  Divider,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import ReactApexChart from "react-apexcharts";
import { DataGrid } from "@mui/x-data-grid";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CodeIcon from "@mui/icons-material/Code";

// Services
import { getTablaInstanciasPorUsuario } from "../../services/instancias.service";
import { getDatosDesarrollo } from "../../services/datosDesarrollo.service";

// Icons
import DeveloperModeIcon from "@mui/icons-material/DeveloperMode";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

const TableroProductividad = () => {
  const theme = useTheme();

  // Filters state
  const [fechaDesde, setFechaDesde] = useState(dayjs().startOf("month"));
  const [fechaHasta, setFechaHasta] = useState(dayjs().endOf("month"));
  
  // Data state
  const [loading, setLoading] = useState(false);
  const [adminData, setAdminData] = useState([]);
  const [devData, setDevData] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Calcs for dates
      const firstDay = fechaDesde.format("YYYY-MM-DD");
      const lastDay = fechaHasta.format("YYYY-MM-DD");

      // Parallel fetching
      const [adminRes, devRes] = await Promise.all([
        getTablaInstanciasPorUsuario(firstDay, lastDay),
        getDatosDesarrollo("", "", "")
      ]);

      setAdminData(adminRes || []);
      
      const filteredDevData = (devRes || []).filter(item => {
        const itemDate = dayjs(`${item.anio}-${item.mes}-01`);
        const validStart = itemDate.isAfter(fechaDesde.startOf('month').subtract(1, 'day'));
        const validEnd = itemDate.isBefore(fechaHasta.endOf('month').add(1, 'day'));
        return validStart && validEnd;
      });

      const devMap = new Map();
      filteredDevData.forEach(item => {
        const cuil = item.detalle_usuario?.cuil || item.cuil || "Desconocido";
        if (!devMap.has(cuil)) {
          devMap.set(cuil, {
             id: cuil,
             cuil: cuil,
             lineas_cod_modificadas: 0,
             lineas_cod_eliminadas: 0,
             observaciones: item.observaciones ? item.observaciones.trim() : ""
          });
        }
        const existing = devMap.get(cuil);
        existing.lineas_cod_modificadas += (item.lineas_cod_modificadas || 0);
        existing.lineas_cod_eliminadas += (item.lineas_cod_eliminadas || 0);
        
        if (item.observaciones && !existing.observaciones.includes(item.observaciones.trim())) {
             existing.observaciones += existing.observaciones ? ` | ${item.observaciones.trim()}` : item.observaciones.trim();
        }
      });

      setDevData(Array.from(devMap.values()));
    } catch (error) {
      console.error("Error obteniendo datos del tablero:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [fechaDesde, fechaHasta]);

  // --- Admin Data Stats ---
  const totalCargasAdmin = adminData.reduce((acc, curr) => acc + curr.total, 0);
  const totalAutogestionadosAdmin = adminData.reduce((acc, curr) => acc + curr.cantidad_autogestionados, 0);
  const totalConvencionalesAdmin = adminData.reduce((acc, curr) => acc + curr.cantidad_convencionales, 0);

  // --- Dev Data Stats ---
  const totalModificadasDev = devData.reduce((acc, curr) => acc + (curr.lineas_cod_modificadas || 0), 0);
  const totalEliminadasDev = devData.reduce((acc, curr) => acc + (curr.lineas_cod_eliminadas || 0), 0);

  // --- Charts Config ---
  const adminChartOptions = {
    chart: { type: "bar", stacked: true, toolbar: { show: false }, background: "transparent" },
    colors: [theme.palette.primary.main, theme.palette.secondary.main],
    plotOptions: { bar: { horizontal: false, columnWidth: "50%", borderRadius: 4 } },
    xaxis: { categories: adminData.map(d => `${d.nombre} ${d.apellido}`), labels: { style: { colors: theme.palette.text.secondary } } },
    yaxis: { labels: { style: { colors: theme.palette.text.secondary } } },
    legend: { position: "top", labels: { colors: theme.palette.text.primary } },
    fill: { opacity: 1 },
    dataLabels: { enabled: true, style: { fontSize: "12px" } },
    tooltip: { theme: 'light' },
  };

  const adminChartSeries = [
    { name: "Convencionales", data: adminData.map(d => d.cantidad_convencionales) },
    { name: "Autogestionados", data: adminData.map(d => d.cantidad_autogestionados) }
  ];

  const devChartOptions = {
    chart: { type: "bar", toolbar: { show: false }, background: "transparent" },
    colors: [theme.palette.success.main, theme.palette.error.main],
    plotOptions: { bar: { horizontal: false, columnWidth: "50%", borderRadius: 4, dataLabels: { position: 'top' } } },
    xaxis: { categories: devData.map(d => d.detalle_usuario?.cuil || d.cuil), labels: { style: { colors: theme.palette.text.secondary } } },
    yaxis: { labels: { style: { colors: theme.palette.text.secondary } } },
    legend: { position: "top", labels: { colors: theme.palette.text.primary } },
    dataLabels: { enabled: true, offsetY: -20, style: { fontSize: '12px', colors: [theme.palette.text.primary] } },
    tooltip: { theme: 'light' },
  };

  const devChartSeries = [
    { name: "Líneas Modificadas", data: devData.map(d => d.lineas_cod_modificadas) },
    { name: "Líneas Eliminadas", data: devData.map(d => d.lineas_cod_eliminadas) }
  ];

  // --- Columns Datagrid ---
  const adminColumns = [
    { field: "cuil", headerName: "CUIL", flex: 1, renderCell: (p) => <strong>{p.value}</strong> },
    { field: "nombreCompleto", headerName: "Agente", flex: 1.5, valueGetter: (p, row) => `${row.nombre} ${row.apellido}` },
    { field: "cantidad_convencionales", headerName: "Convencionales", flex: 1, type: "number" },
    { field: "cantidad_autogestionados", headerName: "Autogestionados", flex: 1, type: "number" },
    { field: "total", headerName: "Total de Cargas", flex: 1, type: "number", cellClassName: 'super-app-theme--header' },
  ];

  const devColumns = [
    { field: "cuil", headerName: "CUIL Desarrollador", flex: 1, renderCell: (p) => <strong>{p.value}</strong> },
    { field: "lineas_cod_modificadas", headerName: "Líneas Agregadas/Modificadas", flex: 1.5, type: "number" },
    { field: "lineas_cod_eliminadas", headerName: "Líneas Eliminadas", flex: 1.5, type: "number" },
    { field: "observaciones", headerName: "Observaciones", flex: 2 },
  ];

  const KpiCard = ({ title, value, subtitle, icon, color }) => (
    <Card elevation={0} sx={{ height: '100%', borderRadius: 3, border: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', p: 2, background: theme.palette.background.paper, transition: '0.3s', '&:hover': { boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', transform: 'translateY(-2px)' } }}>
      <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: `${color}15`, color: color, display: 'flex', mr: 2 }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>{title}</Typography>
        <Typography variant="h4" fontWeight={700} color="text.primary">{value}</Typography>
        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
      </Box>
    </Card>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100%", background: "#f8f9fa", borderRadius: "16px" }}>
      {/* HEADER ROW */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="800" color="primary.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon fontSize="large" /> Tablero Gerencial de Productividad
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Métricas consolidadas de Administración y Desarrollo
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: "white", p: 1, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Fecha Desde"
              value={fechaDesde}
              onChange={(newValue) => setFechaDesde(newValue)}
              format="DD/MM/YYYY"
              slotProps={{ textField: { size: "small", sx: { width: 140 } } }}
            />
            <DatePicker
              label="Fecha Hasta"
              value={fechaHasta}
              onChange={(newValue) => setFechaHasta(newValue)}
              format="DD/MM/YYYY"
              slotProps={{ textField: { size: "small", sx: { width: 140 } } }}
            />
          </LocalizationProvider>
          <Button variant="contained" color="primary" onClick={fetchData} startIcon={<AssessmentIcon />} disableElevation sx={{ borderRadius: 2 }}>
            Actualizar
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {/* SECCIÓN ADMINISTRACIÓN */}
          <Grid item xs={12}>
            <Typography variant="h5" fontWeight="700" color="text.primary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
               <AssignmentTurnedInIcon color="primary" /> Equipo de Administración
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <KpiCard title="Total Cargas" value={totalCargasAdmin} subtitle={`Periodo seleccionado`} icon={<AssessmentIcon fontSize="large" />} color={theme.palette.primary.main} />
              </Grid>
              <Grid item xs={12} md={4}>
                <KpiCard title="Autogestionados" value={totalAutogestionadosAdmin} subtitle="Cursos modalidad autogestionada" icon={<AssessmentIcon fontSize="large" />} color={theme.palette.secondary.main} />
              </Grid>
              <Grid item xs={12} md={4}>
                <KpiCard title="Convencionales" value={totalConvencionalesAdmin} subtitle="Cursos modalidad convencional" icon={<AssessmentIcon fontSize="large" />} color={theme.palette.info.main} />
              </Grid>

              {/* Chart Administration */}
              {adminData.length > 0 && (
                <Grid item xs={12} lg={6}>
                  <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, p: 2, height: '100%' }}>
                    <Typography variant="h6" fontWeight="600" mb={2}>Distribución de Cargas por Agente</Typography>
                    <ReactApexChart options={adminChartOptions} series={adminChartSeries} type="bar" height={350} />
                  </Card>
                </Grid>
              )}

              {/* Table Administration */}
              <Grid item xs={12} lg={adminData.length > 0 ? 6 : 12}>
                <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, p: 2, height: '100%' }}>
                   <Typography variant="h6" fontWeight="600" mb={2}>Detalle de Cargas (Agentes)</Typography>
                   <Box sx={{ height: 350, width: '100%' }}>
                    <DataGrid
                      rows={adminData.map((row, idx) => ({ id: idx, ...row }))}
                      columns={adminColumns}
                      pageSizeOptions={[5]}
                      disableRowSelectionOnClick
                      sx={{
                        border: 0,
                        '& .MuiDataGrid-columnHeaders': { backgroundColor: theme.palette.grey[50] },
                        '& .MuiDataGrid-cell': { fontSize: '0.9rem' }
                      }}
                    />
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* SECCIÓN DESARROLLO */}
          <Grid item xs={12} sx={{ mt: 3 }}>
             <Typography variant="h5" fontWeight="700" color="text.primary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
               <DeveloperModeIcon color="success" /> Equipo de Desarrollo
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <KpiCard title="Total Líneas Modificadas" value={totalModificadasDev} subtitle={`Periodo seleccionado`} icon={<CodeIcon fontSize="large" />} color={theme.palette.success.main} />
              </Grid>
              <Grid item xs={12} md={6}>
                <KpiCard title="Total Líneas Eliminadas" value={totalEliminadasDev} subtitle="Refactorización y limpieza" icon={<CodeIcon fontSize="large" />} color={theme.palette.error.main} />
              </Grid>

              {/* Chart Development */}
              {devData.length > 0 ? (
                <Grid item xs={12} lg={6}>
                  <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, p: 2, height: '100%' }}>
                    <Typography variant="h6" fontWeight="600" mb={2}>Impacto de Código por Desarrollador</Typography>
                    <ReactApexChart options={devChartOptions} series={devChartSeries} type="bar" height={350} />
                  </Card>
                </Grid>
              ) : (
                <Grid item xs={12} lg={6}>
                   <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography color="text.secondary">No hay datos de desarrollo para el mes seleccionado.</Typography>
                   </Card>
                </Grid>
              )}

              {/* Table Development */}
              <Grid item xs={12} lg={6}>
                 <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, p: 2, height: '100%' }}>
                   <Typography variant="h6" fontWeight="600" mb={2}>Detalle de Commits/Trabajo</Typography>
                   <Box sx={{ height: 350, width: '100%' }}>
                    <DataGrid
                      rows={devData.map((row) => ({ id: row.id, ...row }))}
                      columns={devColumns}
                      pageSizeOptions={[5]}
                      disableRowSelectionOnClick
                      sx={{
                        border: 0,
                        '& .MuiDataGrid-columnHeaders': { backgroundColor: theme.palette.grey[50] },
                        '& .MuiDataGrid-cell': { fontSize: '0.9rem' }
                      }}
                    />
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default TableroProductividad;
