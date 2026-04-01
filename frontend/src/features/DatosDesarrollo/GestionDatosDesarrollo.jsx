import React, { useState, useMemo } from 'react';
import {
    Box, Button, Alert, CircularProgress, Snackbar,
    TextField, InputAdornment, Typography, Paper,
    FormControl, InputLabel, Select, MenuItem,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CodeIcon from '@mui/icons-material/Code';
import ClearIcon from '@mui/icons-material/Clear';
import { useDatosDesarrollo } from './hooks/useDatosDesarrollo';
import { getUsuarios } from '../../services/usuarios.service';
import DatosDesarrolloTable from './components/DatosDesarrolloTable';
import DatosDesarrolloModal from './components/DatosDesarrolloModal';

const MESES = [
    '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const ANIOS = [2024, 2025, 2026, 2027];

const GestionDatosDesarrollo = () => {
    const {
        datos, loading,
        handleCreate, handleUpdate, handleDelete,
        alert, setAlert,
        busqueda, setBusqueda
    } = useDatosDesarrollo();

    const [usuarios, setUsuarios] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingData, setEditingData] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState({ open: false, row: null });
    const [searchTerm, setSearchTerm] = useState('');
    const [desdeMes, setDesdeMes] = useState('');
    const [desdeAnio, setDesdeAnio] = useState('');
    const [hastaMes, setHastaMes] = useState('');
    const [hastaAnio, setHastaAnio] = useState('');

    // Cargar usuarios para la tabla y el modal
    React.useEffect(() => {
        getUsuarios()
            .then(setUsuarios)
            .catch(err => console.error('Error al cargar usuarios:', err));
    }, []);

    // Build a map cuil -> { nombre, apellido } for quick lookup
    const usuariosMap = useMemo(() => {
        const map = {};
        usuarios.forEach(u => {
            const persona = u?.detalle_persona || {};
            map[u.cuil] = { nombre: persona.nombre || '', apellido: persona.apellido || '' };
        });
        return map;
    }, [usuarios]);

    const filteredData = useMemo(() => {
        let result = datos || [];

        // Apply search term filter
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(item => {
                const cuil = item.cuil ? String(item.cuil).toLowerCase() : '';
                const user = usuariosMap[item.cuil];
                const nombre = user?.nombre ? user.nombre.toLowerCase() : '';
                const apellido = user?.apellido ? user.apellido.toLowerCase() : '';
                const mes = item.mes ? MESES[item.mes].toLowerCase() : '';
                const anio = item.anio ? String(item.anio) : '';
                const obs = item.observaciones ? item.observaciones.toLowerCase() : '';
                return cuil.includes(lowerSearch) || nombre.includes(lowerSearch) ||
                    apellido.includes(lowerSearch) || mes.includes(lowerSearch) ||
                    anio.includes(lowerSearch) || obs.includes(lowerSearch);
            });
        }

        // Apply period range filter (desde)
        if (desdeMes && desdeAnio) {
            const desdeValue = parseInt(desdeAnio) * 12 + parseInt(desdeMes);
            result = result.filter(item => (item.anio * 12 + item.mes) >= desdeValue);
        }

        // Apply period range filter (hasta)
        if (hastaMes && hastaAnio) {
            const hastaValue = parseInt(hastaAnio) * 12 + parseInt(hastaMes);
            result = result.filter(item => (item.anio * 12 + item.mes) <= hastaValue);
        }

        return result;
    }, [datos, searchTerm, usuariosMap, desdeMes, desdeAnio, hastaMes, hastaAnio]);

    // Summary stats based on filtered data
    const stats = useMemo(() => {
        const totalModificadas = filteredData.reduce((sum, r) => sum + (r.lineas_cod_modificadas || 0), 0);
        const totalEliminadas = filteredData.reduce((sum, r) => sum + (r.lineas_cod_eliminadas || 0), 0);
        return { total: filteredData.length, totalModificadas, totalEliminadas };
    }, [filteredData]);

    const handleOpenModal = (data = null) => {
        setEditingData(data);
        setModalOpen(true);
    };

    const handleSave = async (formData) => {
        try {
            if (editingData) {
                await handleUpdate(editingData.id, formData);
                setAlert({ open: true, message: 'Registro actualizado correctamente', severity: 'success' });
            } else {
                await handleCreate(formData);
                setAlert({ open: true, message: 'Registro creado correctamente', severity: 'success' });
            }
            setModalOpen(false);
        } catch (err) {
            setAlert({ open: true, message: err.message || 'Error al guardar', severity: 'error' });
        }
    };

    const handleDeleteRow = (row) => {
        setConfirmDelete({ open: true, row });
    };

    const handleConfirmDelete = async () => {
        if (confirmDelete.row) {
            await handleDelete(confirmDelete.row.id);
            setConfirmDelete({ open: false, row: null });
        }
    };

    const handleCloseNotification = () => {
        setAlert(prev => ({ ...prev, open: false }));
    };

    if (loading && (!datos || datos.length === 0)) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ mt: 2 }}>
            {/* Stats Bar */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Paper variant="outlined" sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1, borderRadius: 2 }}>
                    <CodeIcon fontSize="small" color="primary" />
                    <Box>
                        <Typography variant="caption" color="text.secondary">Registros</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1 }}>{stats.total}</Typography>
                    </Box>
                </Paper>
                <Paper variant="outlined" sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1, borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main', fontFamily: 'monospace' }}>+</Typography>
                    <Box>
                        <Typography variant="caption" color="text.secondary">Total Modificadas</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1, color: 'success.dark' }}>
                            {stats.totalModificadas.toLocaleString()}
                        </Typography>
                    </Box>
                </Paper>
                <Paper variant="outlined" sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1, borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main', fontFamily: 'monospace' }}>−</Typography>
                    <Box>
                        <Typography variant="caption" color="text.secondary">Total Eliminadas</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1, color: 'error.dark' }}>
                            {stats.totalEliminadas.toLocaleString()}
                        </Typography>
                    </Box>
                </Paper>
            </Box>

            {/* Period Range Filter */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>Desde:</Typography>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Mes</InputLabel>
                            <Select value={desdeMes} label="Mes" onChange={(e) => setDesdeMes(e.target.value)}>
                                <MenuItem value=""><em>Ninguno</em></MenuItem>
                                {MESES.slice(1).map((m, i) => <MenuItem key={m} value={i + 1}>{m}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 100 }}>
                            <InputLabel>Año</InputLabel>
                            <Select value={desdeAnio} label="Año" onChange={(e) => setDesdeAnio(e.target.value)}>
                                <MenuItem value=""><em>Ninguno</em></MenuItem>
                                {ANIOS.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>Hasta:</Typography>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Mes</InputLabel>
                            <Select value={hastaMes} label="Mes" onChange={(e) => setHastaMes(e.target.value)}>
                                <MenuItem value=""><em>Ninguno</em></MenuItem>
                                {MESES.slice(1).map((m, i) => <MenuItem key={m} value={i + 1}>{m}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 100 }}>
                            <InputLabel>Año</InputLabel>
                            <Select value={hastaAnio} label="Año" onChange={(e) => setHastaAnio(e.target.value)}>
                                <MenuItem value=""><em>Ninguno</em></MenuItem>
                                {ANIOS.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Box>

                    {(desdeMes || desdeAnio || hastaMes || hastaAnio) && (
                        <Button
                            size="small"
                            startIcon={<ClearIcon />}
                            onClick={() => {
                                setDesdeMes('');
                                setDesdeAnio('');
                                setHastaMes('');
                                setHastaAnio('');
                            }}
                        >
                            Limpiar Período
                        </Button>
                    )}
                </Box>
            </Paper>

            {/* Search & Create */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <TextField
                    placeholder="Buscar por Nombre, CUIL, Mes, Año..."
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: 380 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenModal()}
                    disableElevation
                >
                    Nuevo Registro
                </Button>
            </Box>

            <DatosDesarrolloTable
                data={filteredData}
                usuarios={usuarios}
                onEdit={handleOpenModal}
                onDelete={handleDeleteRow}
            />

            <DatosDesarrolloModal
                open={modalOpen}
                handleClose={() => setModalOpen(false)}
                handleSave={handleSave}
                editingData={editingData}
                usuarios={usuarios}
            />

            <Dialog
                open={confirmDelete.open}
                onClose={() => setConfirmDelete({ open: false, row: null })}
                aria-labelledby="confirm-delete-title"
                aria-describedby="confirm-delete-description"
            >
                <DialogTitle id="confirm-delete-title">
                    {"¿Estás seguro?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="confirm-delete-description">
                        No podrás revertir esto. El registro de desarrollo será eliminado permanentemente.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setConfirmDelete({ open: false, row: null })} 
                        color="error" // Matching original cancelButtonColor: '#d33'
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleConfirmDelete} 
                        color="primary" // Matching original confirmButtonColor: '#3085d6'
                        autoFocus
                    >
                        Sí, borrar!
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={alert.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseNotification} severity={alert.severity} sx={{ width: '100%' }}>
                    {alert.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default GestionDatosDesarrollo;
