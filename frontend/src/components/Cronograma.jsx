import React, { useEffect, useState, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es'; // Importar locale para DatePicker
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { descargarExcelCronograma as descargarExcel } from "../services/excel.service.js";
import { DataGrid } from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import {
  Backdrop, CircularProgress, Box, Typography, Modal, Card, CardContent, CardHeader,
  IconButton, Divider, List, ListItem, ListItemText, Paper, TextField, FormControl,
  InputLabel, Select, MenuItem, Grid, Button, InputAdornment, Tooltip, Chip, Alert
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import BotonCircular from "./UIElements/BotonCircular.jsx";
import Titulo from "../components/fonts/TituloPrincipal.jsx";
import { getInstancias } from "../services/instancias.service.js";

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.locale('es');

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: '80%', maxWidth: 700, bgcolor: 'background.paper',
  borderRadius: 2, boxShadow: 24, p: 0, maxHeight: '90vh', display: 'flex', flexDirection: 'column',
};

const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DATE_FORMATS_TO_TRY = ['DD/MM/YYYY', 'D/M/YYYY', 'DD-MM-YYYY', 'D-M-YYYY', 'YYYY-MM-DD'];

const parseDate = (dateString) => {
  if (!dateString) return null;
  const trimmedDateStr = dateString.trim();
  for (const format of DATE_FORMATS_TO_TRY) {
    const d = dayjs(trimmedDateStr, format, true);
    if (d.isValid()) return d;
  }
  return null;
};

const formatBooleanToSiNo = (value) => {
  if (value === true || value === 1) return 'Sí';
  if (value === false || value === 0) return 'No';
  return 'N/A';
};

// --- ESTILOS PARA LA MAQUETACIÓN DE GRID ---
const gridContainerStyle = {
  display: 'grid',
  gap: '20px',
  padding: '20px',
  gridTemplateColumns: '1fr',
  gridTemplateAreas: `
      "titulo"
      "divider"
      "filtros-cronograma"
      "tabla-cronograma"
    `,
};

const Cronograma = () => {
  const [cursosData, setCursosData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
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

  const COLUMNAS_VISIBLES = useMemo(() => ["Ministerio", "Area", "Nombre del curso", "Fecha inicio de inscripción", "Fecha fin de inscripción", "Fecha inicio del curso", "Fecha fin del curso", "Estado de Instancia"], []);

  const columnsForGrid = useMemo(() => {
    return COLUMNAS_VISIBLES.map(headerKey => {
      let flex = 1;
      let minWidth = 130;
      let valueFormatter = undefined;

      if (headerKey === "Nombre del curso") { flex = 2.5; minWidth = 250; }
      if (headerKey === "Ministerio" || headerKey === "Area") { flex = 1.5; minWidth = 150; }
      if (headerKey.toLowerCase().includes("fecha")) {
        flex = 1.2;
        minWidth = 140;
        valueFormatter = (value) => {
          if (!value) return '';
          const d = dayjs(value);
          return d.isValid() ? d.format('DD/MM/YYYY') : value;
        };
      }
      return { field: headerKey, headerName: headerKey, flex, minWidth, valueFormatter };
    });
  }, [COLUMNAS_VISIBLES]);

  const formatValue = useCallback((value) => (value == null ? '' : String(value).trim()), []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const rawDataCronograma = await getInstancias();
        if (!Array.isArray(rawDataCronograma)) throw new Error("Los datos recibidos no son válidos.");

        const minSet = new Set();
        const dataObjs = rawDataCronograma.map((instance, idx) => {
          const detalle = instance.detalle_curso || {};
          const areaDetalle = detalle.detalle_area || {};
          const ministerioDetalle = areaDetalle.detalle_ministerio || {};
          const medioInscripcionDetalle = detalle.detalle_medioInscripcion || {};
          const plataformaDictadoDetalle = detalle.detalle_plataformaDictado || {};
          const tipoCapacitacionDetalle = detalle.detalle_tipoCapacitacion || {};

          const obj = {
            id: `${instance.curso}-${instance.fecha_inicio_curso}-${idx}`, // ID más robusto
            "Código del curso": formatValue(instance.curso || detalle.cod),
            "Nombre del curso": formatValue(detalle.nombre),
            "Ministerio": formatValue(ministerioDetalle.nombre),
            "Area": formatValue(areaDetalle.nombre),
            "Fecha inicio del curso": formatValue(instance.fecha_inicio_curso),
            "Fecha fin del curso": formatValue(instance.fecha_fin_curso),
            "Fecha inicio de inscripción": formatValue(instance.fecha_inicio_inscripcion),
            "Fecha fin de inscripción": formatValue(instance.fecha_fin_inscripcion),
            "Cupo": formatValue(instance.cupo),
            "Cantidad de horas": formatValue(detalle.cantidad_horas),
            "Publica PCC": instance.es_publicada_portal_cc ?? detalle.publica_pcc,
            "Es Autogestionado": instance.es_autogestionado ?? detalle.es_autogestionado,
            "Estado de Instancia": formatValue(instance.estado_instancia),
            "Medio de inscripción": formatValue(medioInscripcionDetalle.nombre || instance.medio_inscripcion),
            "Plataforma de dictado": formatValue(plataformaDictadoDetalle.nombre || instance.plataforma_dictado),
            "Tipo de capacitación": formatValue(tipoCapacitacionDetalle.nombre || instance.tipo_capacitacion),
            "Comentario": formatValue(instance.comentario),
            "Datos de solicitud": formatValue(instance.datos_solictud),
            "Cantidad de inscriptos": instance.cantidad_inscriptos || 0,
            "Restricciones por Departamento": instance.detalle_restricciones_por_departamento || [],
            "Restricciones por Correlatividad": instance.detalle_restricciones_por_correlatividad || [],
            "Tiene restricción por edad": instance.tiene_restriccion_edad ?? detalle.tiene_restriccion_edad,
            "Edad Desde": instance.restriccion_edad_desde,
            "Edad Desde": instance.restriccion_edad_desde,
            "Edad Hasta": instance.restriccion_edad_hasta,
            _raw: instance // Guardamos la instancia original para el export
          };

          if (obj["Ministerio"]) minSet.add(obj["Ministerio"]);
          return obj;
        });

        setCursosData(dataObjs);
        setMinisterioOptions(['all', ...Array.from(minSet).sort()]);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError(err.message || "Error al cargar datos.");
      } finally {
        setLoading(false);
      }
    })();
  }, [formatValue]);

  useEffect(() => {
    if (loading || !cursosData.length) { setAreaOptions(['all']); if (areaFilter !== 'all') setAreaFilter('all'); return; }
    let relevantCourses = ministerioFilter === 'all' ? cursosData : cursosData.filter(c => c["Ministerio"] === ministerioFilter);
    const areasSet = new Set(relevantCourses.map(c => c["Area"]).filter(Boolean));
    const newAreaOptions = ['all', ...Array.from(areasSet).sort()];
    setAreaOptions(newAreaOptions);
    if (ministerioFilter !== 'all' && !newAreaOptions.includes(areaFilter)) { setAreaFilter('all'); }
  }, [ministerioFilter, cursosData, loading, areaFilter]);

  useEffect(() => {
    if (loading && cursosData.length === 0) return;
    let data = [...cursosData];
    const today = dayjs().startOf('day');
    if (ministerioFilter !== 'all') data = data.filter(c => c["Ministerio"] === ministerioFilter);
    if (areaFilter !== 'all') data = data.filter(c => c["Area"] === areaFilter);
    if (nombreFilter.trim()) {
      const term = nombreFilter.trim().toLowerCase();
      data = data.filter(c => c["Nombre del curso"]?.toLowerCase().includes(term));
    }
    if (monthFilter !== 'all') {
      const targetMonth = parseInt(monthFilter, 10);
      data = data.filter(c => { const parsedDate = parseDate(c["Fecha inicio del curso"]); return parsedDate && parsedDate.month() === targetMonth; });
    }
    if (activosFilterActive) {
      data = data.filter(c => {
        const startDate = parseDate(c["Fecha inicio del curso"]); const endDate = parseDate(c["Fecha fin del curso"]);
        return startDate && endDate && startDate.isSameOrBefore(today) && endDate.isSameOrAfter(today);
      });
    }
    setFilteredData(data);
  }, [cursosData, ministerioFilter, areaFilter, nombreFilter, monthFilter, activosFilterActive, loading]);

  const handleRowClick = useCallback(params => { setSelectedRowData(params.row); setModalOpen(true); }, []);
  const handleCloseModal = useCallback(() => { setModalOpen(false); setSelectedRowData(null); }, []);
  const handleDescargarExcel = useCallback(async () => {
    if (!filteredData.length) return;
    try {
      // Mapeamos los datos filtrados usando la info cruda (_raw) para incluir TODAS las columnas
      const dataParaExcel = filteredData.map(item => {
        const raw = item._raw || {};
        const det = raw.detalle_curso || {};
        const asig = raw.detalle_asignado || {};
        const pers = asig.detalle_persona || {};
        const rol = asig.detalle_rol || {};
        const areaAsig = asig.detalle_area || {};

        return {
          "Curso": raw.curso,
          "Nombre del curso": det.nombre,
          "Area del curso": raw.detalle_curso?.detalle_area?.nombre || "",
          "Ministerio": raw.detalle_curso?.detalle_area?.detalle_ministerio?.nombre || "",
          "Fecha inicio curso": raw.fecha_inicio_curso,
          "Fecha fin curso": raw.fecha_fin_curso,
          "Fecha inicio inscripción": raw.fecha_inicio_inscripcion,
          "Fecha fin inscripción": raw.fecha_fin_inscripcion,
          "Estado Instancia": raw.estado_instancia,
          "Cupo": raw.cupo,
          "Inscriptos": raw.cantidad_inscriptos || 0,
          "Certificados": raw.cantidad_certificados || 0,
          "Cantidad de horas": det.cantidad_horas,
          "Publica en Portal": formatBooleanToSiNo(raw.es_publicada_portal_cc ?? det.publica_pcc),
          "Es Autogestionado": formatBooleanToSiNo(raw.es_autogestionado ?? det.es_autogestionado),
          "Medio de inscripción": det.detalle_medioInscripcion?.nombre || raw.medio_inscripcion,
          "Plataforma de dictado": det.detalle_plataformaDictado?.nombre || raw.plataforma_dictado,
          "Tipo de capacitación": det.detalle_tipoCapacitacion?.nombre || raw.tipo_capacitacion,
          "Tiene correlatividad": formatBooleanToSiNo(raw.tiene_correlatividad),
          "Tiene restricción edad": formatBooleanToSiNo(raw.tiene_restriccion_edad ?? det.tiene_restriccion_edad),
          "Restricción Edad Desde": raw.restriccion_edad_desde,
          "Restricción Edad Hasta": raw.restriccion_edad_hasta,
          "Comentario": raw.comentario,
          // Datos del Asignado (Coordinador/Responsable)
          "Asignado CUIL": asig.cuil,
          "Asignado Nombre": pers.nombre ? `${pers.nombre} ${pers.apellido}` : "",
          "Asignado Mail": pers.mail,
          "Asignado Rol": rol.nombre,
          "Asignado Area": areaAsig.nombre,
        };
      });

      // Definimos las columnas que queremos mostrar en el Excel (el orden importa)
      const COLUMNAS_EXCEL = [
        "Curso", "Nombre del curso", "Area del curso", "Ministerio",
        "Fecha inicio curso", "Fecha fin curso", "Fecha inicio inscripción", "Fecha fin inscripción",
        "Estado Instancia", "Cupo", "Inscriptos", "Certificados", "Cantidad de horas",
        "Publica en Portal", "Es Autogestionado", "Medio de inscripción",
        "Plataforma de dictado", "Tipo de capacitación",
        "Tiene correlatividad", "Tiene restricción edad", "Restricción Edad Desde", "Restricción Edad Hasta",
        "Comentario",
        "Asignado CUIL", "Asignado Nombre", "Asignado Mail", "Asignado Rol", "Asignado Area"
      ];

      await descargarExcel(dataParaExcel, COLUMNAS_EXCEL, "Cronograma_Completo");
    } catch (e) {
      setError("Error al generar el archivo Excel.");
      console.error(e);
    }
  }, [filteredData]);
  const handleMinisterioChange = useCallback(e => setMinisterioFilter(e.target.value), []);
  const handleAreaChange = useCallback(e => setAreaFilter(e.target.value), []);
  const handleNombreChange = useCallback(e => setNombreFilter(e.target.value), []);
  const handleMonthChange = useCallback(e => setMonthFilter(e.target.value), []);
  const handleToggleActivosFilter = useCallback(() => setActivosFilterActive(prev => !prev), []);
  const handleClearFilters = useCallback(() => { setNombreFilter(''); setMinisterioFilter('all'); setAreaFilter('all'); setMonthFilter('all'); setActivosFilterActive(false); }, []);
  const isFilterActive = useMemo(() => nombreFilter.trim() !== '' || ministerioFilter !== 'all' || areaFilter !== 'all' || monthFilter !== 'all' || activosFilterActive, [nombreFilter, ministerioFilter, areaFilter, monthFilter, activosFilterActive]);

  const renderDetailItem = useCallback((label, value, isBoolean = false) => {
    let displayValue;
    if (isBoolean) {
      displayValue = formatBooleanToSiNo(value);
    } else if (label.toLowerCase().includes("inicio") || label.toLowerCase().includes("fin") || label.toLowerCase().includes("fecha")) {
      // Intentamos parsear como fecha si el label sugiere que lo es
      const d = dayjs(value);
      displayValue = (value && d.isValid()) ? d.format('DD/MM/YYYY') : (formatValue(value) || '-');
    } else {
      displayValue = formatValue(value) || '-';
    }

    if (displayValue === '' || displayValue === '-' || value === null) return null;

    return (
      <React.Fragment key={label}>
        <ListItem sx={{ py: 0.8, px: 0 }}>
          <ListItemText primary={displayValue} secondary={label} primaryTypographyProps={{ fontWeight: 500, color: 'text.primary', wordBreak: 'break-word' }} secondaryTypographyProps={{ fontSize: '0.8rem', color: 'text.secondary' }} />
        </ListItem>
        <Divider component="li" sx={{ my: 0.5 }} />
      </React.Fragment>
    );
  }, [formatValue]);

  if (loading && !cursosData.length) return (<Backdrop open sx={{ zIndex: t => t.zIndex.drawer + 1, color: '#fff' }}><CircularProgress color="inherit" /></Backdrop>);
  if (error) return (<Box sx={{ p: 3 }}><Alert severity="error">Error al cargar datos: {error}</Alert></Box>);
  if (!loading && !cursosData.length) return (<Box sx={{ p: 3 }}><Typography>No se encontraron datos en el cronograma.</Typography></Box>);

  return (
    <>
      <div style={gridContainerStyle}>
        <div style={{ gridArea: 'titulo' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Titulo texto="Cronograma" />
            <BotonCircular icon="descargar" onClick={handleDescargarExcel} tooltip="Descargar Vista Actual" disabled={loading || !filteredData.length} />
          </Box>
        </div>

        <div style={{ gridArea: 'divider' }}>
          <Divider sx={{ mb: 1, borderBottomWidth: 2 }} />
        </div>

        <div style={{ gridArea: 'filtros-cronograma' }}>
          <Paper elevation={1} sx={{ p: 2, width: '100%' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Buscar por Nombre" variant="outlined" size="small" value={nombreFilter} onChange={handleNombreChange} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>), }} /></Grid>
              <Grid item xs={12} sm={6} md={2}><FormControl fullWidth size="small" variant="outlined" disabled={ministerioOptions.length <= 1}><InputLabel>Ministerio</InputLabel><Select value={ministerioFilter} label="Ministerio" onChange={handleMinisterioChange}><MenuItem value="all"><em>Todos</em></MenuItem>{ministerioOptions.filter(opt => opt !== 'all').map((opt, i) => (<MenuItem key={i} value={opt}>{opt}</MenuItem>))}</Select></FormControl></Grid>
              <Grid item xs={12} sm={6} md={2}><FormControl fullWidth size="small" variant="outlined" disabled={areaOptions.length <= 1}><InputLabel>Área</InputLabel><Select value={areaFilter} label="Área" onChange={handleAreaChange}><MenuItem value="all"><em>Todas</em></MenuItem>{areaOptions.filter(opt => opt !== 'all').map((opt, i) => (<MenuItem key={i} value={opt}>{opt}</MenuItem>))}{ministerioFilter !== 'all' && areaOptions.length <= 1 && (<MenuItem value="all" disabled><em>(Sin áreas)</em></MenuItem>)}</Select></FormControl></Grid>
              <Grid item xs={12} sm={6} md={2}><FormControl fullWidth size="small" variant="outlined"><InputLabel>Mes Inicio Curso</InputLabel><Select value={monthFilter} label="Mes Inicio Curso" onChange={handleMonthChange}><MenuItem value="all"><em>Todos</em></MenuItem>{MONTH_NAMES.map((m, i) => (<MenuItem key={i} value={i.toString()}>{m}</MenuItem>))}</Select></FormControl></Grid>
              <Grid item xs={12} sm={6} md={1.5} sx={{ display: 'flex' }}><Tooltip title={activosFilterActive ? "Mostrar todos" : "Mostrar solo activos"}><Button fullWidth variant={activosFilterActive ? "contained" : "outlined"} size="medium" onClick={handleToggleActivosFilter} startIcon={<AccessTimeIcon />} sx={{ height: '40px' }}>Activos</Button></Tooltip></Grid>
              <Grid item xs={12} sm={6} md={1.5} sx={{ display: 'flex' }}><Button fullWidth variant="outlined" size="medium" onClick={handleClearFilters} disabled={!isFilterActive} startIcon={<ClearAllIcon />} sx={{ height: '40px' }}>Limpiar</Button></Grid>
            </Grid>
          </Paper>
        </div>

        {(loading && cursosData.length > 0) && (<Box sx={{ gridArea: 'tabla-cronograma', display: 'flex', justifyContent: 'center', my: 2, alignItems: 'center' }}><CircularProgress size={20} sx={{ mr: 1 }} /><Typography variant="body2">Actualizando...</Typography></Box>)}

        <div style={{ gridArea: 'tabla-cronograma', overflowX: 'auto' }}>
          <Paper elevation={3} sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredData}
              columns={columnsForGrid}
              onRowClick={handleRowClick}
              getRowId={r => r.id}
              loading={loading}
              density="compact"
              disableRowSelectionOnClick
              initialState={{
                sorting: {
                  sortModel: [{ field: 'Fecha inicio del curso', sort: 'asc' }],
                },
              }}
            />
          </Paper>
        </div>
      </div>

      <Modal open={modalOpen} onClose={handleCloseModal} aria-labelledby="course-detail-title">
        <Box sx={modalStyle}>
          {selectedRowData && (
            <Card sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
              <CardHeader
                avatar={<InfoIcon color="primary" />}
                id="course-detail-title"
                title={selectedRowData["Nombre del curso"]}
                subheader={`Código: ${selectedRowData["Código del curso"]}`}
                titleTypographyProps={{ variant: 'h6', fontWeight: 'bold', color: 'primary.main' }}
                action={<IconButton onClick={handleCloseModal}><CloseIcon /></IconButton>}
                sx={{ bgcolor: 'grey.100', borderBottom: '1px solid', borderColor: 'divider' }}
              />
              <CardContent sx={{ overflowY: 'auto', flexGrow: 1, p: 2 }}>
                <List dense>
                  <Divider sx={{ mb: 1 }}><Chip label="Detalles del Curso" size="small" /></Divider>
                  {renderDetailItem("Ministerio", selectedRowData["Ministerio"])}
                  {renderDetailItem("Área", selectedRowData["Area"])}
                  {renderDetailItem("Tipo de capacitación", selectedRowData["Tipo de capacitación"])}
                  {renderDetailItem("Cantidad de horas", selectedRowData["Cantidad de horas"])}

                  <Divider sx={{ my: 2 }}><Chip label="Detalles de la Instancia" size="small" /></Divider>
                  {renderDetailItem("Estado", selectedRowData["Estado de Instancia"])}
                  {renderDetailItem("Cupo", selectedRowData["Cupo"])}
                  {renderDetailItem("Inscriptos", selectedRowData["Cantidad de inscriptos"])}
                  {renderDetailItem("Medio de inscripción", selectedRowData["Medio de inscripción"])}
                  {renderDetailItem("Plataforma de dictado", selectedRowData["Plataforma de dictado"])}
                  {renderDetailItem("Comentario", selectedRowData["Comentario"])}

                  <Divider sx={{ my: 2 }}><Chip label="Fechas" size="small" /></Divider>
                  {renderDetailItem("Inicio de Inscripción", selectedRowData["Fecha inicio de inscripción"])}
                  {renderDetailItem("Fin de Inscripción", selectedRowData["Fecha fin de inscripción"])}
                  {renderDetailItem("Inicio del Curso", selectedRowData["Fecha inicio del curso"])}
                  {renderDetailItem("Fin del Curso", selectedRowData["Fecha fin del curso"])}

                  <Divider sx={{ my: 2 }}><Chip label="Configuración y Restricciones" size="small" /></Divider>
                  {renderDetailItem("Es Autogestionado", selectedRowData["Es Autogestionado"], true)}
                  {renderDetailItem("Publicada en Portal", selectedRowData["Publica PCC"], true)}

                  <ListItem sx={{ py: 0.8, px: 0 }}>
                    <ListItemText
                      primary={selectedRowData["Tiene restricción por edad"] ? `Desde ${selectedRowData["Edad Desde"]} hasta ${selectedRowData["Edad Hasta"] || 'sin límite'} años` : 'Ninguna'}
                      secondary="Restricción por Edad"
                      primaryTypographyProps={{ fontWeight: 500, color: 'text.primary', wordBreak: 'break-word' }}
                      secondaryTypographyProps={{ fontSize: '0.8rem', color: 'text.secondary' }}
                    />
                  </ListItem>
                  <Divider component="li" sx={{ my: 0.5 }} />

                  <ListItem sx={{ py: 0.8, px: 0 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {selectedRowData["Restricciones por Departamento"].length > 0 ?
                            selectedRowData["Restricciones por Departamento"].map(d => <Chip key={d.departamento_id} label={d.detalle_departamento?.nombre || d.departamento_id} size="small" />) :
                            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>Ninguna</Typography>
                          }
                        </Box>
                      }
                      secondary="Restricción por Departamento"
                      secondaryTypographyProps={{ fontSize: '0.8rem', color: 'text.secondary' }}
                    />
                  </ListItem>
                  <Divider component="li" sx={{ my: 0.5 }} />

                  <ListItem sx={{ py: 0.8, px: 0 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5, mb: 0.5 }}>
                          {selectedRowData["Restricciones por Correlatividad"].length > 0 ?
                            selectedRowData["Restricciones por Correlatividad"].map(c => <Chip key={c.curso_correlativo} label={c.detalle_curso_correlativo?.nombre || c.curso_correlativo} size="small" />) :
                            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>Ninguna</Typography>
                          }
                        </Box>
                      }
                      secondary="Restricción por Correlatividad"
                      secondaryTypographyProps={{ fontSize: '0.8rem', color: 'text.secondary' }}
                    />
                  </ListItem>
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