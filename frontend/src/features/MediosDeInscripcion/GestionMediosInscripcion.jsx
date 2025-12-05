import React, { useState } from 'react';
import { Box, Button, Typography, Alert, Snackbar } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MediosInscripcionTable from './components/MediosInscripcionTable';
import MedioInscripcionModal from './components/MedioInscripcionModal';
import useMediosInscripcion from './hooks/useMediosInscripcion';

const GestionMediosInscripcion = () => {
    const { medios, loading, error, createMedio, updateMedio } = useMediosInscripcion();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedMedio, setSelectedMedio] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handleCreate = () => {
        setSelectedMedio(null);
        setModalOpen(true);
    };

    const handleEdit = (medio) => {
        setSelectedMedio(medio);
        setModalOpen(true);
    };

    const handleSave = async (formData) => {
        let success;
        if (selectedMedio) {
            success = await updateMedio(formData);
            if (success) {
                setSnackbar({ open: true, message: 'Medio de inscripción actualizado correctamente', severity: 'success' });
            }
        } else {
            success = await createMedio(formData);
            if (success) {
                setSnackbar({ open: true, message: 'Medio de inscripción creado correctamente', severity: 'success' });
            }
        }

        if (success) {
            setModalOpen(false);
        } else {
            setSnackbar({ open: true, message: 'Error al guardar el medio de inscripción', severity: 'error' });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Gestión de Medios de Inscripción
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreate}
                >
                    Nuevo Medio
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <MediosInscripcionTable
                data={medios}
                onEdit={handleEdit}
            />

            <MedioInscripcionModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                initialData={selectedMedio}
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

export default GestionMediosInscripcion;
