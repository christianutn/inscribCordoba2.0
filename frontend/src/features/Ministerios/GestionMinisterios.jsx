import React, { useState } from 'react';
import { Box, Button, Typography, Alert, Snackbar } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MinisteriosTable from './components/MinisteriosTable';
import MinisterioModal from './components/MinisterioModal';
import useMinisterios from './hooks/useMinisterios';

const GestionMinisterios = () => {
    const { ministerios, loading, error, createMinisterio, updateMinisterio } = useMinisterios();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedMinisterio, setSelectedMinisterio] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handleCreate = () => {
        setSelectedMinisterio(null);
        setModalOpen(true);
    };

    const handleEdit = (ministerio) => {
        setSelectedMinisterio(ministerio);
        setModalOpen(true);
    };

    const handleSave = async (formData) => {
        let success;
        if (selectedMinisterio) {
            success = await updateMinisterio(formData);
            if (success) {
                setSnackbar({ open: true, message: 'Ministerio actualizado correctamente', severity: 'success' });
            }
        } else {
            success = await createMinisterio(formData);
            if (success) {
                setSnackbar({ open: true, message: 'Ministerio creado correctamente', severity: 'success' });
            }
        }

        if (success) {
            setModalOpen(false);
        } else {
            setSnackbar({ open: true, message: 'Error al guardar el ministerio', severity: 'error' });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Gestión de Ministerios
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreate}
                >
                    Nuevo Ministerio
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <MinisteriosTable
                data={ministerios}
                onEdit={handleEdit}
            />

            <MinisterioModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                initialData={selectedMinisterio}
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

export default GestionMinisterios;
