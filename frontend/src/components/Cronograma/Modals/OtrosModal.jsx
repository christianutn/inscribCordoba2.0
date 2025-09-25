import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, 
    FormControl, Input, Typography, CircularProgress
} from '@mui/material';

const OtrosModal = ({ open, onClose, onUpdate, loading, selectedRowData }) => {
    const [cantidadInscriptos, setCantidadInscriptos] = useState('');

    useEffect(() => {
        if (open && selectedRowData) {
            setCantidadInscriptos(selectedRowData.originalInstancia.cantidad_inscriptos || '');
        } else if (!open) {
            setCantidadInscriptos('');
        }
    }, [open, selectedRowData]);

    const handleConfirm = () => {
        onUpdate({ cantidad_inscriptos: cantidadInscriptos });
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Otros</DialogTitle>
            <DialogContent dividers>
                <Typography gutterBottom>Curso: <strong>{selectedRowData?.["Nombre del curso"]}</strong></Typography>
                <Typography gutterBottom>Cantidad Inscriptos:</Typography>
                <FormControl fullWidth sx={{ mt: 2 }}>
                    <Input 
                        value={cantidadInscriptos} 
                        onChange={(e) => setCantidadInscriptos(e.target.value)}
                        placeholder="Cantidad de Inscriptos"
                    />
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleConfirm} variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Confirmar"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default OtrosModal;
