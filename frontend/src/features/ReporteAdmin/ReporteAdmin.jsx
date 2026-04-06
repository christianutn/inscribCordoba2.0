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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import ReactApexChart from "react-apexcharts";
import { DataGrid } from "@mui/x-data-grid";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CodeIcon from "@mui/icons-material/Code";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import { Autocomplete, TextField, Tooltip } from "@mui/material";

// Services
import { getTablaInstanciasPorUsuario } from "../../services/instancias.service";
import { getDatosDesarrollo } from "../../services/datosDesarrollo.service";

// Icons
import DeveloperModeIcon from "@mui/icons-material/DeveloperMode";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

const ReporteAdmin = () => {
  const theme = useTheme();

  // Logic for cycle Sep -> Aug
  const getInitialDates = () => {
    const today = dayjs();
    const currentYear = today.year();
    const isAfterSep = today.month() >= 8; // months are 0-indexed

    if (isAfterSep) {
      return {
        desde: dayjs(`${currentYear}-09-01`),
        hasta: dayjs(`${currentYear + 1}-08-31`)
      };
    } else {
      return {
        desde: dayjs(`${currentYear - 1}-09-01`),
        hasta: dayjs(`${currentYear}-08-31`)
      };
    }
  };

  const initialDates = getInitialDates();

  // Filters state
  const [fechaDesde, setFechaDesde] = useState(initialDates.desde);
  const [fechaHasta, setFechaHasta] = useState(initialDates.hasta);
  const [selectedAdmin, setSelectedAdmin] = useState(null); // Admin object {cuil, label}

  // Data state
  const [loading, setLoading] = useState(false);
  const [adminData, setAdminData] = useState([]);
  const [adminMonthlyData, setAdminMonthlyData] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState([]);
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

      const adminResArray = Array.isArray(adminRes) ? adminRes : [];
      const devResArray = Array.isArray(devRes) ? devRes : [];

      // Calculate months between
      let currentMonth = fechaDesde.startOf('month');
      const endMonth = fechaHasta.startOf('month');
      const monthsArray = [];
      const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
      while (currentMonth.isBefore(endMonth) || currentMonth.isSame(endMonth)) {
        monthsArray.push({
          label: `${monthNames[currentMonth.month()]} ${currentMonth.format('YY')}`,
          month: currentMonth.month() + 1,
          year: currentMonth.year()
        });
        currentMonth = currentMonth.add(1, 'month');
      }
      setSelectedMonths(monthsArray);

      const adminMap = new Map();
      const adminMonthlyMap = new Map();

      adminResArray.forEach(item => {
        const cuil = item.cuil;
        if (!adminMap.has(cuil)) {
          adminMap.set(cuil, {
            id: cuil,
            cuil: cuil,
            nombre: item.nombre || "Sin nombre",
            apellido: item.apellido || "",
            total: 0,
            cantidad_autogestionados: 0,
            cantidad_convencionales: 0
          });
          adminMonthlyMap.set(cuil, {});
        }

        const existing = adminMap.get(cuil);
        existing.total += Number(item.total || 0);
        existing.cantidad_autogestionados += Number(item.cantidad_autogestionados || 0);
        existing.cantidad_convencionales += Number(item.cantidad_convencionales || 0);

        const periodKey = `${item.anio}-${item.mes}`;
        adminMonthlyMap.get(cuil)[periodKey] = {
          autogestionados: Number(item.cantidad_autogestionados || 0),
          convencionales: Number(item.cantidad_convencionales || 0)
        };
      });

      setAdminData(Array.from(adminMap.values()));

      const monthlyDataArray = Array.from(adminMonthlyMap.keys()).map(cuil => {
        const adminInfo = adminMap.get(cuil) || {};
        const monthlyRecords = adminMonthlyMap.get(cuil) || {};

        let totalAutogestionados = 0;
        let totalConvencionales = 0;

        const rows = monthsArray.map(m => {
          const key = `${m.year}-${m.month}`;
          const record = monthlyRecords[key] || { autogestionados: 0, convencionales: 0 };
          const rowTotal = record.autogestionados + record.convencionales;

          totalAutogestionados += record.autogestionados;
          totalConvencionales += record.convencionales;

          return {
            label: m.label,
            autogestionados: record.autogestionados,
            convencionales: record.convencionales,
            total: rowTotal
          };
        });

        return {
          cuil,
          nombre: adminInfo.nombre,
          apellido: adminInfo.apellido,
          rows,
          totalAutogestionados,
          totalConvencionales,
          totalRows: totalAutogestionados + totalConvencionales
        };
      });
      setAdminMonthlyData(monthlyDataArray);

      const filteredDevData = devResArray.filter(item => {
        const itemDate = dayjs(`${item.anio}-${item.mes}-01`);
        const validStart = itemDate.isAfter(fechaDesde.startOf('month').subtract(1, 'day'));
        const validEnd = itemDate.isBefore(fechaHasta.endOf('month').add(1, 'day'));
        return validStart && validEnd;
      });

      const devMap = new Map();
      filteredDevData.forEach(item => {
        const cuil = item.detalle_usuario?.cuil || item.cuil || "Desconocido";
        const nombre = item.detalle_usuario?.detalle_persona
          ? `${item.detalle_usuario.detalle_persona.nombre} ${item.detalle_usuario.detalle_persona.apellido}`
          : cuil;

        if (!devMap.has(cuil)) {
          devMap.set(cuil, {
            id: cuil,
            cuil: cuil,
            nombreCompleto: nombre,
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

  // --- Derived Data for Filtering ---
  const filteredData = {
    adminStats: selectedAdmin
      ? adminData.filter(d => d.cuil === selectedAdmin.cuil)
      : adminData,
    adminMonthly: selectedAdmin
      ? adminMonthlyData.filter(d => d.cuil === selectedAdmin.cuil)
      : adminMonthlyData,
    devStats: devData // Development data remains for context or can be filtered if linked to admins
  };

  const handleClearFilters = () => {
    const defaults = getInitialDates();
    setFechaDesde(defaults.desde);
    setFechaHasta(defaults.hasta);
    setSelectedAdmin(null);
  };

  const adminOptions = adminData.map(d => ({
    cuil: d.cuil,
    label: `${d.nombre} ${d.apellido}`
  }));

  const isMedium = useMediaQuery(theme.breakpoints.down('md'));

  const formatName = (nombre, apellido) => {
    if (isMedium && nombre && apellido) {
      return `${nombre.charAt(0)}. ${apellido}`;
    }
    return `${nombre} ${apellido}`;
  };

  const formatFullNameShort = (fullName) => {
    if (!fullName) return "";
    if (isMedium) {
      const parts = fullName.trim().split(/\s+/);
      if (parts.length > 1) {
        return `${parts[0].charAt(0)}. ${parts.slice(1).join(' ')}`;
      }
    }
    return fullName;
  };

  // --- Admin Data Stats (Using Filtered Data) ---
  const totalCargasAdmin = (filteredData.adminStats || []).reduce((acc, curr) => acc + (curr?.total || 0), 0);
  const totalAutogestionadosAdmin = (filteredData.adminStats || []).reduce((acc, curr) => acc + (curr?.cantidad_autogestionados || 0), 0);
  const totalConvencionalesAdmin = (filteredData.adminStats || []).reduce((acc, curr) => acc + (curr?.cantidad_convencionales || 0), 0);

  // --- Dev Data Stats ---
  const totalModificadasDev = (devData || []).reduce((acc, curr) => acc + (curr?.lineas_cod_modificadas || 0), 0);
  const totalEliminadasDev = (devData || []).reduce((acc, curr) => acc + (curr?.lineas_cod_eliminadas || 0), 0);

  // --- Charts Config ---
  const adminChartOptions = {
    chart: { type: "bar", stacked: true, toolbar: { show: false }, background: "transparent" },
    colors: [theme.palette.primary.main, theme.palette.secondary.main],
    plotOptions: { bar: { horizontal: false, columnWidth: "50%", borderRadius: 4 } },
    xaxis: {
      categories: filteredData.adminStats.map(d => formatName(d.nombre, d.apellido)),
      labels: {
        style: { colors: theme.palette.text.secondary, fontSize: '13px' },
        rotate: -45, // Rotar para evitar encimamiento
        rotateAlways: false,
        hideOverlappingLabels: true,
      }
    },
    yaxis: { labels: { style: { colors: theme.palette.text.secondary } } },
    legend: { position: "top", labels: { colors: theme.palette.text.primary, fontSize: '14px' } },
    fill: { opacity: 1 },
    dataLabels: { enabled: true, style: { fontSize: "14px" } },
    tooltip: { theme: 'light' },
    responsive: [
      {
        breakpoint: 600,
        options: {
          xaxis: { labels: { rotate: -90, style: { fontSize: '10px' } } },
          plotOptions: { bar: { columnWidth: '80%' } }
        }
      }
    ]
  };

  const adminChartSeries = [
    { name: "Convencionales", data: filteredData.adminStats.map(d => d.cantidad_convencionales) },
    { name: "Autogestionados", data: filteredData.adminStats.map(d => d.cantidad_autogestionados) }
  ];

  const devChartOptions = {
    chart: { type: "bar", toolbar: { show: false }, background: "transparent" },
    colors: [theme.palette.success.main, theme.palette.error.main],
    plotOptions: { bar: { horizontal: false, columnWidth: "50%", borderRadius: 4, dataLabels: { position: 'top' } } },
    xaxis: {
      categories: devData.map(d => formatFullNameShort(d.nombreCompleto)),
      labels: {
        style: { colors: theme.palette.text.secondary, fontSize: '13px' },
        rotate: -45,
        rotateAlways: false,
        hideOverlappingLabels: true
      }
    },
    yaxis: { labels: { style: { colors: theme.palette.text.secondary } } },
    legend: { position: "top", labels: { colors: theme.palette.text.primary, fontSize: '14px' } },
    dataLabels: { enabled: true, offsetY: -20, style: { fontSize: '12px', colors: [theme.palette.text.primary] } },
    tooltip: { theme: 'light' },
    responsive: [
      {
        breakpoint: 600,
        options: {
          xaxis: { labels: { rotate: -90, style: { fontSize: '10px' } } }
        }
      }
    ]
  };

  const devChartSeries = [
    { name: "Líneas Modificadas", data: devData.map(d => d.lineas_cod_modificadas) },
    { name: "Líneas Eliminadas", data: devData.map(d => d.lineas_cod_eliminadas) }
  ];

  // --- Columns Datagrid ---
  const adminColumns = [
    { field: "cuil", headerName: "CUIL", flex: 1, renderCell: (p) => <strong>{p.value}</strong> },
    { field: "nombre", headerName: "Administrador/a", flex: 1.5, valueGetter: (p, row) => `${row.nombre || ''} ${row.apellido || ''}` },
    { field: "cantidad_convencionales", headerName: "Convencionales", flex: 1, type: "number" },
    { field: "cantidad_autogestionados", headerName: "Autogestionados", flex: 1, type: "number" },
    { field: "total", headerName: "Total de Cursos", flex: 1, type: "number", cellClassName: 'super-app-theme--header' },
  ];

  const devColumns = [
    { field: "nombreCompleto", headerName: "Nombre Desarrollador/a", flex: 1.5, renderCell: (p) => <strong>{p.value}</strong> },
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
      {/* HEADER SECTION */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="700" color="black" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          Tablero Equipo de Administradores
        </Typography>
        <Typography variant="h6" color="text.secondary" fontWeight={500} sx={{ opacity: 0.8 }}>
          Control de métricas y gestión del equipo
        </Typography>
      </Box>

      {/* FILTER PANEL - Improved alignment and removed redundant button */}
      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 4, mb: 4, p: 2, bgcolor: "rgba(255,255,255,0.7)", backdropFilter: 'blur(10px)' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={6} md={3.5}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Período Desde"
                value={fechaDesde}
                onChange={(v) => setFechaDesde(v)}
                format="DD/MM/YYYY"
                slotProps={{ textField: { fullWidth: true, size: "medium" } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={3.5}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Período Hasta"
                value={fechaHasta}
                onChange={(v) => setFechaHasta(v)}
                format="DD/MM/YYYY"
                slotProps={{ textField: { fullWidth: true, size: "medium" } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Autocomplete
              options={adminOptions}
              value={selectedAdmin}
              onChange={(_, newValue) => setSelectedAdmin(newValue)}
              renderInput={(params) => <TextField {...params} label="Filtrar por Administrador" variant="outlined" />}
              fullWidth
            />
            <Tooltip title="Limpiar Filtros">
              <Button
                variant="outlined"
                color="error"
                onClick={handleClearFilters}
                sx={{
                  minWidth: 56,
                  height: 56,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': { bgcolor: 'error.lighter', borderColor: 'error.main' }
                }}
              >
                <ClearAllIcon />
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
      </Card>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {/* SECCIÓN ADMINISTRACIÓN */}
          <Grid item xs={12}>
            <Typography variant="h5" fontWeight="700" color="text.primary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssignmentTurnedInIcon color="primary" /> Equipo de Administradores
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <KpiCard title="Total Cursos" value={totalCargasAdmin} subtitle={`Periodo seleccionado`} icon={<AssessmentIcon fontSize="large" />} color={theme.palette.primary.main} />
              </Grid>
              <Grid item xs={12} md={4}>
                <KpiCard title="Autogestionados" value={totalAutogestionadosAdmin} subtitle="Cursos modalidad autogestionada" icon={<AssessmentIcon fontSize="large" />} color={theme.palette.secondary.main} />
              </Grid>
              <Grid item xs={12} md={4}>
                <KpiCard title="Convencionales" value={totalConvencionalesAdmin} subtitle="Cursos modalidad convencional" icon={<AssessmentIcon fontSize="large" />} color={theme.palette.info.main} />
              </Grid>

              {/* Chart Administration */}
              {filteredData.adminStats.length > 0 && (
                <Grid item xs={12} lg={6}>
                  <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, p: 2, height: '100%' }}>
                    <Typography variant="h6" fontWeight="700" mb={3} sx={{ fontSize: '1.25rem' }}>Distribución de Cursos por Administradores</Typography>
                    <ReactApexChart options={adminChartOptions} series={adminChartSeries} type="bar" height={350} />
                  </Card>
                </Grid>
              )}

              {/* Table Administration */}
              <Grid item xs={12} lg={filteredData.adminStats.length > 0 ? 6 : 12}>
                <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, p: 2, height: '100%' }}>
                  <Typography variant="h6" fontWeight="700" mb={3} sx={{ fontSize: '1.25rem' }}>Resumen de Cursos Asignados</Typography>
                  <Box sx={{ height: 350, width: '100%' }}>
                    <DataGrid
                      rows={filteredData.adminStats.map((row, idx) => ({ id: idx, ...row }))}
                      columns={adminColumns}
                      pageSizeOptions={[5]}
                      disableRowSelectionOnClick
                      sx={{
                        border: 0,
                        '& .MuiDataGrid-columnHeaders': { backgroundColor: theme.palette.grey[100], fontWeight: '800' },
                        '& .MuiDataGrid-cell': { fontSize: '1rem', borderBottom: `1px solid ${theme.palette.divider}` }
                      }}
                    />
                  </Box>
                </Card>
              </Grid>

              {/* Monthly Tables per Admin */}
              {filteredData.adminMonthly.map((admin) => (
                <Grid item xs={12} lg={6} key={admin.cuil}>
                  <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, p: 3, height: '100%' }}>
                    <Typography variant="h6" fontWeight="700" mb={3} color="primary.dark" sx={{ borderLeft: `5px solid ${theme.palette.primary.main}`, pl: 2 }}>
                      Administrador/a: {admin.nombre} {admin.apellido}
                    </Typography>
                    <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                      <Table size="medium">
                        <TableHead sx={{ backgroundColor: theme.palette.grey[100] }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Mes</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Autogestionados</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Convencionales</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1rem', color: theme.palette.primary.main }}>Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {admin.rows.map((row, idx) => (
                            <TableRow key={idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                              <TableCell component="th" scope="row" sx={{ textTransform: 'capitalize', fontSize: '1rem' }}>{row.label}</TableCell>
                              <TableCell align="right" sx={{ fontSize: '1rem' }}>{row.autogestionados}</TableCell>
                              <TableCell align="right" sx={{ fontSize: '1rem' }}>{row.convencionales}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: '700', fontSize: '1rem' }}>{row.total}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow sx={{ backgroundColor: `${theme.palette.primary.main}15` }}>
                            <TableCell component="th" scope="row" sx={{ fontWeight: '800', color: theme.palette.primary.dark, fontSize: '1rem' }}>Total General</TableCell>
                            <TableCell align="right" sx={{ fontWeight: '800', fontSize: '1rem' }}>{admin.totalAutogestionados}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: '800', fontSize: '1rem' }}>{admin.totalConvencionales}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: '800', color: theme.palette.primary.dark, fontSize: '1.2rem' }}>{admin.totalRows}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Card>
                </Grid>
              ))}
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

export default ReporteAdmin;
