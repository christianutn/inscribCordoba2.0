import React, { useState, useMemo } from 'react';
import {
    Box, Alert, CircularProgress, Snackbar,
    TextField, InputAdornment, Dialog, DialogTitle,
    DialogContent, DialogContentText, DialogActions,
    Typography, Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import useEventoYCurso from './hooks/useEventoYCurso';
import EventoYCursoTable from './components/EventoYCursoTable';
import EventoYCursoModal from './components/EventoYCursoModal';

const GestionEventoYCurso = () => {
    const {
        data, loading, error,
        updateItem, deleteItem,
        auxiliaryData
    } = useEventoYCurso();

    const [modalOpen, setModalOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);

    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        const lowerSearch = searchTerm.toLowerCase();
        return data.filter(item =>
            (item.curso && item.curso.toLowerCase().includes(lowerSearch)) ||
            (item.detalle_curso?.nombre && item.detalle_curso.nombre.toLowerCase().includes(lowerSearch)) ||
            (item.presentacion && item.presentacion.toLowerCase().includes(lowerSearch))
        );
    }, [data, searchTerm]);

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
            const result = await deleteItem(recordToDelete.curso);
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
            setNotification({
                open: true,
                message: 'Evento y curso actualizados correctamente',
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
                Gestión de Eventos
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
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
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCancelDelete}
            >
                <DialogTitle>Confirmar Eliminación</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Está seguro que desea eliminar el evento del curso <strong>{recordToDelete?.detalle_curso?.nombre || recordToDelete?.curso}</strong>?
                        Esta acción no se puede deshacer.
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
