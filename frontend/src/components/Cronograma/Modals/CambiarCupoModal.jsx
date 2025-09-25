import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, 
    FormControl, Input, Typography, CircularProgress
} from '@mui/material';

const CambiarComentariosModal = ({ open, onClose, onUpdate, loading, selectedRowData }) => {
    const [cantidadCupos, setCantidadCupos] = useState('');

    useEffect(() => {
        if (open && selectedRowData) {
            setCantidadCupos(selectedRowData.originalInstancia.cupo || '');
        } else if (!open) {
            setCantidadCupos('');
        }
    }, [open, selectedRowData]);

    const handleConfirm = () => {
        onUpdate({ cupo: cantidadCupos });
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Otros</DialogTitle>
            <DialogContent dividers>
                <Typography gutterBottom>Curso: <strong>{selectedRowData?.["Nombre del curso"]}</strong></Typography>
                <Typography gutterBottom>Cantidad Cupos:</Typography>
                <FormControl fullWidth sx={{ mt: 2 }}>
                    <Input 
                        value={cantidadCupos} 
                        onChange={(e) => setCantidadCupos(e.target.value)}
                        placeholder="Cantidad de cupos"
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

export default CambiarComentariosModal;

