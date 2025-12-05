import React, { useState, useMemo } from 'react';
import { Box, Button, Alert, CircularProgress, Snackbar, TextField, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import useAsignacionesAreas from './hooks/useAsignacionesAreas';
import AsignacionesTable from './components/AsignacionesTable';
import AsignacionModal from './components/AsignacionModal';

const GestionAsignacionesAreas = () => {
    const {
        data, loading, error,
        createItem, deleteItem,
        auxiliaryData
    } = useAsignacionesAreas();

    const [modalOpen, setModalOpen] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        const lowerSearch = searchTerm.toLowerCase();
        return data.filter(item => {
            const cuil = item.detalle_usuario?.cuil ? String(item.detalle_usuario.cuil).toLowerCase() : '';
            const areaName = item.detalle_area?.nombre ? item.detalle_area.nombre.toLowerCase() : '';
            const areaCod = item.cod_area ? item.cod_area.toLowerCase() : '';
            const persona = item.detalle_usuario?.detalle_persona;
            const nombreUsuario = persona ? `${persona.nombre} ${persona.apellido}`.toLowerCase() : '';

            return cuil.includes(lowerSearch) || areaName.includes(lowerSearch) || areaCod.includes(lowerSearch) || nombreUsuario.includes(lowerSearch);
        });
    }, [data, searchTerm]);

    const handleCreate = () => {
        setModalOpen(true);
    };

    const handleDelete = async (record) => {
        if (window.confirm(`¿Está seguro de eliminar la asignación del área ${record.cod_area} para el usuario ${record.cuil_usuario}?`)) {
            const result = await deleteItem(record);
            if (result.success) {
                setNotification({ open: true, message: 'Asignación eliminada correctamente', severity: 'success' });
            } else {
                setNotification({ open: true, message: result.error, severity: 'error' });
            }
        }
    };

    const handleSave = async (formData) => {
        const result = await createItem(formData);

        if (result.success) {
            setNotification({
                open: true,
                message: 'Asignación creada correctamente',
                severity: 'success'
            });
            setModalOpen(false);
        } else {
            setNotification({ open: true, message: result.error, severity: 'error' });
        }
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

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                <TextField
                    placeholder="Buscar por CUIL, Nombre o Área..."
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: 350 }}
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
                >
                    Nueva Asignación
                </Button>
            </Box>

            <AsignacionesTable
                data={filteredData}
                onDelete={handleDelete}
            />

            <AsignacionModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                auxiliaryData={auxiliaryData}
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

export default GestionAsignacionesAreas;
