import React, { useEffect, useState, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { getCronograma } from "../services/googleSheets.service.js";
import { descargarExcelCronograma } from "../services/excel.service.js";
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
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import BotonCircular from "./UIElements/BotonCircular.jsx";
import Titulo from "../components/fonts/TituloPrincipal.jsx";

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

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

const parseDate = (dateString) => {
  if (!dateString || typeof dateString !== 'string' || dateString.trim() === '') {
    return null;
  }
  const trimmedDateStr = dateString.trim();
  for (const format of DATE_FORMATS_TO_TRY) {
    const d = dayjs(trimmedDateStr, format, true);
    if (d.isValid()) {
      return d;
    }
  }
  return null;
};


const Cronograma = () => {
  const [cursosData, setCursosData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [originalHeaders, setOriginalHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);

  const [ministerioOptions, setMinisterioOptions] = useState([]);
  const [areaOptions, setAreaOptions] = useState(['all']);
  const [ministerioFilter, setMinisterioFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [nombreFilter, setNombreFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');
  const [activosFilterActive, setActivosFilterActive] = useState(false);

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

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const dataCronograma = await getCronograma();
        if (!dataCronograma || dataCronograma.length < 2) {
          throw new Error("No se recibieron datos válidos del cronograma.");
        }
        const headers = dataCronograma[0].map(h => h.trim());
        setOriginalHeaders(headers);

        const minSet = new Set();
        const dataObjs = dataCronograma.slice(1).map((row, idx) => {
          const obj = { id: idx };
          headers.forEach((h, i) => {
            const val = row[i] != null ? String(row[i]).trim() : '';
            obj[h] = val;
            if (h === "Ministerio" && val) minSet.add(val);
          });
          return obj;
        });

        setCursosData(dataObjs);
        setFilteredData(dataObjs);
        setMinisterioOptions(['all', ...Array.from(minSet).sort()]);
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message || "Error al cargar datos.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (loading || !cursosData.length) {
      setAreaOptions(['all']);
      if (areaFilter !== 'all') setAreaFilter('all');
      return;
    }

    let relevantCourses = [];
    if (ministerioFilter === 'all') {
      relevantCourses = cursosData;
      if (areaFilter !== 'all') setAreaFilter('all');
    } else {
      relevantCourses = cursosData.filter(c => c["Ministerio"] === ministerioFilter);
    }

    const areasSet = new Set(relevantCourses.map(c => c.Area).filter(Boolean));
    const newAreaOptions = ['all', ...Array.from(areasSet).sort()];
    setAreaOptions(newAreaOptions);

    if (ministerioFilter !== 'all' && !newAreaOptions.includes(areaFilter)) {
      setAreaFilter('all');
    }

  }, [ministerioFilter, cursosData, loading, areaFilter]);


  useEffect(() => {
    if (!cursosData.length) return;

    setLoading(true);
    let data = [...cursosData];
    const today = dayjs().startOf('day');

    if (ministerioFilter !== 'all') {
      data = data.filter(c => c["Ministerio"] === ministerioFilter);
    }
    if (ministerioFilter !== 'all' && areaFilter !== 'all') {
      data = data.filter(c => c["Area"] === areaFilter);
    }
    if (nombreFilter.trim()) {
      const term = nombreFilter.trim().toLowerCase();
      data = data.filter(c => c["Nombre del curso"]?.toLowerCase().includes(term));
    }
    if (monthFilter !== 'all') {
      const targetMonth = parseInt(monthFilter, 10);
      data = data.filter(c => {
        const fechaInicioStr = c["Fecha inicio del curso"];
        const parsedDate = parseDate(fechaInicioStr);
        return parsedDate && parsedDate.month() === targetMonth;
      });
    }

    if (activosFilterActive) {
      data = data.filter(c => {
        const startDateStr = c["Fecha inicio del curso"];
        const endDateStr = c["Fecha fin del curso"];

        const startDate = parseDate(startDateStr);
        const endDate = parseDate(endDateStr);

        return startDate && endDate && startDate.isSameOrBefore(today) && endDate.isSameOrAfter(today);
      });
    }

    setFilteredData(data);
    setLoading(false);
  }, [cursosData, ministerioFilter, areaFilter, nombreFilter, monthFilter, activosFilterActive]);

  const handleRowClick = params => {
    const fullRow = cursosData.find(c => c.id === params.row.id);
    setSelectedRowData(fullRow || params.row);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRowData(null);
  };

  const handleDescargarExcel = async () => {
    if (!filteredData.length) return;
    setLoading(true);
    try {
      const dataToExport = filteredData.map(row => {
        const exportedRow = {};
        originalHeaders.forEach(header => {
          exportedRow[header] = row[header] ?? '';
        });
        return exportedRow;
      });
      await descargarExcelCronograma(dataToExport, originalHeaders, "Cronograma_Filtrado");
    } catch (e) {
      console.error("Error generating Excel:", e);
      setError("Error al generar el Excel.");
    } finally {
      setLoading(false);
    }
  };

  const handleMinisterioChange = e => {
    setMinisterioFilter(e.target.value);
    if (e.target.value !== 'all') {
      setAreaFilter('all');
    }
  };
  const handleAreaChange = e => setAreaFilter(e.target.value);
  const handleNombreChange = e => setNombreFilter(e.target.value);
  const handleMonthChange = e => setMonthFilter(e.target.value);
  const handleToggleActivosFilter = () => setActivosFilterActive(prev => !prev);

  const handleClearFilters = () => {
    setNombreFilter('');
    setMinisterioFilter('all');
    setAreaFilter('all');
    setMonthFilter('all');
    setActivosFilterActive(false);
  };

  const isFilterActive = useMemo(() => {
    return nombreFilter.trim() !== '' || ministerioFilter !== 'all' || areaFilter !== 'all' || monthFilter !== 'all' || activosFilterActive;
  }, [nombreFilter, ministerioFilter, areaFilter, monthFilter, activosFilterActive]);


  if (loading && !cursosData.length) {
    return (
      <Backdrop open sx={{ zIndex: t => t.zIndex.drawer + 1, color: '#fff' }}>
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

  if (!loading && !cursosData.length && !error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', p: 3 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>No Hay Datos</Typography>
          <Typography>No se encontraron datos en el cronograma o no se pudieron cargar.</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <div style={{ padding: 20 }}>
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
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Buscar por Nombre"
              variant="outlined"
              size="small"
              value={nombreFilter}
              onChange={handleNombreChange}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small" variant="outlined" disabled={loading || ministerioOptions.length <= 1}>
              <InputLabel id="ministerio-filter-label">Ministerio</InputLabel>
              <Select
                labelId="ministerio-filter-label"
                id="select-ministerio"
                value={ministerioFilter}
                label="Ministerio"
                onChange={handleMinisterioChange}
                startAdornment={
                  <InputAdornment position="start" sx={{ ml: '-6px', mr: '4px' }}>
                    <AccountBalanceIcon color="action" fontSize='small' />
                  </InputAdornment>
                }
                sx={{ '& .MuiSelect-select': { pl: 1 } }} // Adjust padding if icon overlaps text
              >
                <MenuItem value="all"><em>Todos</em></MenuItem>
                {ministerioOptions.filter(opt => opt !== 'all').map((opt, i) => (
                  <MenuItem key={i} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl
              fullWidth
              size="small"
              variant="outlined"
              disabled={loading || ministerioFilter === 'all' || areaOptions.length <= 1}
            >
              <InputLabel id="area-filter-label">Área</InputLabel>
              <Select
                labelId="area-filter-label"
                id="select-area"
                value={areaFilter}
                label="Área"
                onChange={handleAreaChange}
                startAdornment={
                  <InputAdornment position="start" sx={{ ml: '-6px', mr: '4px' }}>
                    <FolderSpecialIcon color="action" fontSize='small' />
                  </InputAdornment>
                }
                sx={{ '& .MuiSelect-select': { pl: 1 } }}
              >
                <MenuItem value="all"><em>Todas</em></MenuItem>
                {areaOptions.filter(opt => opt !== 'all').map((opt, i) => (
                  <MenuItem key={i} value={opt}>{opt}</MenuItem>
                ))}
                {ministerioFilter !== 'all' && areaOptions.length <= 1 && (
                  <MenuItem value="all" disabled><em>(Sin áreas)</em></MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small" variant="outlined" disabled={loading}>
              <InputLabel id="mes-filter-label">Mes Inicio Curso</InputLabel>
              <Select
                labelId="mes-filter-label"
                id="select-month"
                value={monthFilter}
                label="Mes Inicio Curso"
                onChange={handleMonthChange}
                startAdornment={
                  <InputAdornment position="start" sx={{ ml: '-6px', mr: '4px' }}>
                    <CalendarMonthIcon color="action" fontSize='small' />
                  </InputAdornment>
                }
                sx={{ '& .MuiSelect-select': { pl: 1 } }}
              >
                <MenuItem value="all"><em>Todos</em></MenuItem>
                {MONTH_NAMES.map((m, i) => (
                  <MenuItem key={i} value={i.toString()}>{m}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={1.5} sx={{ display: 'flex' }}>
            <Tooltip title={activosFilterActive ? "Mostrar todos los cursos" : "Mostrar solo cursos activos ahora"}>
              <Button
                fullWidth
                variant={activosFilterActive ? "contained" : "outlined"}
                size="medium"
                onClick={handleToggleActivosFilter}
                disabled={loading}
                startIcon={<AccessTimeIcon />}
                sx={{ height: '40px', minWidth: 'auto' }} // Ensure button takes width and height
              >
                Activos
              </Button>
            </Tooltip>
          </Grid>

          <Grid item xs={12} sm={6} md={1.5} sx={{ display: 'flex' }}>
            <Button
              fullWidth
              variant="outlined"
              size="medium"
              onClick={handleClearFilters}
              disabled={!isFilterActive || loading}
              startIcon={<ClearAllIcon />}
              sx={{ height: '40px', minWidth: 'auto' }} // Ensure button takes width and height
            >
              Limpiar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading && cursosData.length > 0 && (
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
          loading={loading && cursosData.length > 0}
          density="compact"
          disableRowSelectionOnClick
          initialState={{
            sorting: { sortModel: originalHeaders.includes('Fecha inicio del curso') ? [{ field: 'Fecha inicio del curso', sort: 'asc' }] : [] }
          }}
          sx={{
            border: 0,
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'primary.light',
              color: 'text.primary',
              fontWeight: 'bold'
            },
            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none!important' },
            '& .MuiDataGrid-row': { cursor: 'pointer' },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover',
            },
            '& .MuiDataGrid-overlay': { backgroundColor: 'rgba(255,255,255,0.7)' }
          }}
          slots={{
            noRowsOverlay: () => (
              <Box sx={{ mt: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', p: 2 }}>
                <InfoIcon color="action" sx={{ mb: 1, fontSize: '3rem' }} />
                <Typography align="center">
                  {cursosData.length === 0 ? "No hay datos de cronograma disponibles." : "No hay cursos que coincidan con los filtros seleccionados."}
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
                    .map((h, index, arr) => {
                      const val = selectedRowData[h];
                      return (
                        <React.Fragment key={h}>
                          <ListItem sx={{ py: 0.8, px: 0 }}>
                            <ListItemText
                              primary={val}
                              secondary={h}
                              primaryTypographyProps={{ fontWeight: 500, color: 'text.primary', wordBreak: 'break-word' }}
                              secondaryTypographyProps={{ fontSize: '0.8rem', color: 'text.secondary' }}
                            />
                          </ListItem>
                          {index < arr.length - 1 && (
                            <Divider component="li" sx={{ my: 0.5 }} />
                          )}
                        </React.Fragment>
                      );
                    })}
                </List>
              </CardContent>
            </Card>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default Cronograma;