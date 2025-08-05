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
    InputLabel, Select, MenuItem, Grid, Button, InputAdornment, Tooltip, Dialog,
    DialogTitle, DialogContent, DialogActions, Chip, Alert, Stack,
    Input, Autocomplete as MuiAutocomplete, FormControlLabel, Checkbox
} from '@mui/material';
// Imports para DatePicker
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import SettingsIcon from '@mui/icons-material/Settings';
import BotonCircular from "./UIElements/BotonCircular.jsx";
import Titulo from "../components/fonts/TituloPrincipal.jsx";
import { getInstancias, putInstancia } from "../services/instancias.service.js";
import { getUsuarios } from "../services/usuarios.service.js";
import { getEstadosInstancia } from "../services/estadosInstancia.service.js";
import { getDepartamentos } from "../services/departamentos.service.js";
import { getCursos } from "../services/cursos.service.js"; // Se asume que este servicio existe

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.locale('es');

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: '80%', maxWidth: 700, bgcolor: 'background.paper',
  borderRadius: 2, boxShadow: 24, p: 0, maxHeight: '90vh', display: 'flex', flexDirection: 'column',
};

const MONTH_NAMES = [ "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre" ];
const DATE_FORMATS_TO_TRY = ['DD/MM/YYYY', 'D/M/YYYY', 'DD-MM-YYYY', 'D-M-YYYY', 'YYYY-MM-DD'];

const parseDate = (dateString) => {
  if (!dateString || typeof dateString !== 'string' || dateString.trim() === '') return null;
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

// Componente de Botón de Acción Reutilizable para el modal
const ActionButton = ({ onClick, children, ...props }) => (
    <Button size="small" variant="outlined" color="secondary" onClick={onClick} sx={{ ml: 'auto', flexShrink: 0 }} {...props}>
        {children}
    </Button>
);

const CronogramaGAReducido = () => {
    const [cursosData, setCursosData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState(null);
    const [originalInstanciaData, setOriginalInstanciaData] = useState(null);
    const [ministerioOptions, setMinisterioOptions] = useState([]);
    const [areaOptions, setAreaOptions] = useState(['all']);
    const [ministerioFilter, setMinisterioFilter] = useState('all');
    const [areaFilter, setAreaFilter] = useState('all');
    const [nombreFilter, setNombreFilter] = useState('');
    const [monthFilter, setMonthFilter] = useState('all');
    const [activosFilterActive, setActivosFilterActive] = useState(false);
    const [asignadoFilter, setAsignadoFilter] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [adminUsers, setAdminUsers] = useState([]);
    const [reasignModalOpen, setReasignModalOpen] = useState(false);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [selectedUserForReasign, setSelectedUserForReasign] = useState(null);
    const [loadingReasign, setLoadingReasign] = useState(false);
    const [allEstados, setAllEstados] = useState([]);
    const [estadoModalOpen, setEstadoModalOpen] = useState(false);
    const [selectedEstado, setSelectedEstado] = useState('');
    const [loadingEstado, setLoadingEstado] = useState(false);
    const [fechasModalOpen, setFechasModalOpen] = useState(false);
    const [loadingFechas, setLoadingFechas] = useState(false);
    const [fechasEditables, setFechasEditables] = useState({ fecha_inicio_curso: null, fecha_fin_curso: null, fecha_inicio_inscripcion: null, fecha_fin_inscripcion: null });
    const [otrosModalOpen, setOtrosModalOpen] = useState(false);
    const [loadingOtros, setLoadingOtros] = useState(false);
    const [otrosEditable, setOtrosEditable] = useState({ cantidad_inscriptos: '', cantidad_certificados: '' });
    const [autogestionadoConfirmOpen, setAutogestionadoConfirmOpen] = useState(false);

    // --- USESTATE PARA RESTRICCIONES ---
    const [allCursos, setAllCursos] = useState([]);
    const [allDepartamentos, setAllDepartamentos] = useState([]);
    const [restrictionsModalOpen, setRestrictionsModalOpen] = useState(false);
    const [loadingRestrictions, setLoadingRestrictions] = useState(false);
    const [editableDepartamentos, setEditableDepartamentos] = useState([]);
    const [editableCorrelativos, setEditableCorrelativos] = useState([]);
    const [edadRestrictionEnabled, setEdadRestrictionEnabled] = useState(false);
    const [editableEdadDesde, setEditableEdadDesde] = useState('');
    const [editableEdadHasta, setEditableEdadHasta] = useState('');

    const COLUMNAS_VISIBLES = useMemo(() => [
        "Nombre del curso",
        "Código del curso",
        "Número de evento",
        "Fecha inicio de inscripción",
        "Fecha fin de inscripción",
        "Fecha inicio del curso",
        "Fecha fin del curso",
        "Cantidad de inscriptos",
        "Cantidad de certificados",
        "Medio de inscripción",
        "Publica en PCC",
        "Es autogestionado",
        "Restricción por edad",
        "Restricción por Departamento",
        "Tiene Correlatividad",
        "Estado"
    ], []);

    const columnsForGrid = useMemo(() => {
        return COLUMNAS_VISIBLES.map(headerKey => {
            let flex = 1; let minWidth = 130;
            if (headerKey === "Nombre del curso") { flex = 2.0; minWidth = 220; }
            if (headerKey === "Código del curso") { flex = 0.7; minWidth = 100; }
            if (headerKey.toLowerCase().includes("fecha")) { flex = 1.0; minWidth = 140; }
            if (headerKey === "Cantidad de inscriptos" || headerKey === "Cantidad de certificados") { flex = 0.8; minWidth = 100; }
            if (headerKey === "Medio de inscripción") { flex = 0.8; minWidth = 120; }
            if (headerKey === "Publica en PCC" || headerKey === "Es autogestionado" || headerKey === "Restricción por edad" || headerKey === "Restricción por Departamento" || headerKey === "Tiene Correlatividad") { flex = 0.7; minWidth = 110; }
            if (headerKey === "Estado") { flex = 0.7; minWidth = 110; }
            return { field: headerKey, headerName: headerKey, flex, minWidth };
        }).filter(Boolean);
    }, [COLUMNAS_VISIBLES]);
    const formatValue = useCallback((value) => (value == null ? '' : String(value).trim()), []);

    const fetchData = useCallback(async () => {
        setLoading(true); setError(null); setSuccessMessage('');
        try {
            const [instanciasData, usuariosData, estadosData, cursos, departamentos] = await Promise.all([
                getInstancias(), getUsuarios(), getEstadosInstancia(), getCursos(), getDepartamentos()
            ]);

            if (!Array.isArray(instanciasData)) throw new Error("Datos de instancias no válidos.");
            if (!Array.isArray(usuariosData)) throw new Error("Datos de usuarios no válidos.");
            if (!Array.isArray(estadosData)) throw new Error("Datos de estados no válidos.");
            if (!Array.isArray(cursos)) throw new Error("Datos de cursos no válidos.");
            if (!Array.isArray(departamentos)) throw new Error("Datos de departamentos no válidos.");

            setAllUsers(usuariosData); setAllEstados(estadosData); setAllCursos(cursos); setAllDepartamentos(departamentos);
            const filteredAdminUsers = usuariosData.filter(user => user.rol === 'ADM'); setAdminUsers(filteredAdminUsers);
            const usersMap = new Map(usuariosData.map(u => [u.cuil, `${u.detalle_persona?.nombre || ''} ${u.detalle_persona?.apellido || ''}`.trim()]));
            const admSet = new Set();
            const dataObjs = instanciasData.map((instancia, idx) => {
                const detalle = instancia.detalle_curso || {}; const areaDetalle = detalle.detalle_area || {};
                const ministerioDetalle = areaDetalle.detalle_ministerio || {}; const admValue = formatValue(ministerioDetalle.nombre);
                if (admValue) admSet.add(admValue);
                let autogestionadoVal = instancia.es_autogestionado;
                if (autogestionadoVal === null && detalle.es_autogestionado !== null) autogestionadoVal = detalle.es_autogestionado;
                const asignadoCuil = formatValue(instancia.asignado);
                const asignadoNombreCompleto = usersMap.get(asignadoCuil) || asignadoCuil || 'No asignado';
                return {
                    id: idx,
                    originalInstancia: instancia,
                    "Nombre del curso": formatValue(detalle.nombre),
                    "Código del curso": formatValue(instancia.curso || detalle.cod),
                    "Número de evento": formatValue(detalle.numero_evento),
                    "Fecha inicio de inscripción": formatValue(instancia.fecha_inicio_inscripcion),
                    "Fecha fin de inscripción": formatValue(instancia.fecha_fin_inscripcion),
                    "Fecha inicio del curso": formatValue(instancia.fecha_inicio_curso),
                    "Fecha fin del curso": formatValue(instancia.fecha_fin_curso),
                    "Cantidad de inscriptos": instancia.cantidad_inscriptos || 0,
                    "Cantidad de certificados": instancia.cantidad_certificados || 0,
                    "Medio de inscripción": formatValue(instancia.detalle_medioInscripcion?.nombre || detalle.detalle_medioInscripcion?.nombre),
                    "Publica en PCC": formatBooleanToSiNo(instancia.es_publicada_portal_cc === null ? detalle.publica_pcc : instancia.es_publicada_portal_cc),
                    "Es autogestionado": formatBooleanToSiNo(autogestionadoVal),
                    "Restricción por edad": formatBooleanToSiNo(instancia.tiene_restriccion_edad),
                    "Restricción por Departamento": formatBooleanToSiNo(instancia.tiene_restriccion_departamento),
                    "Tiene Correlatividad": formatBooleanToSiNo(instancia.tiene_correlatividad),
                    "Estado": formatValue(instancia.estado_instancia),
                    "ADM": admValue,
                    "Area": formatValue(areaDetalle.nombre),
                    "Asignado": asignadoNombreCompleto,
                };
            });
            setCursosData(dataObjs); setMinisterioOptions(['all', ...Array.from(admSet).sort()]);
        } catch (err) {
            console.error("Error loading data:", err); setError(err.message || "Error al cargar datos.");
            setCursosData([]); setFilteredData([]); setMinisterioOptions(['all']);
            setAllUsers([]); setAdminUsers([]); setAllEstados([]);
        } finally { setLoading(false); }
    }, [formatValue]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        if (loading || !cursosData.length) { setAreaOptions(['all']); if (areaFilter !== 'all') setAreaFilter('all'); return; }
        let relevantCourses = [];
        if (ministerioFilter === 'all') { relevantCourses = cursosData; } else { relevantCourses = cursosData.filter(c => c["ADM"] === ministerioFilter); }
        const areasSet = new Set(relevantCourses.map(c => c["Area"]).filter(Boolean));
        const newAreaOptions = ['all', ...Array.from(areasSet).sort()];
        setAreaOptions(newAreaOptions);
        if (ministerioFilter !== 'all' && !newAreaOptions.includes(areaFilter)) { setAreaFilter('all'); }
    }, [ministerioFilter, cursosData, loading, areaFilter]);

    useEffect(() => {
        if (loading && cursosData.length === 0) return;
        let data = [...cursosData];
        const today = dayjs().startOf('day');
        if (ministerioFilter !== 'all') data = data.filter(c => c["ADM"] === ministerioFilter);
        if (areaFilter !== 'all') data = data.filter(c => c["Area"] === areaFilter);
        if (nombreFilter.trim()) {
            const term = nombreFilter.trim().toLowerCase();
            data = data.filter(c => c["Nombre del curso"]?.toLowerCase().includes(term) || c["Código del curso"]?.toLowerCase().includes(term));
        }
        if (monthFilter !== 'all') {
            const targetMonth = parseInt(monthFilter, 10);
            data = data.filter(c => { const parsedDate = parseDate(c["Fecha inicio de inscripción"]); return parsedDate && parsedDate.month() === targetMonth; });
        }
        if (activosFilterActive) {
            data = data.filter(c => {
                const startDate = parseDate(c["Fecha inicio de inscripción"]); const endDate = parseDate(c["Fecha fin de inscripción"]);
                return startDate && endDate && startDate.isSameOrBefore(today) && endDate.isSameOrAfter(today);
            });
        }
        if (asignadoFilter.trim()) {
            const term = asignadoFilter.trim().toLowerCase();
            data = data.filter(c => c["Asignado"]?.toLowerCase().includes(term));
        }
        setFilteredData(data);
    }, [cursosData, ministerioFilter, areaFilter, nombreFilter, monthFilter, activosFilterActive, asignadoFilter, loading]);

    const handleRowClick = useCallback(params => { setSelectedRowData(params.row); setOriginalInstanciaData(params.row.originalInstancia); setModalOpen(true); }, []);
    const handleCloseModal = useCallback(() => { setModalOpen(false); setSelectedRowData(null); setOriginalInstanciaData(null); }, []);
    
    const handleCloseReasignModal = useCallback(() => { setReasignModalOpen(false); setSelectedUserForReasign(null); setUserSearchTerm(''); }, []);
    
    const handleOpenEstadoModal = useCallback(() => { if (originalInstanciaData) { setSelectedEstado(originalInstanciaData.estado_instancia || ''); } setEstadoModalOpen(true); }, [originalInstanciaData]);
    const handleCloseEstadoModal = useCallback(() => { setEstadoModalOpen(false); setSelectedEstado(''); }, []);


    const handleCloseFechasModal = useCallback(() => { setFechasModalOpen(false); setFechasEditables({ fecha_inicio_curso: null, fecha_fin_curso: null, fecha_inicio_inscripcion: null, fecha_fin_inscripcion: null }); }, []);
    
    const handleOpenOtrosModal = useCallback(() => {
        if (originalInstanciaData) {
            setOtrosEditable({
                cantidad_inscriptos: originalInstanciaData.cantidad_inscriptos || '',
                cantidad_certificados: originalInstanciaData.cantidad_certificados || '',
            });
        }
        setOtrosModalOpen(true);
    }, [originalInstanciaData]);

    const handleCloseOtrosModal = useCallback(() => { setOtrosModalOpen(false); setOtrosEditable({ cantidad_inscriptos: '', cantidad_certificados: '' }); }, []);



    const handleApiUpdate = useCallback(async (payload) => {
        if (!originalInstanciaData) { setError("No hay una instancia seleccionada para actualizar."); return false; }
        setError(null); setSuccessMessage('');
        try {
            await putInstancia(originalInstanciaData.curso, originalInstanciaData.fecha_inicio_curso, payload);
            return true;
        } catch (err) { console.error("Error en putInstancia:", err); setError(err.response?.data?.message || err.message || "Error al actualizar la instancia."); return false; }
    }, [originalInstanciaData]);

    const handleReasign = useCallback(async () => {
        if (!selectedUserForReasign) { setError("No se ha seleccionado un usuario."); return; }
        setLoadingReasign(true);
        const success = await handleApiUpdate({ asignado: selectedUserForReasign.cuil });
        if (success) {
            const persona = selectedUserForReasign.detalle_persona;
            setSuccessMessage(`Instancia reasignada a ${persona?.nombre || ''} ${persona?.apellido || ''} exitosamente.`);
            handleCloseReasignModal(); handleCloseModal(); fetchData();
        }
        setLoadingReasign(false);
    }, [selectedUserForReasign, handleApiUpdate, fetchData, handleCloseReasignModal, handleCloseModal]);
    
    const handleUpdateEstado = useCallback(async () => {
        if (!selectedEstado) { setError("No se ha seleccionado un nuevo estado."); return; }
        setLoadingEstado(true);
        const success = await handleApiUpdate({ estado_instancia: selectedEstado });
        if (success) {
            const estadoDesc = allEstados.find(e => e.cod === selectedEstado)?.descripcion || selectedEstado;
            setSuccessMessage(`Estado actualizado a "${estadoDesc}" exitosamente.`);
            handleCloseEstadoModal(); handleCloseModal(); fetchData();
        }
        setLoadingEstado(false);
    }, [selectedEstado, allEstados, handleApiUpdate, fetchData, handleCloseEstadoModal, handleCloseModal]);


    const handleConfirmToggleAutogestionado = useCallback(async () => {
        const currentValue = originalInstanciaData?.es_autogestionado;
        const newValue = currentValue === 1 ? 0 : 1;
        const success = await handleApiUpdate({ es_autogestionado: newValue });
        if (success) {
            setSuccessMessage(`El estado 'Autogestionado' se cambió a "${formatBooleanToSiNo(newValue)}" exitosamente.`);
            setAutogestionadoConfirmOpen(false);
            handleCloseModal();
            fetchData();
        } else {
            setAutogestionadoConfirmOpen(false);
        }
    }, [originalInstanciaData, handleApiUpdate, fetchData, handleCloseModal]);

    
    const filteredAdminUsersForModal = useMemo(() => {
        if (!userSearchTerm) return adminUsers;
        const term = userSearchTerm.toLowerCase();
        return adminUsers.filter(user =>
            (user.detalle_persona?.nombre?.toLowerCase() || '').includes(term) ||
            (user.detalle_persona?.apellido?.toLowerCase() || '').includes(term) ||
            (user.cuil?.toLowerCase() || '').includes(term)
        );
    }, [adminUsers, userSearchTerm]);
    
    const handleDescargarExcel = useCallback(async () => { 
        if (!filteredData.length) return;
        try {
            await descargarExcel(filteredData, COLUMNAS_VISIBLES, "Cronograma_Admin_Reducido");
        } catch (error) {
            setError("Error al generar el archivo Excel.");
            console.error(error);
        }
    }, [filteredData, COLUMNAS_VISIBLES]);

    const handleMinisterioChange = useCallback(e => setMinisterioFilter(e.target.value), []);
    const handleAreaChange = useCallback(e => setAreaFilter(e.target.value), []);
    const handleNombreChange = useCallback(e => setNombreFilter(e.target.value), []);
    const handleMonthChange = useCallback(e => setMonthFilter(e.target.value), []);
    const handleToggleActivosFilter = useCallback(() => setActivosFilterActive(prev => !prev), []);
    
    const handleClearFilters = useCallback(() => {
        setMinisterioFilter('all');
        setAreaFilter('all');
        setNombreFilter('');
        setMonthFilter('all');
        setActivosFilterActive(false);
        setAsignadoFilter('');
    }, []);

    const isFilterActive = useMemo(() => nombreFilter || ministerioFilter !== 'all' || areaFilter !== 'all' || monthFilter !== 'all' || activosFilterActive || asignadoFilter, [nombreFilter, ministerioFilter, areaFilter, monthFilter, activosFilterActive, asignadoFilter]);

    // ** NUEVO HANDLER PARA EL CHECKBOX DE EDAD **
    const handleEdadRestrictionChange = (event) => {
        const isChecked = event.target.checked;
        setEdadRestrictionEnabled(isChecked);
        if (isChecked) {
            // Al marcar, se fija la edad mínima en 16 por defecto.
            setEditableEdadDesde('16');
        } else {
            // Al desmarcar, se limpian los campos.
            setEditableEdadDesde('');
            setEditableEdadHasta('');
        }
    };

    const renderDetailItem = useCallback((label, value, isBoolean = false, actionButton = null) => {
        const displayValue = isBoolean ? formatBooleanToSiNo(value) : (formatValue(value) || '-');
        return (
            <React.Fragment key={label}>
                <ListItem sx={{ py: 0.8, px: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <ListItemText primary={displayValue} secondary={label} primaryTypographyProps={{ fontWeight: 500, wordBreak: 'break-word', color: "black" }} secondaryTypographyProps={{ fontSize: '0.8rem' }}/>
                    {actionButton}
                </ListItem>
                <Divider component="li" sx={{ my: 0.5 }} />
            </React.Fragment>
        );
    }, [formatValue]);
    
    const renderAgeRestriction = () => {
        if (!originalInstanciaData?.tiene_restriccion_edad) {
            return "Ninguna";
        }
        const desde = originalInstanciaData.restriccion_edad_desde;
        const hasta = originalInstanciaData.restriccion_edad_hasta;
        if (desde && hasta) return `Desde ${desde} hasta ${hasta} años`;
        if (desde && !hasta) return `Desde ${desde} años en adelante`;
        if (!desde && hasta) return `Hasta ${hasta} años`;
        return "Definida pero incompleta";
    };

    if (loading && !cursosData.length) return (<Backdrop open sx={{ zIndex: t => t.zIndex.drawer + 1, color: '#fff' }}><CircularProgress color="inherit" /></Backdrop>);
    if (error && !successMessage) return (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', p: 3 }}><Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}><Typography variant="h6" color="error" gutterBottom>Error</Typography><Typography>{error}</Typography><Button onClick={fetchData} sx={{mt: 2}}>Reintentar</Button></Paper></Box>);
    if (!loading && !error && cursosData.length === 0) return (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', p: 3 }}><Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}><Typography variant="h6" gutterBottom>No Hay Datos</Typography><Typography>No se encontraron datos en el cronograma.</Typography></Paper></Box>);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <div style={{ padding: 20 }}>
                {successMessage && <Alert severity="success" onClose={() => setSuccessMessage('')} sx={{ mb: 2 }}>{successMessage}</Alert>}
                {error && !successMessage && <Alert severity="error" onClose={() => {setError(null); setSuccessMessage('');}} sx={{ mb: 2 }}>{error}</Alert>}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                    <Titulo texto="Cronograma GA Reducido" />
                    <BotonCircular icon="descargar" onClick={handleDescargarExcel} tooltip="Descargar Vista Actual" disabled={(loading && cursosData.length > 0) || !filteredData.length} />
                </Box>
                <Divider sx={{ mb: 3, borderBottomWidth: 2 }} />

                <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md={2.5}><TextField fullWidth label="Buscar por Asignado" variant="outlined" size="small" value={asignadoFilter} onChange={(e) => setAsignadoFilter(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><AssignmentIndIcon color="action" fontSize="small" /></InputAdornment>), }} /></Grid>
                        <Grid item xs={12} sm={6} md={2.5}><TextField fullWidth label="Buscar por Nombre/Código" variant="outlined" size="small" value={nombreFilter} onChange={handleNombreChange} disabled={loading && cursosData.length > 0} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>), }} /></Grid>
                        <Grid item xs={12} sm={6} md={2}><FormControl fullWidth size="small" variant="outlined" disabled={(loading && cursosData.length > 0) || ministerioOptions.length <= 1}><InputLabel id="adm-filter-label">ADM (Ministerio)</InputLabel><Select labelId="adm-filter-label" value={ministerioFilter} label="ADM (Ministerio)" onChange={handleMinisterioChange} startAdornment={ <InputAdornment position="start" sx={{ ml: '-6px', mr: '4px' }}><AccountBalanceIcon color="action" fontSize='small' /></InputAdornment> } sx={{ '& .MuiSelect-select': { pl: 1 } }} ><MenuItem value="all"><em>Todos</em></MenuItem>{ministerioOptions.filter(opt => opt !== 'all').map((opt, i) => (<MenuItem key={i} value={opt}>{opt}</MenuItem>))}</Select></FormControl></Grid>
                        <Grid item xs={12} sm={6} md={2}><FormControl fullWidth size="small" variant="outlined" disabled={(loading && cursosData.length > 0) || ministerioFilter === 'all' || areaOptions.length <= 1}><InputLabel id="area-filter-label">Área</InputLabel><Select labelId="area-filter-label"value={areaFilter}label="Área"onChange={handleAreaChange}startAdornment={ <InputAdornment position="start" sx={{ ml: '-6px', mr: '4px' }}><FolderSpecialIcon color="action" fontSize='small' /></InputAdornment>}sx={{ '& .MuiSelect-select': { pl: 1 } }}><MenuItem value="all"><em>Todas</em></MenuItem>{areaOptions.filter(opt => opt !== 'all').map((opt, i) => (<MenuItem key={i} value={opt}>{opt}</MenuItem>))}{ministerioFilter !== 'all' && areaOptions.length <= 1 && (<MenuItem value="all" disabled><em>(Sin áreas)</em></MenuItem>)}</Select></FormControl></Grid>
                        <Grid item xs={12} sm={6} md={2}><FormControl fullWidth size="small" variant="outlined" disabled={loading && cursosData.length > 0}><InputLabel id="mes-filter-label">Mes Inicio Curso</InputLabel><Select labelId="mes-filter-label"value={monthFilter}label="Mes Inicio Curso"onChange={handleMonthChange}startAdornment={<InputAdornment position="start" sx={{ ml: '-6px', mr: '4px' }}><CalendarMonthIcon color="action" fontSize='small' /></InputAdornment>}sx={{ '& .MuiSelect-select': { pl: 1 } }}><MenuItem value="all"><em>Todos</em></MenuItem>{MONTH_NAMES.map((m, i) => (<MenuItem key={i} value={i.toString()}>{m}</MenuItem>))}</Select></FormControl></Grid>
                        <Grid item xs={12} sm={6} md={1.5} sx={{ display: 'flex' }}><Tooltip title={activosFilterActive ? "Mostrar todos los cursos" : "Mostrar solo cursos activos ahora"}><Button fullWidth variant={activosFilterActive ? "contained" : "outlined"}size="medium"onClick={handleToggleActivosFilter}disabled={loading && cursosData.length > 0}startIcon={<AccessTimeIcon />}sx={{ height: '40px', minWidth: 'auto' }}>Activos</Button></Tooltip></Grid>
                        <Grid item xs={12} sm={6} md={1.5} sx={{ display: 'flex' }}><Button fullWidth variant="outlined"size="medium"onClick={handleClearFilters}disabled={!isFilterActive || (loading && cursosData.length > 0)}startIcon={<ClearAllIcon />}sx={{ height: '40px', minWidth: 'auto' }}>Limpiar</Button></Grid>
                    </Grid>
                </Paper>

                {(loading && cursosData.length > 0) && (<Box sx={{ display: 'flex', justifyContent: 'center', my: 2, alignItems: 'center' }}><CircularProgress size={20} sx={{ mr: 1 }} /><Typography variant="body2" color="text.secondary">Actualizando tabla...</Typography></Box>)}
                
                <Paper elevation={3} sx={{ height: 600, width: '100%' }}>
                    <DataGrid rows={filteredData} columns={columnsForGrid} localeText={esES.components.MuiDataGrid.defaultProps.localeText} onRowClick={handleRowClick} getRowId={r => r.id} loading={loading && cursosData.length > 0} density="compact" disableRowSelectionOnClick initialState={{ sorting: { sortModel: [{ field: 'Fecha inicio del curso', sort: 'asc' }] } }} sx={{ border: 0, '& .MuiDataGrid-columnHeaders': { backgroundColor: 'primary.light', color: 'text.primary', fontWeight: 'bold' }, '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none!important' }, '& .MuiDataGrid-row': { cursor: 'pointer' }, '& .MuiDataGrid-row:hover': { backgroundColor: 'action.hover', }, '& .MuiDataGrid-overlay': { backgroundColor: 'rgba(255,255,255,0.7)' } }} slots={{ noRowsOverlay: () => (<Box sx={{ mt: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', p: 2 }}><InfoIcon color="action" sx={{ mb: 1, fontSize: '3rem' }} /><Typography align="center">{cursosData.length === 0 ? "No hay datos disponibles." : "No hay cursos que coincidan."}</Typography></Box>) }} />
                </Paper>
                
                <Modal open={modalOpen} onClose={handleCloseModal} aria-labelledby="course-detail-title">
                    <Box sx={modalStyle}>
                        {selectedRowData && originalInstanciaData && (
                            <Card sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
                                <CardHeader avatar={<InfoIcon color="primary" />} id="course-detail-title" title={originalInstanciaData.detalle_curso?.nombre || "Detalle de Instancia"} titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }} subheader={`Código Curso: ${originalInstanciaData.curso}`} action={<IconButton aria-label="Cerrar" onClick={handleCloseModal}><CloseIcon /></IconButton>} sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, bgcolor: 'grey.100' }} />
                                <CardContent sx={{ overflowY: 'auto', flexGrow: 1, p: 2 }}>
                                    <List dense>
                                        {renderDetailItem("Asignado", selectedRowData["Asignado"])}
                                        {renderDetailItem("Estado", originalInstanciaData.estado_instancia, false, <ActionButton onClick={handleOpenEstadoModal}>Cambiar</ActionButton>)}
                                        <Divider sx={{ my: 1 }}><Chip label="Fechas Instancia" size="small" /></Divider>
                                        {renderDetailItem("Fecha Inicio Curso", originalInstanciaData.fecha_inicio_curso)}
                                        {renderDetailItem("Fecha Fin Curso", originalInstanciaData.fecha_fin_curso)}
                                        {renderDetailItem("Fecha Inicio Inscripción", originalInstanciaData.fecha_inicio_inscripcion)}
                                        {renderDetailItem("Fecha Fin Inscripción", originalInstanciaData.fecha_fin_inscripcion)}
                                        <Divider sx={{ my: 1 }}><Chip label="Detalles Instancia" size="small" /></Divider>
                                        {renderDetailItem("Nombre del curso", originalInstanciaData.detalle_curso?.nombre)}
                                        {renderDetailItem("Código del curso", originalInstanciaData.curso)}
                                        {renderDetailItem("Número de evento", originalInstanciaData.detalle_curso?.numero_evento)}
                                        {renderDetailItem("Cupo", originalInstanciaData.cupo)}
                                        {renderDetailItem("Cantidad de inscriptos", originalInstanciaData.cantidad_inscriptos || 0, false)}
                                        {renderDetailItem("Cantidad de certificados", originalInstanciaData.cantidad_certificados || 0, false, <ActionButton onClick={handleOpenOtrosModal}>Cambiar</ActionButton>)}
                                        {renderDetailItem("Medio de inscripción", originalInstanciaData.detalle_medioInscripcion?.nombre || originalInstanciaData.detalle_curso?.detalle_medioInscripcion?.nombre)}
                                        {renderDetailItem("Publica en PCC", originalInstanciaData.es_publicada_portal_cc === null ? originalInstanciaData.detalle_curso?.publica_pcc : originalInstanciaData.es_publicada_portal_cc, true)}
                                        {renderDetailItem("Es autogestionado", originalInstanciaData.es_autogestionado === null ? originalInstanciaData.detalle_curso?.es_autogestionado : originalInstanciaData.es_autogestionado, true, <ActionButton onClick={() => setAutogestionadoConfirmOpen(true)}>Cambiar</ActionButton>)}
                                        {renderDetailItem("Comentario", originalInstanciaData.comentario)}
                                        <Divider sx={{ my: 1 }}><Chip label="Restricciones" size="small" /></Divider>
                                        {renderDetailItem("Restricción por edad", originalInstanciaData.tiene_restriccion_edad, true)}
                                        <ListItem sx={{ py: 1, px: 0, display: 'block' }}>
                                            <ListItemText primary="Edad" secondary="Restricción por rango de edad" />
                                            <Typography variant="body2" color="text.secondary">{renderAgeRestriction()}</Typography>
                                        </ListItem>
                                        {renderDetailItem("Restricción por Departamento", originalInstanciaData.tiene_restriccion_departamento, true)}
                                        <ListItem sx={{ py: 1, px: 0, display: 'block' }}>
                                            <ListItemText primary="Departamentos" secondary="Limitado a estas áreas" />
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                                {(originalInstanciaData.detalle_restricciones_por_departamento?.length > 0) ? 
                                                    originalInstanciaData.detalle_restricciones_por_departamento.map(d => <Chip key={d.departamento_id} label={d.detalle_departamento?.nombre || d.departamento_id} size="small" />) : 
                                                    <Typography variant="body2" color="text.secondary"><i>Ninguna</i></Typography>
                                                }
                                            </Box>
                                        </ListItem>
                                        {renderDetailItem("Tiene Correlatividad", originalInstanciaData.tiene_correlatividad, true)}
                                        <ListItem sx={{ py: 1, px: 0, display: 'block' }}>
                                            <ListItemText primary="Correlatividades" secondary="Requiere haber aprobado estos cursos" />
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                                {(originalInstanciaData.detalle_restricciones_por_correlatividad?.length > 0) ? 
                                                    originalInstanciaData.detalle_restricciones_por_correlatividad.map(c => <Chip key={c.curso_correlativo} label={c.detalle_curso_correlativo?.nombre || c.curso_correlativo} size="small" />) : 
                                                    <Typography variant="body2" color="text.secondary"><i>Ninguna</i></Typography>
                                                }
                                            </Box>
                                        </ListItem>
                                    </List>
                                </CardContent>
                            </Card>
                        )}
                    </Box>
                </Modal>
                
                <Dialog open={reasignModalOpen} onClose={handleCloseReasignModal} fullWidth maxWidth="sm">
                    <DialogTitle>Reasignar Instancia de Curso</DialogTitle>
                    <DialogContent dividers>
                        {selectedRowData && (<><Typography gutterBottom>Curso: <strong>{selectedRowData["Nombre del curso"]}</strong> ({selectedRowData["Código del curso"]})</Typography><Typography gutterBottom>Asignado actual: <strong>{selectedRowData["Asignado"]}</strong></Typography></>)}
                        <TextField fullWidth variant="outlined" size="small" label="Buscar usuario ADM (Nombre, Apellido, CUIL)" value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} sx={{ my: 2 }} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>),}}/>
                        <Paper sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid lightgrey' }}>
                            <List dense>
                                {filteredAdminUsersForModal.length === 0 && <ListItem><ListItemText primary="No se encontraron usuarios ADM."  /></ListItem>}
                                {filteredAdminUsersForModal.map(user => (
                                    <ListItem key={user.cuil} button selected={selectedUserForReasign?.cuil === user.cuil} onClick={() => setSelectedUserForReasign(user)}>
                                        <ListItemText primary={`${user.detalle_persona?.nombre || ''} ${user.detalle_persona?.apellido || ''} - Cuil: ${user.cuil}`} primaryTypographyProps={{ fontWeight: 500, wordBreak: 'break-word', color: "black" }} />
                                        {selectedUserForReasign?.cuil === user.cuil && <Chip label="Seleccionado" color="primary" size="small" />}
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseReasignModal}>Cancelar</Button>
                        <Button onClick={handleReasign} variant="contained" color="primary" disabled={!selectedUserForReasign || loadingReasign}>{loadingReasign ? <CircularProgress size={24} color="inherit" /> : "Confirmar Reasignación"}</Button>
                    </DialogActions>
                </Dialog>
                
                <Dialog open={estadoModalOpen} onClose={handleCloseEstadoModal} fullWidth maxWidth="xs">
                    <DialogTitle>Cambiar Estado de la Instancia</DialogTitle>
                    <DialogContent dividers>
                        <Typography gutterBottom>Curso: <strong>{selectedRowData?.["Nombre del curso"]}</strong></Typography>
                        <Typography gutterBottom>Estado actual: <strong>{originalInstanciaData?.estado_instancia}</strong></Typography>
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel id="select-new-estado-label">Nuevo Estado</InputLabel>
                            <Select labelId="select-new-estado-label" value={selectedEstado} label="Nuevo Estado" onChange={(e) => setSelectedEstado(e.target.value)}>
                                {allEstados.map((estado) => (<MenuItem key={estado.cod} value={estado.cod}>{estado.descripcion} ({estado.cod})</MenuItem>))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseEstadoModal}>Cancelar</Button>
                        <Button onClick={handleUpdateEstado} variant="contained" disabled={!selectedEstado || loadingEstado}>{loadingEstado ? <CircularProgress size={24} color="inherit" /> : "Confirmar Estado"}</Button>
                    </DialogActions>
                </Dialog>

                

                <Dialog open={otrosModalOpen} onClose={handleCloseOtrosModal} fullWidth maxWidth="xs">
                    <DialogTitle>Editar Cantidades</DialogTitle>
                    <DialogContent dividers>
                        <Typography gutterBottom>Curso: <strong>{selectedRowData?.["Nombre del curso"]}</strong></Typography>
                        <Stack spacing={2} sx={{ mt: 2 }}>
                            <TextField
                                label="Cantidad de Inscriptos"
                                type="number"
                                value={otrosEditable.cantidad_inscriptos}
                                onChange={(e) => setOtrosEditable({ ...otrosEditable, cantidad_inscriptos: e.target.value })}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label="Cantidad de Certificados"
                                type="number"
                                value={otrosEditable.cantidad_certificados}
                                onChange={(e) => setOtrosEditable({ ...otrosEditable, cantidad_certificados: e.target.value })}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseOtrosModal}>Cancelar</Button>
                        <Button onClick={async() => {
                            try {
                                setLoadingOtros(true);
                                const payload = {};
                                if (otrosEditable.cantidad_inscriptos !== originalInstanciaData.cantidad_inscriptos) {
                                    payload.cantidad_inscriptos = parseInt(otrosEditable.cantidad_inscriptos, 10);
                                }
                                if (otrosEditable.cantidad_certificados !== originalInstanciaData.cantidad_certificados) {
                                    payload.cantidad_certificados = parseInt(otrosEditable.cantidad_certificados, 10);
                                }
                                if (Object.keys(payload).length > 0) {
                                    await putInstancia(originalInstanciaData.curso, originalInstanciaData.fecha_inicio_curso, payload);
                                    setSuccessMessage('Cantidades modificadas con éxito');
                                } else {
                                    setSuccessMessage('No se realizaron cambios.');
                                }
                                fetchData();
                            } catch(err) {
                                setError('Error al modificar las cantidades.');
                                console.error(err);
                            } finally {
                                setLoadingOtros(false);
                                handleCloseOtrosModal();
                                setModalOpen(false);
                            }
                        }} 
                        variant="contained" 
                        disabled={loadingOtros}
                        >{loadingOtros ? <CircularProgress size={24} color="inherit" /> : "Confirmar"}</Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={autogestionadoConfirmOpen} onClose={() => setAutogestionadoConfirmOpen(false)}>
                    <DialogTitle>Confirmar Cambio</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Está a punto de cambiar el estado 'Es Autogestionado' de 
                            <strong> {formatBooleanToSiNo(originalInstanciaData?.es_autogestionado)} </strong> a 
                            <strong> {formatBooleanToSiNo(!originalInstanciaData?.es_autogestionado)}</strong>.
                        </Typography>
                        <Typography sx={{mt: 2}}>¿Desea confirmar esta acción?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setAutogestionadoConfirmOpen(false)}>Cancelar</Button>
                        <Button onClick={handleConfirmToggleAutogestionado} variant="contained" color="primary">Confirmar</Button>
                    </DialogActions>
                </Dialog>

              
            </div>
        </LocalizationProvider>
    );
};

export default CronogramaGAReducido;