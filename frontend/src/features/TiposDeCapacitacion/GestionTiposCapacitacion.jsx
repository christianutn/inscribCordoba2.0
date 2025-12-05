import React, { useState } from 'react';
import { Box, Button, Typography, Alert, Snackbar } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TiposCapacitacionTable from './components/TiposCapacitacionTable';
import TipoCapacitacionModal from './components/TipoCapacitacionModal';
import useTiposCapacitacion from './hooks/useTiposCapacitacion';

const GestionTiposCapacitacion = () => {
    const { tipos, loading, error, createTipo, updateTipo } = useTiposCapacitacion();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTipo, setSelectedTipo] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handleCreate = () => {
        setSelectedTipo(null);
        setModalOpen(true);
    };

    const handleEdit = (tipo) => {
        setSelectedTipo(tipo);
        setModalOpen(true);
    };

    const handleSave = async (formData) => {
        let success;
        if (selectedTipo) {
            success = await updateTipo(formData);
            if (success) {
                setSnackbar({ open: true, message: 'Tipo de capacitación actualizado correctamente', severity: 'success' });
            }
        } else {
            success = await createTipo(formData);
            if (success) {
                setSnackbar({ open: true, message: 'Tipo de capacitación creado correctamente', severity: 'success' });
            }
        }

        if (success) {
            setModalOpen(false);
        } else {
            setSnackbar({ open: true, message: 'Error al guardar el tipo de capacitación', severity: 'error' });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Gestión de Tipos de Capacitación
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreate}
                >
                    Nuevo Tipo
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TiposCapacitacionTable
                data={tipos}
                onEdit={handleEdit}
            />

            <TipoCapacitacionModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                initialData={selectedTipo}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default GestionTiposCapacitacion;
