import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, 
    FormControl, InputLabel, Select, MenuItem, Typography, CircularProgress
} from '@mui/material';

const CambiarEstadoModal = ({ open, onClose, onUpdate, loading, selectedRowData, allEstados }) => {
    const [selectedEstado, setSelectedEstado] = useState('');

    useEffect(() => {
        if (open && selectedRowData) {
            setSelectedEstado(selectedRowData.originalInstancia.estado_instancia || '');
        } else if (!open) {
            setSelectedEstado('');
        }
    }, [open, selectedRowData]);

    const handleConfirm = () => {
        if (selectedEstado) {
            onUpdate(selectedEstado);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Cambiar Estado de la Instancia</DialogTitle>
            <DialogContent dividers>
                <Typography gutterBottom>Curso: <strong>{selectedRowData?.["Nombre del curso"]}</strong></Typography>
                <Typography gutterBottom>Estado actual: <strong>{selectedRowData?.originalInstancia?.estado_instancia}</strong></Typography>
                <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel id="select-new-estado-label">Nuevo Estado</InputLabel>
                    <Select 
                        labelId="select-new-estado-label" 
                        value={selectedEstado} 
                        label="Nuevo Estado" 
                        onChange={(e) => setSelectedEstado(e.target.value)}
                    >
                        {allEstados.map((estado) => (
                            <MenuItem key={estado.cod} value={estado.cod}>{estado.descripcion} ({estado.cod})</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleConfirm} variant="contained" disabled={!selectedEstado || loading}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Confirmar Estado"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CambiarEstadoModal;
