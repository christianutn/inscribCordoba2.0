import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, 
    Stack, TextField, Typography, CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const CambiarFechasModal = ({ open, onClose, onUpdate, loading, selectedRowData }) => {
    const [fechasEditables, setFechasEditables] = useState({ 
        fecha_inicio_curso: null, 
        fecha_fin_curso: null, 
        fecha_inicio_inscripcion: null, 
        fecha_fin_inscripcion: null 
    });

    useEffect(() => {
        if (open && selectedRowData) {
            const { originalInstancia } = selectedRowData;
            setFechasEditables({
                fecha_inicio_curso: originalInstancia.fecha_inicio_curso ? dayjs(originalInstancia.fecha_inicio_curso) : null,
                fecha_fin_curso: originalInstancia.fecha_fin_curso ? dayjs(originalInstancia.fecha_fin_curso) : null,
                fecha_inicio_inscripcion: originalInstancia.fecha_inicio_inscripcion ? dayjs(originalInstancia.fecha_inicio_inscripcion) : null,
                fecha_fin_inscripcion: originalInstancia.fecha_fin_inscripcion ? dayjs(originalInstancia.fecha_fin_inscripcion) : null,
            });
        } else if (!open) {
            setFechasEditables({ fecha_inicio_curso: null, fecha_fin_curso: null, fecha_inicio_inscripcion: null, fecha_fin_inscripcion: null });
        }
    }, [open, selectedRowData]);

    const handleConfirm = () => {
        onUpdate(fechasEditables);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Cambiar Fechas de la Instancia</DialogTitle>
            <DialogContent dividers>
                <Typography gutterBottom>Curso: <strong>{selectedRowData?.["Nombre del curso"]}</strong></Typography>
                <Stack spacing={3} sx={{ pt: 1, mt: 2 }}>
                    <DatePicker 
                        label="Fecha Inicio Curso" 
                        value={fechasEditables.fecha_inicio_curso} 
                        onChange={(newValue) => setFechasEditables(prev => ({ ...prev, fecha_inicio_curso: newValue }))} 
                        renderInput={(params) => <TextField {...params} fullWidth />} 
                    />
                    <DatePicker 
                        label="Fecha Fin Curso" 
                        value={fechasEditables.fecha_fin_curso} 
                        onChange={(newValue) => setFechasEditables(prev => ({ ...prev, fecha_fin_curso: newValue }))} 
                        renderInput={(params) => <TextField {...params} fullWidth />} 
                    />
                    <DatePicker 
                        label="Fecha Inicio Inscripción" 
                        value={fechasEditables.fecha_inicio_inscripcion} 
                        onChange={(newValue) => setFechasEditables(prev => ({ ...prev, fecha_inicio_inscripcion: newValue }))} 
                        renderInput={(params) => <TextField {...params} fullWidth />} 
                    />
                    <DatePicker 
                        label="Fecha Fin Inscripción" 
                        value={fechasEditables.fecha_fin_inscripcion} 
                        onChange={(newValue) => setFechasEditables(prev => ({ ...prev, fecha_fin_inscripcion: newValue }))} 
                        renderInput={(params) => <TextField {...params} fullWidth />} 
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleConfirm} variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Guardar Fechas"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CambiarFechasModal;
