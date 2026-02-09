import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    FormControl, InputLabel, Select, MenuItem, Typography, CircularProgress
} from '@mui/material';

const CambiarMedioInscripcionModal = ({ open, onClose, onUpdate, loading, selectedRowData, allMedios }) => {
    const [selectedMedio, setSelectedMedio] = useState('');

    useEffect(() => {
        if (open && selectedRowData) {
            setSelectedMedio(selectedRowData.originalInstancia.medio_inscripcion || '');
        } else if (!open) {
            setSelectedMedio('');
        }
    }, [open, selectedRowData]);

    const handleConfirm = () => {
        if (selectedMedio) {
            onUpdate(selectedMedio);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Cambiar Medio de Inscripción</DialogTitle>
            <DialogContent dividers>
                <Typography gutterBottom>Curso: <strong>{selectedRowData?.["Nombre del curso"]}</strong></Typography>
                <Typography gutterBottom>Medio actual: <strong>{selectedRowData?.originalInstancia?.medio_inscripcion}</strong></Typography>
                <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel id="select-new-medio-label">Nuevo Medio</InputLabel>
                    <Select
                        labelId="select-new-medio-label"
                        value={selectedMedio}
                        label="Nuevo Medio"
                        onChange={(e) => setSelectedMedio(e.target.value)}
                    >
                        {allMedios.map((medio) => (
                            <MenuItem key={medio.cod} value={medio.cod}>{medio.nombre} ({medio.cod})</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleConfirm} variant="contained" disabled={!selectedMedio || loading}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Confirmar Medio"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CambiarMedioInscripcionModal;
