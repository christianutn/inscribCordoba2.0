import React, { useState } from 'react';
import { Box, Button, Typography, Alert, Snackbar } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PlataformasDictadoTable from './components/PlataformasDictadoTable';
import PlataformaDictadoModal from './components/PlataformaDictadoModal';
import usePlataformasDictado from './hooks/usePlataformasDictado';

const GestionPlataformasDictado = () => {
    const { plataformas, loading, error, createPlataforma, updatePlataforma } = usePlataformasDictado();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPlataforma, setSelectedPlataforma] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handleCreate = () => {
        setSelectedPlataforma(null);
        setModalOpen(true);
    };

    const handleEdit = (plataforma) => {
        setSelectedPlataforma(plataforma);
        setModalOpen(true);
    };

    const handleSave = async (formData) => {
        let success;
        if (selectedPlataforma) {
            success = await updatePlataforma(formData);
            if (success) {
                setSnackbar({ open: true, message: 'Plataforma de dictado actualizada correctamente', severity: 'success' });
            }
        } else {
            success = await createPlataforma(formData);
            if (success) {
                setSnackbar({ open: true, message: 'Plataforma de dictado creada correctamente', severity: 'success' });
            }
        }

        if (success) {
            setModalOpen(false);
        } else {
            setSnackbar({ open: true, message: 'Error al guardar la plataforma de dictado', severity: 'error' });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Gestión de Plataformas de Dictado
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreate}
                >
                    Nueva Plataforma
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <PlataformasDictadoTable
                data={plataformas}
                onEdit={handleEdit}
            />

            <PlataformaDictadoModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                initialData={selectedPlataforma}
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

export default GestionPlataformasDictado;
