import React, { useEffect, useState, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
// Asegúrate que la ruta y exportación sean correctas
import { getCronograma, getObjNroEventos } from "../services/googleSheets.service.js";
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
    const d = dayjs(trimmedDateStr, format, true); // 'true' for strict parsing
    if (d.isValid()) {
      return d;
    }
  }
  console.warn(`Could not parse date: "${dateString}" with formats: ${DATE_FORMATS_TO_TRY.join(', ')}`);
  return null; // Return null if no format matches
};

const Cronograma = () => {
  const [cursosData, setCursosData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [originalHeaders, setOriginalHeaders] = useState([]); // Sigue siendo útil para el modal si se quiere mostrar TODO
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);

  const [ministerioOptions, setMinisterioOptions] = useState([]);
  const [areaOptions, setAreaOptions] = useState(['all']);
  const [ministerioFilter, setMinisterioFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [nombreFilter, setNombreFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('all'); // Filtro por Mes Inicio Curso
  const [activosFilterActive, setActivosFilterActive] = useState(false);

  // 1. Definir el orden de las columnas visibles deseadas
  const COLUMNAS_VISIBLES_ORDENADAS = useMemo(() => [
    "Mes", // Nueva
    "Nombre del curso",
    "Código del curso",
    "Nro Evento", // Nueva
    "Fecha inicio de inscripción",
    "Fecha fin de inscripción",
    "Fecha inicio del curso",
    "Fecha fin del curso",
    // --- Columnas que NO se mostrarán en el grid pero pueden estar en los datos ---
    // "Ministerio", // Se usa para filtrar, no se muestra según el orden pedido
    // "Area",       // Se usa para filtrar, no se muestra según el orden pedido
  ], []);

  // 2. Generar las columnas para el DataGrid basándose en el orden definido
  const columnsForGrid = useMemo(() => {
    // Asegurarse que originalHeaders tenga algo, aunque ahora nos basamos en COLUMNAS_VISIBLES_ORDENADAS
    if (!originalHeaders.length && !cursosData.length) return [];

    // Mapear sobre el orden deseado
    return COLUMNAS_VISIBLES_ORDENADAS.map(header => {
      let flex = 1;
      let minWidth = 130;
      let headerAlign = 'left';
      let align = 'left';

      if (header === "Nombre del curso") { flex = 2.5; minWidth = 350; }
      if (header === "Mes") { flex = 0.8; minWidth = 90; }
      if (header === "Código del curso") { flex = 1; minWidth = 120; }
      if (header === "Nro Evento") { flex = 0.8; minWidth = 100; headerAlign='center'; align='center';}
      if (header.toLowerCase().includes("fecha")) {
        flex = 1.2; minWidth = 140;
        headerAlign = 'center';
        align = 'center'; // Centrar fechas
      }
      // Si la columna existe en originalHeaders o fue añadida (Mes, Nro Evento)
      // Esta comprobación es menos necesaria si confiamos en COLUMNAS_VISIBLES_ORDENADAS
      // if (originalHeaders.includes(header) || ["Mes", "Nro Evento"].includes(header)) {
        return {
            field: header,
            headerName: header,
            flex,
            minWidth,
            headerAlign,
            align
        };
      // }
      // return null; // O manejar de otra forma si una columna definida no existe en los datos
    }).filter(Boolean); // Filtrar nulls si se añade la comprobación anterior
  }, [originalHeaders, cursosData.length, COLUMNAS_VISIBLES_ORDENADAS]); // Depender de cursosData.length para re-evaluar si los datos llegan después

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch de ambos datos en paralelo
        const [dataCronograma, eventosData] = await Promise.all([
          getCronograma(),
          getObjNroEventos() // Fetch Nro Eventos
        ]);

        // Validar dataCronograma
        if (!dataCronograma || dataCronograma.length < 2) {
          throw new Error("No se recibieron datos válidos del cronograma.");
        }
        const headers = dataCronograma[0].map(h => h.trim());
        setOriginalHeaders(headers); // Guardar headers originales

        // Validar y procesar eventosData para crear un lookup eficiente
        const eventosLookup = new Map();
        const eventosLookupByName = new Map();
        if (eventosData && Array.isArray(eventosData)) {
           eventosData.forEach(evento => {
             const nombreCorto = evento["Nombre corto"]?.trim();
             const nombreCapacitacion = evento["Nombre de la capacitación"]?.trim();
             const nroEvento = evento["Nro Evento"]?.toString().trim(); // Asegurar que sea string

             if (nombreCorto && nroEvento) {
                // Si ya existe, podría indicar duplicados o variaciones. Por ahora, sobrescribe.
                eventosLookup.set(nombreCorto, nroEvento);
             }
             if (nombreCapacitacion && nroEvento) {
                 // Guardar también por nombre completo, puede sobrescribir si hay duplicados
                 eventosLookupByName.set(nombreCapacitacion.toLowerCase(), nroEvento);
             }
           });
        } else {
            console.warn("No se recibieron datos válidos de Nro Eventos o el formato es incorrecto.");
        }


        const minSet = new Set();
        const dataObjs = dataCronograma.slice(1).map((row, idx) => {
          const obj = { id: idx }; // ID único para DataGrid

          // Poblar objeto con datos del cronograma
          headers.forEach((h, i) => {
            const val = row[i] != null ? String(row[i]).trim() : '';
            obj[h] = val;
            if (h === "Ministerio" && val) minSet.add(val);
          });

          // --- Procesamiento Adicional ---

          // 1. Calcular Mes
          const fechaInscripcionStr = obj["Fecha inicio de inscripción"];
          const parsedDateInscripcion = parseDate(fechaInscripcionStr);
          obj["Mes"] = parsedDateInscripcion ? MONTH_NAMES[parsedDateInscripcion.month()] : "N/A";

          // 2. Encontrar Nro Evento
          const codigoCurso = obj["Código del curso"]?.trim();
          const nombreCurso = obj["Nombre del curso"]?.trim().toLowerCase();
          let nroEventoEncontrado = "Sin coincidencia"; // Valor por defecto

          if (codigoCurso && eventosLookup.has(codigoCurso)) {
            nroEventoEncontrado = eventosLookup.get(codigoCurso);
          } else if (nombreCurso && eventosLookupByName.has(nombreCurso)) {
            nroEventoEncontrado = eventosLookupByName.get(nombreCurso);
          }
          obj["Nro Evento"] = nroEventoEncontrado;

          // --- Fin Procesamiento Adicional ---

          return obj;
        });

        setCursosData(dataObjs);
        setFilteredData(dataObjs); // Inicialmente mostrar todos
        setMinisterioOptions(['all', ...Array.from(minSet).sort()]);

      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message || "Error al cargar datos.");
      } finally {
        setLoading(false);
      }
    })();
  }, []); // Ejecutar solo una vez al montar

  // Efecto para actualizar opciones de Área (sin cambios)
  useEffect(() => {
    if (loading || !cursosData.length) {
      setAreaOptions(['all']);
      if (areaFilter !== 'all') setAreaFilter('all');
      return;
    }

    let relevantCourses = [];
    if (ministerioFilter === 'all') {
      relevantCourses = cursosData;
      // Si se cambia a 'Todos' ministerios, resetear area si no es 'Todas'
      // Esto ya no es estrictamente necesario si el Select de Area se deshabilita
      // if (areaFilter !== 'all') setAreaFilter('all');
    } else {
      relevantCourses = cursosData.filter(c => c["Ministerio"] === ministerioFilter);
    }

    const areasSet = new Set(relevantCourses.map(c => c.Area).filter(Boolean));
    const newAreaOptions = ['all', ...Array.from(areasSet).sort()];
    setAreaOptions(newAreaOptions);

    // Si el area seleccionada ya no es válida para el ministerio actual, resetearla
    if (ministerioFilter !== 'all' && !newAreaOptions.includes(areaFilter)) {
      setAreaFilter('all');
    }

  }, [ministerioFilter, cursosData, loading, areaFilter]);


  // Efecto para aplicar filtros (sin cambios en la lógica central de filtrado)
  useEffect(() => {
    if (!cursosData.length || loading) return; // No filtrar si no hay datos o si está cargando inicialmente

    // Indicar carga durante el filtrado si hay muchos datos
    // (Considerar añadir un estado loadingFilters si es necesario)
    // setLoading(true); // Podría parpadear mucho, evaluar necesidad

    let data = [...cursosData];
    const today = dayjs().startOf('day');

    if (ministerioFilter !== 'all') {
      data = data.filter(c => c["Ministerio"] === ministerioFilter);
    }
    // Aplicar filtro de área solo si un ministerio está seleccionado
    if (ministerioFilter !== 'all' && areaFilter !== 'all') {
      data = data.filter(c => c["Area"] === areaFilter);
    }
    if (nombreFilter.trim()) {
      const term = nombreFilter.trim().toLowerCase();
      data = data.filter(c => c["Nombre del curso"]?.toLowerCase().includes(term));
    }
    // Filtro por Mes de Inicio del CURSO (no de inscripción)
    if (monthFilter !== 'all') {
      const targetMonth = parseInt(monthFilter, 10);
      data = data.filter(c => {
        const fechaInicioStr = c["Fecha inicio del curso"];
        const parsedDate = parseDate(fechaInicioStr);
        // Asegurarse que parsedDate no sea null y el mes coincida
        return parsedDate && parsedDate.month() === targetMonth;
      });
    }

    if (activosFilterActive) {
      data = data.filter(c => {
        const startDateStr = c["Fecha inicio del curso"];
        const endDateStr = c["Fecha fin del curso"];

        const startDate = parseDate(startDateStr);
        const endDate = parseDate(endDateStr);

        // El curso está activo si hoy está entre la fecha de inicio y fin (inclusive)
        // y ambas fechas son válidas
        return startDate && endDate && startDate.isSameOrBefore(today) && endDate.isSameOrAfter(today);
      });
    }

    setFilteredData(data);
    // setLoading(false); // Si se activó el loading para filtros

  }, [cursosData, ministerioFilter, areaFilter, nombreFilter, monthFilter, activosFilterActive, loading]); // Añadir loading como dependencia para evitar filtrar durante carga inicial

  const handleRowClick = useCallback(params => {
      // Buscamos la fila completa en cursosData por si filteredData omitiera columnas
      const fullRow = cursosData.find(c => c.id === params.row.id);
      setSelectedRowData(fullRow || params.row); // Usar fullRow si se encontró
      setModalOpen(true);
  }, [cursosData]); // Depender de cursosData por si cambia

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedRowData(null);
  }, []);

  const handleDescargarExcel = useCallback(async () => {
    if (!filteredData.length) return;
    setLoading(true); // Indicar carga para la descarga
    try {
      // Usar los headers definidos y ordenados en columnsForGrid
      const headersVis = columnsForGrid.map(c => c.headerName);
      const dataToExport = filteredData.map(row => {
        const exportedRow = {};
        headersVis.forEach(header => {
          // Usar el 'field' de la columna para obtener el dato correcto de la fila
          const columnDef = columnsForGrid.find(c => c.headerName === header);
          if (columnDef) {
              exportedRow[header] = row[columnDef.field] ?? ''; // Usar field para mapeo
          } else {
              exportedRow[header] = row[header] ?? ''; // Fallback por si acaso
          }
        });
        return exportedRow;
      });
      await descargarExcel(dataToExport, headersVis, "Cronograma_Filtrado");
    } catch (e) {
      console.error("Error generating Excel:", e);
      setError("Error al generar el Excel."); // Mostrar error al usuario
    } finally {
      setLoading(false);
    }
  }, [filteredData, columnsForGrid]); // Depender de filteredData y columnsForGrid

  // --- Handlers de Filtros (sin cambios funcionales) ---
  const handleMinisterioChange = useCallback(e => {
    setMinisterioFilter(e.target.value);
    // Resetear área si se selecciona un ministerio específico y el área no es 'Todas'
    // if (e.target.value !== 'all' && areaFilter !== 'all') {
    //   setAreaFilter('all'); // El useEffect [ministerioFilter] ya maneja esto
    // }
     // Si se selecciona "Todos" los ministerios, resetear área para evitar inconsistencias
     if (e.target.value === 'all') {
        setAreaFilter('all');
     }
  }, []);

  const handleAreaChange = useCallback(e => setAreaFilter(e.target.value), []);
  const handleNombreChange = useCallback(e => setNombreFilter(e.target.value), []);
  const handleMonthChange = useCallback(e => setMonthFilter(e.target.value), []);
  const handleToggleActivosFilter = useCallback(() => setActivosFilterActive(prev => !prev), []);

  const handleClearFilters = useCallback(() => {
    setNombreFilter('');
    setMinisterioFilter('all');
    setAreaFilter('all'); // Asegurarse que area también se limpie
    setMonthFilter('all');
    setActivosFilterActive(false);
  }, []);

  const isFilterActive = useMemo(() => {
    return nombreFilter.trim() !== '' || ministerioFilter !== 'all' || areaFilter !== 'all' || monthFilter !== 'all' || activosFilterActive;
  }, [nombreFilter, ministerioFilter, areaFilter, monthFilter, activosFilterActive]);


  // --- Renderizado ---

  // Estado de carga inicial (antes de tener datos)
  if (loading && !cursosData.length) {
    return (
      <Backdrop open sx={{ zIndex: t => t.zIndex.drawer + 1, color: '#fff' }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  // Estado de error
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', p: 3 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>Error</Typography>
          <Typography>{error}</Typography>
          {/* Podría añadirse un botón para reintentar */}
        </Paper>
      </Box>
    );
  }

  // Estado sin datos (después de intentar cargar)
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
      {/* --- Cabecera y Botón Descargar --- */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Titulo texto="Versión reducida para Gestión Académica" />
        <BotonCircular
          icon="descargar"
          onClick={handleDescargarExcel}
          tooltip="Descargar Vista Actual (Excel)"
          disabled={loading || !filteredData.length} // Deshabilitar si carga o no hay datos filtrados
        />
      </Box>
      <Divider sx={{ mb: 3, borderBottomWidth: 2 }} />

      {/* --- Controles de Filtro --- */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Nombre */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="Buscar por Nombre" variant="outlined" size="small"
              value={nombreFilter} onChange={handleNombreChange} disabled={loading}
              InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>), }}
            />
          </Grid>
          {/* Ministerio */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small" variant="outlined" disabled={loading || ministerioOptions.length <= 1}>
              <InputLabel id="ministerio-filter-label">Ministerio</InputLabel>
              <Select labelId="ministerio-filter-label" id="select-ministerio" value={ministerioFilter} label="Ministerio"
                onChange={handleMinisterioChange}
                startAdornment={<InputAdornment position="start" sx={{ ml: '-6px', mr: '4px' }}><AccountBalanceIcon color="action" fontSize='small' /></InputAdornment>}
                sx={{ '& .MuiSelect-select': { pl: 1 } }}
              >
                <MenuItem value="all"><em>Todos</em></MenuItem>
                {ministerioOptions.filter(opt => opt !== 'all').map((opt, i) => (<MenuItem key={i} value={opt}>{opt}</MenuItem>))}
              </Select>
            </FormControl>
          </Grid>
          {/* Área */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small" variant="outlined"
              // Deshabilitar si carga, si no hay ministerio seleccionado, o si no hay opciones de área (aparte de 'all')
              disabled={loading || ministerioFilter === 'all' || areaOptions.length <= 1}
            >
              <InputLabel id="area-filter-label">Área</InputLabel>
              <Select labelId="area-filter-label" id="select-area" value={areaFilter} label="Área"
                onChange={handleAreaChange}
                startAdornment={<InputAdornment position="start" sx={{ ml: '-6px', mr: '4px' }}><FolderSpecialIcon color="action" fontSize='small' /></InputAdornment>}
                sx={{ '& .MuiSelect-select': { pl: 1 } }}
              >
                <MenuItem value="all"><em>Todas</em></MenuItem>
                {areaOptions.filter(opt => opt !== 'all').map((opt, i) => (<MenuItem key={i} value={opt}>{opt}</MenuItem>))}
                {/* Mensaje si no hay áreas disponibles para el ministerio seleccionado */}
                {ministerioFilter !== 'all' && areaOptions.length <= 1 && (
                  <MenuItem value="all" disabled><em>(Sin áreas)</em></MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
          {/* Mes Inicio Curso */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small" variant="outlined" disabled={loading}>
              <InputLabel id="mes-filter-label">Mes Inicio Curso</InputLabel>
              <Select labelId="mes-filter-label" id="select-month" value={monthFilter} label="Mes Inicio Curso"
                onChange={handleMonthChange}
                startAdornment={<InputAdornment position="start" sx={{ ml: '-6px', mr: '4px' }}><CalendarMonthIcon color="action" fontSize='small' /></InputAdornment>}
                sx={{ '& .MuiSelect-select': { pl: 1 } }}
              >
                <MenuItem value="all"><em>Todos</em></MenuItem>
                {MONTH_NAMES.map((m, i) => (<MenuItem key={i} value={i.toString()}>{m}</MenuItem>))}
              </Select>
            </FormControl>
          </Grid>
          {/* Botón Activos */}
          <Grid item xs={12} sm={6} md={1.5} sx={{ display: 'flex' }}>
            <Tooltip title={activosFilterActive ? "Mostrar todos los cursos" : "Mostrar solo cursos activos ahora"}>
              <span> {/* Span para Tooltip cuando el botón está disabled */}
                <Button fullWidth variant={activosFilterActive ? "contained" : "outlined"} size="medium"
                  onClick={handleToggleActivosFilter} disabled={loading} startIcon={<AccessTimeIcon />}
                  sx={{ height: '40px', minWidth: 'auto' }}
                >
                  Activos
                </Button>
              </span>
            </Tooltip>
          </Grid>
          {/* Botón Limpiar */}
          <Grid item xs={12} sm={6} md={1.5} sx={{ display: 'flex' }}>
             <Tooltip title="Limpiar todos los filtros">
               <span> {/* Span para Tooltip cuando el botón está disabled */}
                 <Button fullWidth variant="outlined" size="medium" onClick={handleClearFilters}
                   disabled={!isFilterActive || loading} // Deshabilitar si no hay filtros activos o si está cargando
                   startIcon={<ClearAllIcon />} sx={{ height: '40px', minWidth: 'auto' }}
                 >
                   Limpiar
                 </Button>
               </span>
             </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      {/* --- Indicador de Carga durante Filtrado (Opcional) --- */}
      {loading && cursosData.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2, alignItems: 'center' }}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">Actualizando tabla...</Typography>
        </Box>
      )} 

      {/* --- DataGrid --- */}
      <Paper elevation={3} sx={{ height: 650, width: '100%' }}> {/* Aumenté un poco la altura */}
        <DataGrid
          rows={filteredData}
          columns={columnsForGrid}
          localeText={esES.components.MuiDataGrid.defaultProps.localeText}
          onRowClick={handleRowClick}
          getRowId={r => r.id} // Usar el id generado
          loading={loading && cursosData.length > 0} // Mostrar overlay de carga si está cargando Y ya hay datos previos
          density="compact"
          disableRowSelectionOnClick
          // 3. Establecer ordenación inicial
          initialState={{
            sorting: {
                // Ordenar por 'Fecha inicio de inscripción' si la columna existe
                sortModel: columnsForGrid.some(c => c.field === 'Fecha inicio de inscripción')
                           ? [{ field: 'Fecha inicio de inscripción', sort: 'asc' }]
                           : [],
            },
            pagination: { paginationModel: { pageSize: 100 } }, // Opcional: Mostrar más filas por página
          }}
          pageSizeOptions={[10, 25, 50, 100]} // Opcional: Opciones de tamaño de página
          sx={{
            border: 0,
            '& .MuiDataGrid-columnHeaders': { backgroundColor: 'primary.light', color: 'text.primary', fontWeight: 'bold' },
            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none!important' },
            '& .MuiDataGrid-row': { cursor: 'pointer' },
            '& .MuiDataGrid-row:hover': { backgroundColor: 'action.hover' },
            '& .MuiDataGrid-overlay': { backgroundColor: 'rgba(255,255,255,0.7)' },
            '& .MuiDataGrid-cell': { // Ajuste para evitar overflow con texto largo
              whiteSpace: 'normal', // Permite que el texto se ajuste
              lineHeight: '1.4',    // Espaciado entre líneas si se ajusta
              py: '8px'             // Padding vertical para celdas compactas
            },
            '& .MuiDataGrid-columnHeader': { // Para headers también
                 whiteSpace: 'normal',
                 lineHeight: '1.4'
            },
          }}
          slots={{
            noRowsOverlay: () => (
              <Box sx={{ mt: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', p: 2 }}>
                <InfoIcon color="action" sx={{ mb: 1, fontSize: '3rem' }} />
                <Typography align="center">
                  {/* Mensaje dinámico */}
                  {!cursosData.length
                    ? "No hay datos de cronograma disponibles."
                    : isFilterActive
                      ? "No hay cursos que coincidan con los filtros seleccionados."
                      : "No se encontraron cursos." // Mensaje genérico si no hay filtros pero tampoco datos
                  }
                </Typography>
              </Box>
            )
          }}
        />
      </Paper>

      {/* --- Modal de Detalles --- */}
      <Modal open={modalOpen} onClose={handleCloseModal} aria-labelledby="course-detail-title">
        <Box sx={modalStyle}>
          {selectedRowData && (
            <Card sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
              <CardHeader
                avatar={<InfoIcon color="primary" />}
                id="course-detail-title"
                title={selectedRowData["Nombre del curso"] || "Detalle del Curso"}
                titleTypographyProps={{ variant: 'h6', fontWeight: 'bold', color: 'text.primary' }}
                subheader={selectedRowData["Código del curso"] || ''} // Mostrar código como subheader
                subheaderTypographyProps={{ color: 'text.secondary' }}
                action={<IconButton aria-label="Cerrar" onClick={handleCloseModal}><CloseIcon /></IconButton>}
                sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, bgcolor: 'grey.100' }}
              />
              <CardContent sx={{ overflowY: 'auto', flexGrow: 1, p: 2 }}>
                <List dense>
                  {/* Mostrar todos los campos de la fila seleccionada (excepto id) */}
                  {Object.entries(selectedRowData)
                    .filter(([key, value]) => key !== 'id' && value != null && value !== '') // Filtrar id y valores vacíos/nulos
                    .map(([key, value], index, arr) => (
                      <React.Fragment key={key}>
                        <ListItem sx={{ py: 0.8, px: 0 }}>
                          <ListItemText
                            primary={String(value)} // Asegurar que sea string
                            secondary={key} // Usar la clave como etiqueta
                            primaryTypographyProps={{ fontWeight: 500, color: 'text.primary', wordBreak: 'break-word' }}
                            secondaryTypographyProps={{ fontSize: '0.8rem', color: 'text.secondary' }}
                          />
                        </ListItem>
                        {index < arr.length - 1 && <Divider component="li" sx={{ my: 0.5 }} />}
                      </React.Fragment>
                    ))}
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