import React, { useState, useMemo } from 'react';
import {
    Box, Alert, CircularProgress, Snackbar,
    TextField, InputAdornment, Dialog, DialogTitle,
    DialogContent, DialogContentText, DialogActions,
    Typography, Button, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import useEventoYCurso from './hooks/useEventoYCurso';
import EventoYCursoTable from './components/EventoYCursoTable';
import EventoYCursoModal from './components/EventoYCursoModal';
import ModalCrearCurso from '../../components/NotaDeAutorizacion/Modals/ModalCrearCurso';

const GestionEventoYCurso = () => {
    const {
        data, loading, error,
        updateItem, deleteItem,
        refreshData, auxiliaryData
    } = useEventoYCurso();

    const [modalOpen, setModalOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [filter, setFilter] = useState('todos');
    const [crearCursoModalOpen, setCrearCursoModalOpen] = useState(false);

    const filteredData = useMemo(() => {
        let result = data;

        // Filtrar por estado de evento basado en el atributo tiene_evento_creado de la tabla cursos
        if (filter === 'conEvento') {
            result = result.filter(item => item.tiene_evento_creado == 1);
        } else if (filter === 'sinEvento') {
            result = result.filter(item => !item.tiene_evento_creado || item.tiene_evento_creado == 0);
        }

        // Filtrar por búsqueda de texto
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(item =>
                (item.cod && item.cod.toLowerCase().includes(lowerSearch)) ||
                (item.nombre && item.nombre.toLowerCase().includes(lowerSearch)) ||
                (item.detalle_evento?.presentacion && item.detalle_evento.presentacion.toLowerCase().includes(lowerSearch))
            );
        }

        return result;
    }, [data, searchTerm, filter]);

    const handleEdit = (record) => {
        setCurrentRecord(record);
        setModalOpen(true);
    };

    const handleDeleteClick = (record) => {
        setRecordToDelete(record);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (recordToDelete) {
            const result = await deleteItem(recordToDelete.cod);
            if (result.success) {
                setNotification({
                    open: true,
                    message: 'Evento eliminado correctamente',
                    severity: 'success'
                });
            } else {
                setNotification({ open: true, message: result.error, severity: 'error' });
            }
        }
        setDeleteDialogOpen(false);
        setRecordToDelete(null);
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setRecordToDelete(null);
    };

    const handleSave = async (formData) => {
        const result = await updateItem(formData);

        if (result.success) {
            const message = formData.tieneEvento
                ? 'Evento y curso actualizados correctamente'
                : (formData.perfil && formData.area_tematica && formData.tipo_certificacion)
                    ? 'Evento creado y curso actualizado correctamente'
                    : 'Curso actualizado correctamente';

            setNotification({
                open: true,
                message,
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
            <Typography variant="h5" gutterBottom>
                Gestión de Eventos y Cursos
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <TextField
                    placeholder="Buscar por código, nombre o presentación..."
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: 400 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <ToggleButtonGroup
                        value={filter}
                        exclusive
                        onChange={(e, newFilter) => {
                            if (newFilter !== null) setFilter(newFilter);
                        }}
                        size="small"
                    >
                        <ToggleButton value="todos">Todos</ToggleButton>
                        <ToggleButton value="conEvento">Con Evento</ToggleButton>
                        <ToggleButton value="sinEvento">Sin Evento</ToggleButton>
                    </ToggleButtonGroup>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => setCrearCursoModalOpen(true)}
                    >
                        Nuevo Curso
                    </Button>
                </Box>
            </Box>

            <EventoYCursoTable
                data={filteredData}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
            />

            <EventoYCursoModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                record={currentRecord}
                auxiliaryData={auxiliaryData}
                filter={filter}
            />

            <ModalCrearCurso
                open={crearCursoModalOpen}
                onClose={() => setCrearCursoModalOpen(false)}
                onSuccess={(msg) => {
                    setNotification({ open: true, message: msg, severity: 'success' });
                    refreshData();
                }}
                areas={auxiliaryData.areas}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCancelDelete}
            >
                <DialogTitle>Confirmar Eliminación</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Está seguro que desea eliminar el evento del curso <strong>{recordToDelete?.nombre || recordToDelete?.cod}</strong>?
                        Esta acción no se puede deshacer. El curso se mantendrá pero sin evento asociado.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete} color="secondary">
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>

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

export default GestionEventoYCurso;
