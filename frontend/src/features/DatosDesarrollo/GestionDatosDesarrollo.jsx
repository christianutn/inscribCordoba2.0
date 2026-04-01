import React, { useState, useMemo } from 'react';
import {
    Box, Button, Alert, CircularProgress, Snackbar,
    TextField, InputAdornment, Typography, Chip, Paper,
    FormControl, InputLabel, Select, MenuItem, IconButton
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CodeIcon from '@mui/icons-material/Code';
import useDatosDesarrollo from './hooks/useDatosDesarrollo';
import DatosDesarrolloTable from './components/DatosDesarrolloTable';
import DatosDesarrolloModal from './components/DatosDesarrolloModal';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';

const MESES = [
    '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const GestionDatosDesarrollo = () => {
    const {
        data, loading, error,
        createItem, updateItem, deleteItem,
        auxiliaryData
    } = useDatosDesarrollo();

    const [modalOpen, setModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const [searchTerm, setSearchTerm] = useState('');
    const [desdeMes, setDesdeMes] = useState('');
    const [desdeAnio, setDesdeAnio] = useState('');
    const [hastaMes, setHastaMes] = useState('');
    const [hastaAnio, setHastaAnio] = useState('');



    // Build a map cuil -> { nombre, apellido } for quick lookup
    const usuariosMap = useMemo(() => {
        const map = {};
        (auxiliaryData?.usuarios || []).forEach(u => {
            const persona = u?.detalle_persona || {};
            map[u.cuil] = { nombre: persona.nombre || '', apellido: persona.apellido || '' };
        });
        return map;
    }, [auxiliaryData?.usuarios]);

    const filteredData = useMemo(() => {
        let result = data;

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

        // Apply period range filter
        if (desdeMes && desdeAnio) {
            const desdeValue = parseInt(desdeAnio) * 12 + parseInt(desdeMes);
            result = result.filter(item => (item.anio * 12 + item.mes) >= desdeValue);
        }

        if (hastaMes && hastaAnio) {
            const hastaValue = parseInt(hastaAnio) * 12 + parseInt(hastaMes);
            result = result.filter(item => (item.anio * 12 + item.mes) <= hastaValue);
        }

        return result;
    }, [data, searchTerm, usuariosMap, desdeMes, desdeAnio, hastaMes, hastaAnio]);

    // Summary stats
    const stats = useMemo(() => {
        const totalModificadas = filteredData.reduce((sum, r) => sum + (r.lineas_cod_modificadas || 0), 0);
        const totalEliminadas = filteredData.reduce((sum, r) => sum + (r.lineas_cod_eliminadas || 0), 0);
        return { total: filteredData.length, totalModificadas, totalEliminadas };
    }, [filteredData]);

    const handleCreate = () => {
        setCurrentRecord(null);
        setModalOpen(true);
    };

    const handleEdit = (record) => {
        setCurrentRecord(record);
        setModalOpen(true);
    };

    const handleDeleteRequest = (record) => {
        setRecordToDelete(record);
        setDeleteDialogOpen(true);
    };

    const handleSave = async (formData) => {
        let result;
        if (currentRecord) {
            result = await updateItem(currentRecord.id, formData);
        } else {
            result = await createItem(formData);
        }

        if (result.success) {
            setNotification({
                open: true,
                message: `Registro ${currentRecord ? 'actualizado' : 'creado'} correctamente`,
                severity: 'success'
            });
            setModalOpen(false);
        } else {
            setNotification({ open: true, message: result.error, severity: 'error' });
        }
    };

    const handleDeleteConfirm = async (id) => {
        const result = await deleteItem(id);
        if (result.success) {
            setNotification({
                open: true,
                message: 'Registro eliminado correctamente',
                severity: 'success'
            });
        } else {
            setNotification({ open: true, message: result.error, severity: 'error' });
        }
        setDeleteDialogOpen(false);
        setRecordToDelete(null);
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    if (loading && data.length === 0) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ mt: 2 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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

            {/* Filters Row */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>Desde:</Typography>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Mes</InputLabel>
                            <Select
                                value={desdeMes}
                                label="Mes"
                                onChange={(e) => setDesdeMes(e.target.value)}
                            >
                                <MenuItem value=""><em>Ninguno</em></MenuItem>
                                {MESES.slice(1).map((m, i) => <MenuItem key={m} value={i + 1}>{m}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 100 }}>
                            <InputLabel>Año</InputLabel>
                            <Select
                                value={desdeAnio}
                                label="Año"
                                onChange={(e) => setDesdeAnio(e.target.value)}
                            >
                                <MenuItem value=""><em>Ninguno</em></MenuItem>
                                {[2024, 2025, 2026, 2027].map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>Hasta:</Typography>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Mes</InputLabel>
                            <Select
                                value={hastaMes}
                                label="Mes"
                                onChange={(e) => setHastaMes(e.target.value)}
                            >
                                <MenuItem value=""><em>Ninguno</em></MenuItem>
                                {MESES.slice(1).map((m, i) => <MenuItem key={m} value={i + 1}>{m}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 100 }}>
                            <InputLabel>Año</InputLabel>
                            <Select
                                value={hastaAnio}
                                label="Año"
                                onChange={(e) => setHastaAnio(e.target.value)}
                            >
                                <MenuItem value=""><em>Ninguno</em></MenuItem>
                                {[2024, 2025, 2026, 2027].map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
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
                    onClick={handleCreate}
                    disableElevation
                >
                    Nuevo Registro
                </Button>
            </Box>

            <DatosDesarrolloTable
                data={filteredData}
                usuarios={auxiliaryData?.usuarios || []}
                onEdit={handleEdit}
                onDelete={handleDeleteRequest}
            />

            <DatosDesarrolloModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                record={currentRecord}
                auxiliaryData={auxiliaryData}
            />

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onClose={() => { setDeleteDialogOpen(false); setRecordToDelete(null); }}
                onConfirm={handleDeleteConfirm}
                record={recordToDelete}
            />

            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default GestionDatosDesarrollo;
