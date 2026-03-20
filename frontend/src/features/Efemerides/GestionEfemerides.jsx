import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box, Typography, Card, TextField, Button, IconButton,
    Autocomplete, CircularProgress, Alert, Snackbar, Divider,
    Chip, Tooltip, Fade, Paper, Stack, useTheme, alpha,
    Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    InputAdornment, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SendIcon from '@mui/icons-material/Send';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import EventNoteIcon from '@mui/icons-material/EventNote';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import DescriptionIcon from '@mui/icons-material/Description';
import SaveIcon from '@mui/icons-material/Save';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';

import { getCursos } from '../../services/cursos.service.js';
import { postEfemerides, getEfemerides, deleteEfemeride, putEfemeride } from '../../services/efemerides.service.js';

/**
 * GestionEfemerides - Componente para gestionar fechas conmemorativas por curso.
 * @param {string} modo - "carga" (Principal) o "gestion" (MainGestion)
 * @param {object} user - Objeto de usuario logueado
 */
const GestionEfemerides = ({ modo = "carga", user }) => {
    const theme = useTheme();
    const isADM = user?.rol === 'ADM';

    // --- Estado para el formulario de carga ---
    const [cursos, setCursos] = useState([]);
    const [cursosLoading, setCursosLoading] = useState(false);
    const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
    const [inputCurso, setInputCurso] = useState('');
    const [efemeridesForm, setEfemeridesForm] = useState([{ fecha: '', descripcion: '' }]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Estado para la lista de efemérides ---
    const [efemeridesExistentes, setEfemeridesExistentes] = useState([]);
    const [loadingList, setLoadingList] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear().toString());
    const [filtroMes, setFiltroMes] = useState('');

    // --- Estado para notificaciones ---
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    // --- Estado para diálogo de confirmación de eliminación ---
    const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, descripcion: '' });

    // --- Estado para diálogo de edición ---
    const [editDialog, setEditDialog] = useState({
        open: false,
        id: null,
        data: {
            curso: null, // Objeto de curso {cod, nombre}
            fecha: '',
            descripcion: '',
            observacion: '',
            url_disenio: ''
        }
    });
    const [isUpdating, setIsUpdating] = useState(false);

    // --- Cargar cursos al montar o cuando el input cambia ---
    const fetchCursos = useCallback(async (busqueda = '') => {
        setCursosLoading(true);
        try {
            const data = await getCursos(busqueda);
            setCursos(data);
        } catch (error) {
            console.error("Error al cargar cursos:", error);
        } finally {
            setCursosLoading(false);
        }
    }, []);

    // Debounce para búsqueda de cursos
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCursos(inputCurso);
        }, 300);
        return () => clearTimeout(timer);
    }, [inputCurso, fetchCursos]);

    // --- Cargar efemérides existentes al montar ---
    const fetchEfemerides = useCallback(async () => {
        setLoadingList(true);
        try {
            const data = await getEfemerides();
            setEfemeridesExistentes(data);
        } catch (error) {
            console.error("Error al cargar efemérides:", error);
            setNotification({ open: true, message: "Error al cargar las efemérides", severity: 'error' });
        } finally {
            setLoadingList(false);
        }
    }, []);

    useEffect(() => {
        fetchEfemerides();
    }, [fetchEfemerides]);

    // --- Manejo de filas dinámicas de efemérides ---
    const handleAddRow = () => {
        setEfemeridesForm(prev => [...prev, { fecha: '', descripcion: '' }]);
    };

    const handleRemoveRow = (index) => {
        if (efemeridesForm.length <= 1) return;
        setEfemeridesForm(prev => prev.filter((_, i) => i !== index));
    };

    const handleFieldChange = (index, field, value) => {
        setEfemeridesForm(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    // --- Validación del formulario ---
    const isFormValid = useMemo(() => {
        if (!cursoSeleccionado) return false;
        return efemeridesForm.every(ef => ef.fecha && ef.descripcion.trim());
    }, [cursoSeleccionado, efemeridesForm]);

    // --- Enviar formulario ---
    const handleSubmit = async () => {
        if (!isFormValid || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const payload = {
                curso: cursoSeleccionado.cod,
                efemerides: efemeridesForm.map(ef => ({
                    fecha: ef.fecha,
                    descripcion: ef.descripcion.trim()
                }))
            };

            await postEfemerides(payload);

            setNotification({
                open: true,
                message: `Se crearon ${efemeridesForm.length} efeméride(s) correctamente`,
                severity: 'success'
            });

            // Reset form
            setCursoSeleccionado(null);
            setInputCurso('');
            setEfemeridesForm([{ fecha: '', descripcion: '' }]);

            fetchEfemerides();
        } catch (error) {
            setNotification({
                open: true,
                message: error.message || "Error al crear las efemérides",
                severity: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- ELIMINACIÓN ---
    const handleDeleteClick = (id, descripcion) => {
        setDeleteDialog({ open: true, id, descripcion });
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteEfemeride(deleteDialog.id);
            setNotification({ open: true, message: "Efeméride eliminada correctamente", severity: 'success' });
            fetchEfemerides();
        } catch (error) {
            setNotification({ open: true, message: error.message || "Error al eliminar", severity: 'error' });
        } finally {
            setDeleteDialog({ open: false, id: null, descripcion: '' });
        }
    };

    // --- EDICIÓN ---
    const handleEditClick = (ef) => {
        setEditDialog({
            open: true,
            id: ef.id,
            data: {
                curso: ef.detalle_curso ? { cod: ef.detalle_curso.cod, nombre: ef.detalle_curso.nombre } : { cod: ef.curso, nombre: ef.curso },
                fecha: ef.fecha,
                descripcion: ef.descripcion,
                observacion: ef.observacion || '',
                url_disenio: ef.url_disenio || ''
            }
        });
    };

    const handleSaveEdit = async () => {
        const { id, data } = editDialog;
        if (!data.fecha || !data.descripcion.trim() || !data.curso) return;

        setIsUpdating(true);
        try {
            const payload = {
                curso: data.curso.cod,
                fecha: data.fecha,
                descripcion: data.descripcion.trim(),
                observacion: data.observacion.trim() || null,
                url_disenio: data.url_disenio.trim() || null
            };

            await putEfemeride(id, payload);
            setNotification({ open: true, message: "Efeméride actualizada correctamente", severity: 'success' });
            setEditDialog({ ...editDialog, open: false });
            fetchEfemerides();
        } catch (error) {
            setNotification({ open: true, message: error.message || "Error al actualizar", severity: 'error' });
        } finally {
            setIsUpdating(false);
        }
    };

    // --- Filtrado de la lista ---
    const filteredEfemerides = useMemo(() => {
        let list = efemeridesExistentes;

        // Filtro por año
        if (filtroAnio) {
            list = list.filter(ef => ef.fecha?.startsWith(filtroAnio));
        }

        // Filtro por mes
        if (filtroMes) {
            list = list.filter(ef => {
                const parts = ef.fecha?.split('-');
                return parts && parts[1] === filtroMes;
            });
        }

        // Filtro por texto
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            list = list.filter(ef =>
                ef.descripcion?.toLowerCase().includes(lower) ||
                ef.curso?.toLowerCase().includes(lower) ||
                ef.detalle_curso?.nombre?.toLowerCase().includes(lower) ||
                ef.fecha?.includes(lower)
            );
        }

        return list;
    }, [efemeridesExistentes, searchTerm, filtroAnio, filtroMes]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setFiltroAnio('');
        setFiltroMes('');
    };

    const anosDisponibles = useMemo(() => {
        const anos = new Set();
        efemeridesExistentes.forEach(ef => {
            if (ef.fecha) anos.add(ef.fecha.split('-')[0]);
        });
        // Asegurar que el año actual esté si no hay efemérides
        anos.add(new Date().getFullYear().toString());
        return Array.from(anos).sort((a, b) => b - a);
    }, [efemeridesExistentes]);

    const meses = [
        { val: '01', label: 'Enero' }, { val: '02', label: 'Febrero' }, { val: '03', label: 'Marzo' },
        { val: '04', label: 'Abril' }, { val: '05', label: 'Mayo' }, { val: '06', label: 'Junio' },
        { val: '07', label: 'Julio' }, { val: '08', label: 'Agosto' }, { val: '09', label: 'Septiembre' },
        { val: '10', label: 'Octubre' }, { val: '11', label: 'Noviembre' }, { val: '12', label: 'Diciembre' }
    ];

    // --- Formatear fecha para display ---
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    return (
        <Box sx={{ mt: 1 }}>
            {/* ===== FORMULARIO DE CARGA (Solo Visible en modo carga) ===== */}
            {modo === "carga" && (
                <Card
                    elevation={0}
                    sx={{
                        p: { xs: 2, sm: 3, md: 4 },
                        borderRadius: 3,
                        border: `1px solid ${theme.palette.divider}`,
                        background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                        mb: 4,
                        position: 'relative',
                        overflow: 'visible',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                                Cargar Efemérides
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.3 }}>
                                Registre fechas conmemorativas para uno o más cursos
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {/* Selector de curso */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                            Curso
                        </Typography>
                        <Autocomplete
                            options={cursos}
                            getOptionLabel={(option) => option.nombre || ''}
                            value={cursoSeleccionado}
                            onChange={(event, newValue) => setCursoSeleccionado(newValue)}
                            inputValue={inputCurso}
                            onInputChange={(event, newInputValue) => setInputCurso(newInputValue)}
                            loading={cursosLoading}
                            isOptionEqualToValue={(option, value) => option.cod === value.cod}
                            noOptionsText="No se encontraron cursos"
                            loadingText="Buscando cursos..."
                            disabled={isSubmitting}
                            renderOption={(props, option) => (
                                <li {...props} key={option.cod}>
                                    <Typography variant="body2" sx={{ color: 'black' }}>{option.nombre}</Typography>
                                </li>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Seleccione un curso"
                                    placeholder="Escriba para buscar un curso..."
                                    variant="outlined"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {cursosLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                        />
                    </Box>

                    {/* Dinámico rows */}
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                Fechas conmemorativas ({efemeridesForm.length})
                            </Typography>
                            <IconButton onClick={handleAddRow} color="primary" disabled={isSubmitting} size="small">
                                <AddCircleOutlineIcon />
                            </IconButton>
                        </Box>

                        <Stack spacing={2}>
                            {efemeridesForm.map((efemeride, index) => (
                                <Paper key={index} elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.8)}`, display: 'flex', gap: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 32, height: 32, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, fontWeight: 700 }}>
                                        {index + 1}
                                    </Box>
                                    <Box sx={{ flex: 1, display: 'flex', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                                        <TextField label="Fecha" type="date" value={efemeride.fecha} onChange={(e) => handleFieldChange(index, 'fecha', e.target.value)} InputLabelProps={{ shrink: true }} disabled={isSubmitting} size="small" fullWidth />
                                        <TextField label="Descripción" value={efemeride.descripcion} onChange={(e) => handleFieldChange(index, 'descripcion', e.target.value)} disabled={isSubmitting} size="small" fullWidth multiline />
                                    </Box>
                                    {efemeridesForm.length > 1 && (
                                        <IconButton onClick={() => handleRemoveRow(index)} disabled={isSubmitting} size="small" color="error">
                                            <RemoveCircleOutlineIcon />
                                        </IconButton>
                                    )}
                                </Paper>
                            ))}
                        </Stack>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={!isFormValid || isSubmitting}
                            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                        >
                            Guardar Efemérides
                        </Button>
                    </Box>
                </Card>
            )}

            {/* ===== LISTA DE EFEMÉRIDES EXISTENTES ===== */}
            <Card elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <DescriptionIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {modo === "carga" ? "Efemérides Registradas" : "Gestión de Efemérides"}
                        </Typography>
                        <Chip label={filteredEfemerides.length} size="small" color="primary" variant="outlined" />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Filtro Año */}
                        <FormControl size="small" sx={{ minWidth: 100 }}>
                            <InputLabel id="filtro-anio-label">Año</InputLabel>
                            <Select
                                labelId="filtro-anio-label"
                                value={filtroAnio}
                                label="Año"
                                onChange={(e) => setFiltroAnio(e.target.value)}
                                sx={{ borderRadius: 2 }}
                            >
                                <MenuItem value=""><em>Todos</em></MenuItem>
                                {anosDisponibles.map(anio => (
                                    <MenuItem key={anio} value={anio}>{anio}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Filtro Mes */}
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel id="filtro-mes-label">Mes</InputLabel>
                            <Select
                                labelId="filtro-mes-label"
                                value={filtroMes}
                                label="Mes"
                                onChange={(e) => setFiltroMes(e.target.value)}
                                sx={{ borderRadius: 2 }}
                            >
                                <MenuItem value=""><em>Todos</em></MenuItem>
                                {meses.map(m => (
                                    <MenuItem key={m.val} value={m.val}>{m.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            placeholder="Buscar..."
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{
                                width: { xs: '100%', sm: 200 },
                                '& .MuiOutlinedInput-root': { borderRadius: 2 }
                            }}
                            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                        />

                        <Tooltip title="Limpiar filtros" arrow>
                            <IconButton onClick={handleClearFilters} color="warning" size="small" sx={{ bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
                                <FilterAltOffIcon />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Refrescar lista" arrow>
                            <IconButton onClick={fetchEfemerides} disabled={loadingList} color="primary" size="small">
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {loadingList ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                ) : (
                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, maxHeight: 500 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ color: 'black', fontWeight: 700 }}>Fecha</TableCell>
                                    <TableCell sx={{ color: 'black', fontWeight: 700 }}>Curso</TableCell>
                                    <TableCell sx={{ color: 'black', fontWeight: 700 }}>Descripción</TableCell>
                                    <TableCell sx={{ color: 'black', fontWeight: 700 }}>Observación</TableCell>
                                    <TableCell sx={{ color: 'black', fontWeight: 700 }}>Diseño</TableCell>
                                    <TableCell sx={{ color: 'black', fontWeight: 700 }}>Registrado</TableCell>
                                    {modo === "gestion" && <TableCell align="center" sx={{ color: 'black', fontWeight: 700 }}>Acciones</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredEfemerides.map((ef) => (
                                    <TableRow key={ef.id}>
                                        <TableCell sx={{ color: 'black' }}>{formatDate(ef.fecha)}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ color: 'black', fontWeight: 600 }}>{ef.detalle_curso?.nombre || ef.curso}</Typography>
                                            <Typography variant="caption" sx={{ color: 'black', opacity: 0.7 }}>{ef.curso}</Typography>
                                        </TableCell>
                                        <TableCell sx={{ color: 'black' }}>{ef.descripcion}</TableCell>
                                        <TableCell sx={{ color: 'black' }}>{ef.observacion || '-'}</TableCell>
                                        <TableCell sx={{ color: 'black' }}>
                                            {ef.url_disenio ? (
                                                <Tooltip title="Ver diseño" arrow>
                                                    <IconButton
                                                        size="small"
                                                        component="a"
                                                        href={ef.url_disenio.startsWith('http') ? ef.url_disenio : `https://${ef.url_disenio}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        sx={{ color: theme.palette.primary.main }}
                                                    >
                                                        <OpenInNewIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell sx={{ color: 'black', fontSize: '0.75rem' }}>{ef.created_at || '-'}</TableCell>
                                        {modo === "gestion" && (
                                            <TableCell align="center">
                                                <Stack direction="row" spacing={0.5} justifyContent="center">
                                                    <Tooltip title={isADM ? "Editar" : "Solo ADM"} arrow>
                                                        <span>
                                                            <IconButton size="small" onClick={() => handleEditClick(ef)} disabled={!isADM} sx={{ color: theme.palette.info.main }}>
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                    <Tooltip title={isADM ? "Eliminar" : "Solo ADM"} arrow>
                                                        <span>
                                                            <IconButton size="small" onClick={() => handleDeleteClick(ef.id, ef.descripcion)} disabled={!isADM} sx={{ color: theme.palette.error.main }}>
                                                                <DeleteOutlineIcon fontSize="small" />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Card>

            {/* ===== DIÁLOGO DE EDICIÓN (Solo para modo gestion y rol ADM) ===== */}
            <Dialog open={editDialog.open} onClose={() => !isUpdating && setEditDialog({ ...editDialog, open: false })} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Modificar Efeméride</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <Autocomplete
                            options={cursos}
                            getOptionLabel={(option) => option.nombre || ''}
                            value={editDialog.data.curso}
                            onChange={(e, val) => setEditDialog({ ...editDialog, data: { ...editDialog.data, curso: val } })}
                            renderInput={(params) => <TextField {...params} label="Curso" required />}
                            renderOption={(props, option) => (
                                <li {...props} key={option.cod}>
                                    <Typography variant="body2" sx={{ color: 'black' }}>{option.nombre}</Typography>
                                </li>
                            )}
                        />
                        <TextField
                            label="Fecha"
                            type="date"
                            fullWidth
                            value={editDialog.data.fecha}
                            onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, fecha: e.target.value } })}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                        <TextField
                            label="Descripción"
                            fullWidth
                            multiline
                            minRows={2}
                            value={editDialog.data.descripcion}
                            onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, descripcion: e.target.value } })}
                            required
                        />
                        <TextField
                            label="Observación"
                            fullWidth
                            multiline
                            value={editDialog.data.observacion}
                            onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, observacion: e.target.value } })}
                        />
                        <TextField
                            label="URL Diseño"
                            fullWidth
                            value={editDialog.data.url_disenio}
                            onChange={(e) => setEditDialog({ ...editDialog, data: { ...editDialog.data, url_disenio: e.target.value } })}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setEditDialog({ ...editDialog, open: false })} disabled={isUpdating}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveEdit}
                        disabled={isUpdating || !editDialog.data.fecha || !editDialog.data.descripcion.trim()}
                        startIcon={isUpdating ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    >
                        Guardar Cambios
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ===== DIÁLOGO DE ELIMINACIÓN ===== */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null, descripcion: '' })}>
                <DialogTitle sx={{ fontWeight: 600 }}>Confirmar Eliminación</DialogTitle>
                <DialogContent>
                    <DialogContentText>¿Desea eliminar <strong>"{deleteDialog.descripcion}"</strong>?</DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDeleteDialog({ open: false, id: null, descripcion: '' })}>Cancelar</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">Eliminar</Button>
                </DialogActions>
            </Dialog>

            {/* ===== NOTIFICACIÓN ===== */}
            <Snackbar
                open={notification.open} autoHideDuration={5000}
                onClose={() => setNotification({ ...notification, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={notification.severity} sx={{ borderRadius: 2 }} variant="filled">
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default GestionEfemerides;
