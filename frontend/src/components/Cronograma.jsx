import React, { useEffect, useState, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
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
import { getInstancias } from "../services/instancias.service.js"

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
  // console.warn(`Could not parse date: "${dateString}" with formats: ${DATE_FORMATS_TO_TRY.join(', ')}`);
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

  // Defines which columns are visible in the DataGrid.
  // These names must match the keys in the processed data objects.
  const COLUMNAS_VISIBLES = useMemo(() => [
    "Ministerio", "Area", "Nombre del curso",
    "Fecha inicio de inscripción", "Fecha fin de inscripción",
    "Fecha inicio del curso", "Fecha fin del curso", "Estado de Instancia"
  ], []);

  // Generates column definitions for DataGrid based on visible columns
  const columnsForGrid = useMemo(() => {
    if (!originalHeaders.length) return []; // originalHeaders now stores the keys of processed data
    return originalHeaders
      .filter(h_key => COLUMNAS_VISIBLES.includes(h_key))
      .map(headerKey => {
        let flex = 1;
        if (headerKey === "Nombre del curso") flex = 2.5;
        if (headerKey === "Ministerio" || headerKey === "Area") flex = 1.5;
        if (headerKey.toLowerCase().includes("fecha")) flex = 1.2;
        return { field: headerKey, headerName: headerKey, flex, minWidth: 130 };
      });
  }, [originalHeaders, COLUMNAS_VISIBLES]);


  const formatValue = useCallback((value) => {
    if (value == null) return ''; // Handles null and undefined
    return String(value).trim();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const rawDataCronograma = await getInstancias(); // New data format
        console.log("Nuevos Datos del cronograma:", rawDataCronograma);
        
        // Define all possible headers/keys we want to extract and use.
        // This list will be used for the modal and Excel export.
        const allDesiredHeaders = [
          "Código del curso", "Nombre del curso", "Ministerio", "Area",
          "Fecha inicio del curso", "Fecha fin del curso",
          "Fecha inicio de inscripción", "Fecha fin de inscripción",
          "Cupo", "Cantidad de horas", "Publica PCC", "Es Autogestionado", 
          "Restricción por correlatividad", "Restricción por edad", "Restricción por departamento",
          "Estado de Instancia", "Medio de inscripción", "Plataforma de dictado", 
          "Tipo de capacitación", "Comentario", "Datos de solicitud",
          "Cantidad de inscriptos"
          // Add more here if needed from the source for modal/excel
        ];
        setOriginalHeaders(allDesiredHeaders);

        const minSet = new Set();
        const dataObjs = rawDataCronograma.map((instance, idx) => {
          const detalle = instance.detalle_curso || {};
          const areaDetalle = detalle.detalle_area || {};
          const ministerioDetalle = areaDetalle.detalle_ministerio || {};
          const medioInscripcionDetalle = detalle.detalle_medioInscripcion || {};
          const plataformaDictadoDetalle = detalle.detalle_plataformaDictado || {};
          const tipoCapacitacionDetalle = detalle.detalle_tipoCapacitacion || {};

          const obj = {
            id: idx, // Consider a more robust unique ID if available from 'instance'
            "Código del curso": formatValue(instance.curso || detalle.cod),
            "Nombre del curso": formatValue(detalle.nombre),
            "Ministerio": formatValue(ministerioDetalle.nombre),
            "Area": formatValue(areaDetalle.nombre),
            "Fecha inicio del curso": formatValue(instance.fecha_inicio_curso),
            "Fecha fin del curso": formatValue(instance.fecha_fin_curso),
            "Fecha inicio de inscripción": formatValue(instance.fecha_inicio_inscripcion),
            "Fecha fin de inscripción": formatValue(instance.fecha_fin_inscripcion),
            "Cupo": formatValue(instance.cupo), // Instance-specific cupo
            "Cantidad de horas": formatValue(detalle.cantidad_horas),
            "Publica PCC": formatValue(instance.es_publicada_portal_cc ?? detalle.publica_pcc),
            "Es Autogestionado": formatValue(instance.es_autogestionado ?? detalle.es_autogestionado),
            "Restricción por correlatividad": formatValue(instance.tiene_correlatividad ?? detalle.tiene_correlatividad),
            "Restricción por edad": formatValue(instance.tiene_restriccion_edad ?? detalle.tiene_restriccion_edad),
            "Restricción por departamento": formatValue(instance.tiene_restriccion_departamento ?? detalle.tiene_restriccion_departamento),
            "Estado de Instancia": formatValue(instance.estado_instancia),
            "Medio de inscripción": formatValue(medioInscripcionDetalle.nombre || instance.medio_inscripcion),
            "Plataforma de dictado": formatValue(plataformaDictadoDetalle.nombre || instance.plataforma_dictado),
            "Tipo de capacitación": formatValue(tipoCapacitacionDetalle.nombre || instance.tipo_capacitacion),
            "Comentario": formatValue(instance.comentario),
            "Datos de solicitud": formatValue(instance.datos_solictud),
            "Cantidad de inscriptos": instance.cantidad_inscriptos || 0
          };
          
          if (obj["Ministerio"]) {
            minSet.add(obj["Ministerio"]);
          }
          return obj;
        });

        setCursosData(dataObjs);
        setFilteredData(dataObjs);
        setMinisterioOptions(['all', ...Array.from(minSet).sort((a,b) => a.localeCompare(b))]);
      } catch (err) {
        
        setError(err.message || "Error al cargar datos.");
      } finally {
        setLoading(false);
      }
    })();
  }, [formatValue]); // formatValue is stable due to useCallback

  useEffect(() => {
    if (loading || !cursosData.length) {
      setAreaOptions(['all']);
      if (areaFilter !== 'all') setAreaFilter('all');
      return;
    }

    let relevantCourses = [];
    if (ministerioFilter === 'all') {
      relevantCourses = cursosData;
      // if (areaFilter !== 'all') setAreaFilter('all'); // Removed to allow independent area filter if ministerio is 'all'
    } else {
      relevantCourses = cursosData.filter(c => c["Ministerio"] === ministerioFilter);
    }
    
    const areasSet = new Set(relevantCourses.map(c => c["Area"]).filter(Boolean));
    const newAreaOptions = ['all', ...Array.from(areasSet).sort((a,b) => a.localeCompare(b))];
    setAreaOptions(newAreaOptions);

    // If selected area is no longer valid for the current ministerio, reset area
    if (ministerioFilter !== 'all' && !newAreaOptions.includes(areaFilter)) {
      setAreaFilter('all');
    }

  }, [ministerioFilter, cursosData, loading, areaFilter]);


  useEffect(() => {
    if (!cursosData.length && !loading) return; // Don't filter if no data or initial load is not finished

    // setLoading(true); // Setting loading here can cause flicker if filtering is fast
    let data = [...cursosData];
    const today = dayjs().startOf('day');

    if (ministerioFilter !== 'all') {
      data = data.filter(c => c["Ministerio"] === ministerioFilter);
    }
    // Area filter should apply regardless of ministerio, or only if a ministerio is selected.
    // Current logic: if a ministerio is selected, area is filtered within that. If ministerio is 'all', area filter still applies to all.
    if (areaFilter !== 'all') {
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
        
        // Ensure both dates are valid before comparison
        return startDate && endDate && startDate.isSameOrBefore(today) && endDate.isSameOrAfter(today);
      });
    }

    setFilteredData(data);
    // setLoading(false);
  }, [cursosData, ministerioFilter, areaFilter, nombreFilter, monthFilter, activosFilterActive, loading]);

  const handleRowClick = params => {
    // params.row contains the data for the clicked row, matching structure in filteredData
    // If originalHeaders contained more fields than COLUMNAS_VISIBLES,
    // and those extra fields were in cursosData, this would get them.
    // Since our cursosData objects already have all desired fields, params.row is sufficient.
    
    setSelectedRowData(params.row);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRowData(null);
  };

  const handleDescargarExcel = async () => {
    if (!filteredData.length) return;
    setLoading(true); // Indicate activity
    try {
      // originalHeaders contains the list of all field keys we defined
      const dataToExport = filteredData.map(row => {
        const exportedRow = {};
        originalHeaders.forEach(headerKey => {
          exportedRow[headerKey] = row[headerKey] ?? ''; // Use headerKey to access property
        });
        return exportedRow;
      });
      // Pass originalHeaders as the actual headers for the Excel file
      await descargarExcelCronograma(dataToExport, originalHeaders, "Cronograma_Filtrado");
    } catch (e) {
      console.error("Error generating Excel:", e);
      setError("Error al generar el Excel."); // Show error to user
    } finally {
      setLoading(false);
    }
  };

  const handleMinisterioChange = e => {
    setMinisterioFilter(e.target.value);
    // If ministerio changes, area filter might need to be reset or re-evaluated
    // The useEffect for areaOptions handles resetting area if it becomes invalid.
    // If we want to always reset area when ministerio changes (unless ministerio is 'all'):
    if (e.target.value !== 'all') {
       // setAreaFilter('all'); // This line was in original code, re-evaluate if needed.
                              // Current useEffect for areaOptions handles invalid area.
                              // Keeping it commented to allow more flexible area filtering.
    }
  };
  const handleAreaChange = e => setAreaFilter(e.target.value);
  const handleNombreChange = e => setNombreFilter(e.target.value);
  const handleMonthChange = e => setMonthFilter(e.target.value);
  const handleToggleActivosFilter = () => setActivosFilterActive(prev => !prev);

  const handleClearFilters = () => {
    setNombreFilter('');
    setMinisterioFilter('all');
    setAreaFilter('all'); // This will also be reset
    setMonthFilter('all');
    setActivosFilterActive(false);
  };

  const isFilterActive = useMemo(() => {
    return nombreFilter.trim() !== '' || ministerioFilter !== 'all' || areaFilter !== 'all' || monthFilter !== 'all' || activosFilterActive;
  }, [nombreFilter, ministerioFilter, areaFilter, monthFilter, activosFilterActive]);

  // Initial loading screen (only when cursosData is empty)
  if (loading && !cursosData.length && !error) {
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
          <Button onClick={() => window.location.reload()} sx={{ mt: 2 }}>Recargar</Button>
        </Paper>
      </Box>
    );
  }
  
  // No data available after loading (and no error)
  if (!loading && !cursosData.length && !error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', p: 3 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>No Hay Datos</Typography>
          <Typography>No se encontraron datos en el cronograma o no se pudieron cargar.</Typography>
           <Button onClick={() => window.location.reload()} sx={{ mt: 2 }}>Intentar de Nuevo</Button>
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
          disabled={loading || !filteredData.length} // Disable if loading or no data to download
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
              disabled={loading && cursosData.length > 0} // Disable only if filtering/reloading data
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
            <FormControl fullWidth size="small" variant="outlined" disabled={(loading && cursosData.length > 0) || ministerioOptions.length <= 1}>
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
                sx={{ '& .MuiSelect-select': { pl: 1 } }}
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
              disabled={(loading && cursosData.length > 0) || areaOptions.length <= 1} // Disable if no areas or loading
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
                {/* Show (Sin áreas) only if a ministerio is selected and it has no areas */}
                {ministerioFilter !== 'all' && areaOptions.length <= 1 && ( 
                  <MenuItem value="all" disabled><em>(Sin áreas específicas)</em></MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small" variant="outlined" disabled={(loading && cursosData.length > 0)}>
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
                size="medium" // Was large, medium is consistent with TextField height
                onClick={handleToggleActivosFilter}
                disabled={(loading && cursosData.length > 0)}
                startIcon={<AccessTimeIcon />}
                sx={{ height: '40px', minWidth: 'auto' }} 
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
              disabled={!isFilterActive || (loading && cursosData.length > 0)}
              startIcon={<ClearAllIcon />}
              sx={{ height: '40px', minWidth: 'auto' }}
            >
              Limpiar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {(loading && cursosData.length > 0) && ( // Show this only when filtering, not initial load
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
          getRowId={r => r.id} // Make sure 'id' is unique in your dataObjs
          loading={loading && cursosData.length > 0} // Show loading overlay on DataGrid when filtering
          density="compact"
          disableRowSelectionOnClick
          initialState={{
            sorting: { 
              sortModel: originalHeaders.includes('Fecha inicio del curso') ? 
                         [{ field: 'Fecha inicio del curso', sort: 'asc' }] : [] 
            }
          }}
          sx={{
            border: 0,
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'primary.light', // theme.palette.grey[200] or similar for lighter
              color: 'text.primary',
              fontWeight: 'bold'
            },
            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none!important' },
            '& .MuiDataGrid-row': { cursor: 'pointer' },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover', // theme.palette.action.hover
            },
            '& .MuiDataGrid-overlay': { backgroundColor: 'rgba(255,255,255,0.7)' }
          }}
          slots={{
            noRowsOverlay: () => (
              <Box sx={{ mt: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', p: 2 }}>
                <InfoIcon color="action" sx={{ mb: 1, fontSize: '3rem' }} />
                <Typography align="center">
                  {/* Differentiate between no data at all vs. no results from filter */}
                  {cursosData.length === 0 && !loading ? "No hay datos de cronograma disponibles." : "No hay cursos que coincidan con los filtros seleccionados."}
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
                  {originalHeaders // This list contains all defined keys for our data objects
                    .filter(headerKey => 
                        selectedRowData[headerKey] != null && 
                        String(selectedRowData[headerKey]).trim() !== '' &&
                        headerKey !== 'id' // Don't show the internal 'id'
                    )
                    .map((headerKey, index, arr) => {
                      const val = selectedRowData[headerKey];
                      return (
                        <React.Fragment key={headerKey}>
                          <ListItem sx={{ py: 0.8, px: 0 }}>
                            <ListItemText
                              primary={val}
                              secondary={headerKey} // This is the user-friendly header name
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