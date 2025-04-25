import React, { useEffect, useState, useMemo } from 'react';
// import dayjs from 'dayjs'; // Eliminado
// import customParseFormat from 'dayjs/plugin/customParseFormat'; // Eliminado
// import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'; // Eliminado
// import isBefore from 'dayjs/plugin/isBefore'; // Eliminado
import { getCronograma } from "../services/googleSheets.service.js";
import { descargarExcel } from "../services/excel.service.js";
import { DataGrid } from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import BotonCircular from "./UIElements/BotonCircular.jsx";
import Titulo from "../components/fonts/TituloPrincipal.jsx";

// dayjs.extend(customParseFormat); // Eliminado
// dayjs.extend(isSameOrAfter); // Eliminado
// dayjs.extend(isBefore); // Eliminado

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: '80%', maxWidth: 600, bgcolor: 'background.paper', border: 'none',
  borderRadius: 2, boxShadow: 24, p: 0, maxHeight: '90vh', display: 'flex', flexDirection: 'column',
};

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
const DATE_FORMATS_TO_TRY = ['DD/MM/YYYY', 'D/M/YYYY', 'DD-MM-YYYY', 'D-M-YYYY', 'YYYY-MM-DD'];

// --- FUNCIONES AUXILIARES PARA FECHAS NATIVAS ---
function parseDateFromString(dateString) {
  if (!dateString || typeof dateString !== 'string') return null;
  const trimmedDate = dateString.trim();

  // Formato YYYY-MM-DD (más estándar)
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
    const [year, month, day] = trimmedDate.split('-').map(Number);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const date = new Date(Date.UTC(year, month - 1, day));
      // Verificar si la fecha creada es válida y corresponde al input
      if (!isNaN(date.getTime()) && date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day) {
        return date;
      }
    }
  }

  // Formatos DD/MM/YYYY o DD-MM-YYYY (y variantes con un dígito)
  const parts = trimmedDate.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (parts) {
    const day = parseInt(parts[1], 10);
    const month = parseInt(parts[2], 10);
    const year = parseInt(parts[3], 10);

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const date = new Date(Date.UTC(year, month - 1, day));
      // Verificar si la fecha creada es válida y corresponde al input
      if (!isNaN(date.getTime()) && date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day) {
        return date;
      }
    }
  }

  return null; // No se pudo parsear con los formatos esperados
}

// Resetea la hora a 00:00:00.000 para comparar solo días
function resetTime(date) {
  if (!date) return null;
  const newDate = new Date(date); // Clonar para no mutar original
  newDate.setUTCHours(0, 0, 0, 0);
  return newDate;
}
// --- FIN FUNCIONES AUXILIARES ---

const Cronograma = () => {
  const [cursosData, setCursosData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [originalHeaders, setOriginalHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [ministerioOptions, setMinisterioOptions] = useState([]);
  const [areaOptions, setAreaOptions] = useState(['all']);
  const [ministerioFilter, setMinisterioFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [nombreFilter, setNombreFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');
  const [filterActiveNow, setFilterActiveNow] = useState(false);

  const COLUMNAS_VISIBLES = useMemo(() => [
    "Ministerio", "Area", "Nombre del curso",
    "Fecha inicio de inscripción", "Fecha fin de inscripción",
    "Fecha inicio del curso", "Fecha fin del curso"
  ], []);

  const columnsForGrid = useMemo(() => {
    if (!originalHeaders.length) return [];
    return originalHeaders
      .filter(h => COLUMNAS_VISIBLES.includes(h))
      .map(header => {
        let flex = 1;
        if (header === "Nombre del curso") flex = 2.5;
        if (header === "Ministerio" || header === "Area") flex = 1.5;
        if (header.toLowerCase().includes("fecha")) flex = 1.2;
        return { field: header, headerName: header, flex, minWidth: 130 };
      });
  }, [originalHeaders, COLUMNAS_VISIBLES]);

  const isFilterActive = useMemo(() => {
    return nombreFilter.trim() !== '' || ministerioFilter !== 'all' || areaFilter !== 'all' || monthFilter !== 'all' || filterActiveNow;
  }, [nombreFilter, ministerioFilter, areaFilter, monthFilter, filterActiveNow]);

  useEffect(() => {
    setLoading(true);
    setInitialLoadComplete(false);
    setError(null);
    (async () => {
      try {
        const dataCronograma = await getCronograma();
        if (!dataCronograma || !Array.isArray(dataCronograma) || dataCronograma.length < 1 || !Array.isArray(dataCronograma[0])) {
          console.warn("Datos del cronograma inválidos o vacíos.");
          setCursosData([]);
          setOriginalHeaders([]);
          setMinisterioOptions(['all']);
        } else {
          const headers = dataCronograma[0].map((h, i) => (h ? String(h).trim() : `Columna_${i}`));
          setOriginalHeaders(headers);
          const minSet = new Set();
          const dataObjs = (dataCronograma.length > 1 ? dataCronograma.slice(1) : [])
            .map((row, idx) => {
              const obj = { id: idx };
              if (Array.isArray(row)) {
                headers.forEach((h, i) => {
                  const val = row[i] != null ? String(row[i]).trim() : '';
                  obj[h] = val;
                  if (h === "Ministerio" && val) minSet.add(val);
                });
              } else { console.warn(`Fila ${idx + 1} no es un array:`, row); }
              return obj;
            }).filter(obj => Object.keys(obj).length > 1);
          setCursosData(dataObjs);
          setMinisterioOptions(['all', ...Array.from(minSet).sort()]);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message || "Error al cargar datos.");
        setCursosData([]);
        setOriginalHeaders([]);
        setMinisterioOptions(['all']);
      } finally {
        setInitialLoadComplete(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!initialLoadComplete || !cursosData.length) {
      setAreaOptions(['all']);
      if (areaFilter !== 'all') setAreaFilter('all');
      return;
    }
    let relevantCourses = (ministerioFilter === 'all') ? cursosData : cursosData.filter(c => c["Ministerio"] === ministerioFilter);
    const areasSet = new Set(relevantCourses.map(c => c.Area).filter(Boolean));
    const newAreaOptions = ['all', ...Array.from(areasSet).sort()];
    setAreaOptions(newAreaOptions);
    if (ministerioFilter === 'all' && areaFilter !== 'all') setAreaFilter('all');
    if (ministerioFilter !== 'all' && !newAreaOptions.includes(areaFilter)) setAreaFilter('all');
  }, [ministerioFilter, areaFilter, cursosData, initialLoadComplete]);

  useEffect(() => {
    if (!initialLoadComplete) return;

    setLoading(true);
    let data = [...cursosData];

    if (ministerioFilter !== 'all') data = data.filter(c => c["Ministerio"] === ministerioFilter);
    if (ministerioFilter !== 'all' && areaFilter !== 'all') data = data.filter(c => c["Area"] === areaFilter);
    if (nombreFilter.trim()) data = data.filter(c => c["Nombre del curso"]?.toLowerCase().includes(nombreFilter.trim().toLowerCase()));
    if (monthFilter !== 'all') {
      const targetMonth = parseInt(monthFilter, 10); // targetMonth es 0-11
      data = data.filter(c => {
        const parsedDate = parseDateFromString(c["Fecha inicio del curso"]);
        // getMonth() es 0-indexado
        return parsedDate ? parsedDate.getUTCMonth() === targetMonth : false;
      });
    }
    if (filterActiveNow) {
      const todayDate = resetTime(new Date()); // Hoy a las 00:00:00 UTC

      if (todayDate) { // Solo filtrar si obtenemos bien la fecha de hoy
        data = data.filter(c => {
          const parsedStartDate = parseDateFromString(c["Fecha inicio del curso"]);
          const parsedEndDate = parseDateFromString(c["Fecha fin del curso"]);

          const startDateReset = resetTime(parsedStartDate);
          const endDateReset = resetTime(parsedEndDate);

          if (!startDateReset || !endDateReset) {
            return false; // No se pueden parsear las fechas, no cumple
          }

          // inicio < hoy Y fin >= hoy
          return startDateReset < todayDate && endDateReset >= todayDate;
        });
      }
    }

    setFilteredData(data);
    setLoading(false);

  }, [cursosData, originalHeaders, ministerioFilter, areaFilter, nombreFilter, monthFilter, filterActiveNow, initialLoadComplete]);

  const handleRowClick = params => {
    const fullRow = cursosData.find(c => c.id === params.row.id);
    setSelectedRowData(fullRow || params.row); setModalOpen(true);
  };
  const handleCloseModal = () => { setModalOpen(false); setSelectedRowData(null); };
  const handleDescargarExcel = async () => {
    if (!filteredData.length) return; setLoading(true);
    try {
      const headersVis = columnsForGrid.map(c => c.headerName);
      const dataToExport = filteredData.map(row => {
        const exportedRow = {};
        headersVis.forEach(header => { exportedRow[header] = row[header] ?? ''; });
        return exportedRow;
      });
      await descargarExcel(dataToExport, headersVis, "Cronograma_Filtrado");
    } catch (e) { console.error("Error generating Excel:", e); setError("Error al generar el Excel."); }
    finally { setLoading(false); }
  };
  const handleMinisterioChange = e => { setMinisterioFilter(e.target.value); };
  const handleAreaChange = e => setAreaFilter(e.target.value);
  const handleNombreChange = e => setNombreFilter(e.target.value);
  const handleMonthChange = e => setMonthFilter(e.target.value);
  const handleToggleFilterActiveNow = () => {
    setFilterActiveNow(prev => !prev);
  };
  const handleClearFilters = () => {
    setNombreFilter('');
    setMinisterioFilter('all');
    setAreaFilter('all');
    setMonthFilter('all');
    setFilterActiveNow(false);
  };

  if (!initialLoadComplete && loading) {
    return (
      <Backdrop open sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, color: '#fff' }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', p: 3 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>Error</Typography>
          <Typography>{error}</Typography>
        </Paper>
      </Box>
    );
  }

  if (!loading && !error && cursosData.length === 0 && originalHeaders.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', p: 3 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>No Hay Datos Disponibles</Typography>
          <Typography>No se encontraron datos en el cronograma para mostrar.</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Titulo texto="Cronograma" />
        <BotonCircular
          icon="descargar"
          onClick={handleDescargarExcel}
          tooltip="Descargar Vista Actual"
          disabled={loading || !filteredData.length}
        />
      </Box>
      <Divider sx={{ mb: 3, borderBottomWidth: 2 }} />

      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3} lg={2.5}>
            <TextField fullWidth label="Buscar por Nombre" variant="outlined" size="small" value={nombreFilter} onChange={handleNombreChange} disabled={loading} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>), }} />
          </Grid>
          <Grid item xs={12} sm={6} md={2} lg={2}>
            <FormControl fullWidth size="small" variant="outlined" disabled={loading || ministerioOptions.length <= 1}>
              <InputLabel id="ministerio-filter-label">Ministerio</InputLabel>
              <Select labelId="ministerio-filter-label" id="select-ministerio" value={ministerioFilter} label="Ministerio" onChange={handleMinisterioChange} startAdornment={<AccountBalanceIcon sx={{ mr: 1, color: 'action.active', ml: -0.5 }} />}>
                <MenuItem value="all"><em>Todos</em></MenuItem>
                {ministerioOptions.map((opt, i) => opt !== 'all' && <MenuItem key={i} value={opt}>{opt}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2} lg={2}>
            <FormControl fullWidth size="small" variant="outlined" disabled={loading || ministerioFilter === 'all' || areaOptions.length <= 1}>
              <InputLabel id="area-filter-label">Área</InputLabel>
              <Select labelId="area-filter-label" id="select-area" value={areaFilter} label="Área" onChange={handleAreaChange} startAdornment={<FolderSpecialIcon sx={{ mr: 1, color: 'action.active', ml: -0.5 }} />}>
                <MenuItem value="all"><em>Todas</em></MenuItem>
                {areaOptions.map((opt, i) => opt !== 'all' && <MenuItem key={i} value={opt}>{opt}</MenuItem>)}
                {ministerioFilter !== 'all' && areaOptions.length <= 1 && !loading && <MenuItem value="all" disabled><em>(Sin áreas)</em></MenuItem>}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2} lg={2}>
            <FormControl fullWidth size="small" variant="outlined" disabled={loading}>
              <InputLabel id="mes-filter-label">Mes Inicio Curso</InputLabel>
              <Select labelId="mes-filter-label" id="select-month" value={monthFilter} label="Mes Inicio Curso" onChange={handleMonthChange} startAdornment={<CalendarMonthIcon sx={{ mr: 1, color: 'action.active', ml: -0.5 }} />}>
                <MenuItem value="all"><em>Todos</em></MenuItem>
                {MONTH_NAMES.map((m, i) => <MenuItem key={i} value={i.toString()}>{m}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2} lg={2}>
            <Button
              fullWidth
              variant={filterActiveNow ? "contained" : "outlined"}
              color="primary"
              size="medium"
              onClick={handleToggleFilterActiveNow}
              disabled={loading}
              startIcon={<PlayCircleOutlineIcon />}
              sx={{ height: '40px' }}
            >
              En Curso
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={1} lg={1.5}>
            <Button fullWidth variant="outlined" size="medium" onClick={handleClearFilters} disabled={!isFilterActive || loading} startIcon={<ClearAllIcon />} sx={{ height: '40px', minWidth: 'auto', px: 1 }}>Limpiar</Button>
          </Grid>
        </Grid>
      </Paper>

      {loading && initialLoadComplete && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2, alignItems: 'center' }}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">Actualizando tabla...</Typography>
        </Box>
      )}

      <Paper elevation={3} sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredData}
          columns={columnsForGrid}
          localeText={esES.components.MuiDataGrid.defaultProps.localeText}
          onRowClick={handleRowClick}
          getRowId={r => r.id}
          loading={loading && filteredData.length === 0 && initialLoadComplete}
          density="compact"
          disableRowSelectionOnClick
          initialState={{ sorting: { sortModel: originalHeaders.includes('Fecha inicio del curso') ? [{ field: 'Fecha inicio del curso', sort: 'asc' }] : [] } }}
          sx={{
            border: 0,
            '& .MuiDataGrid-columnHeaders': { backgroundColor: 'primary.main', color: 'black', fontWeight: 'bold' },
            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none!important' },
            '& .MuiDataGrid-row': { cursor: 'pointer' },
            '& .MuiDataGrid-overlay': { backgroundColor: 'rgba(255,255,255,0.7)' }
          }}
          slots={{
            noRowsOverlay: () => (
              <Box sx={{ mt: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', p: 2 }}>
                <InfoIcon color="action" sx={{ mb: 1, fontSize: '3rem' }} />
                <Typography align="center">
                  {(cursosData.length === 0 && originalHeaders.length === 0)
                    ? "No hay datos de cronograma disponibles."
                    : "No hay cursos que coincidan con los filtros seleccionados."}
                </Typography>
              </Box>
            )
          }}
        />
      </Paper>

      <Modal open={modalOpen} onClose={handleCloseModal} aria-labelledby="course-detail-title">
        <Box sx={modalStyle}>
          {selectedRowData && (
            <Card sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
              <CardHeader
                avatar={<InfoIcon color="primary" />}
                id="course-detail-title"
                title={selectedRowData["Nombre del curso"] || "Detalle del Curso"}
                titleTypographyProps={{ variant: 'h6', fontWeight: 'bold', color: 'text.primary' }}
                subheader={selectedRowData["Código del curso"] || ''}
                subheaderTypographyProps={{ color: 'text.secondary' }}
                action={<IconButton aria-label="Cerrar" onClick={handleCloseModal}><CloseIcon /></IconButton>}
                sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, bgcolor: 'grey.100' }}
              />
              <CardContent sx={{ overflowY: 'auto', flexGrow: 1, p: 2 }}>
                <List dense>
                  {originalHeaders
                    .filter(h => h !== 'id' && selectedRowData[h] != null && selectedRowData[h] !== '')
                    .map((h, index, arr) => (
                      <React.Fragment key={h}>
                        <ListItem sx={{ py: 0.8, px: 0 }}>
                          <ListItemText
                            primary={selectedRowData[h]}
                            secondary={h}
                            primaryTypographyProps={{ fontWeight: 500, color: 'text.primary', wordBreak: 'break-word' }}
                            secondaryTypographyProps={{ fontSize: '0.8rem', color: 'text.secondary' }} />
                        </ListItem>
                        {index < arr.length - 1 && (<Divider component="li" sx={{ my: 0.5 }} />)}
                      </React.Fragment>
                    ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default Cronograma;