import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography,
    Button, TextField, IconButton, Autocomplete, CircularProgress
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { getCursos } from '../../services/cursos.service.js';
import { createCcAsistenciaEvento, updateCcAsistenciaEvento } from '../../services/cc_asistencia.service.js';

export default function ModalCrearCcEvento({ open, onClose, onSuccess, initialData }) {
    const isEditMode = !!initialData;
    
    const [loading, setLoading] = useState(false);
    const [cursos, setCursos] = useState([]);
    const [selectedCurso, setSelectedCurso] = useState(null);
    const [fecha, setFecha] = useState('');
    const [horario, setHorario] = useState('');
    const [docente, setDocente] = useState('');
    const [ubicacion, setUbicacion] = useState('');
    const [cupo, setCupo] = useState('');

    useEffect(() => {
        if (open) {
            loadCursos();
            if (isEditMode) {
                setFecha(initialData.fecha || '');
                setHorario(initialData.horario || '');
                setDocente(initialData.docente || '');
                setUbicacion(initialData.ubicacion || '');
                setCupo(initialData.cupo || '');
                // Try to find the matching course
                // Will happen after initial courses load
            } else {
                setFecha(''); setHorario(''); setDocente(''); setUbicacion(''); setCupo(''); setSelectedCurso(null);
            }
        }
    }, [open, isEditMode, initialData]);

    const loadCursos = async () => {
        try {
            const data = await getCursos();
            setCursos(data);
            if(isEditMode && initialData && initialData.curso_cod) {
                const found = data.find(c => c.cod === initialData.curso_cod);
                if(found) setSelectedCurso(found);
            }
        } catch(error) {
            console.error('Error fetching courses:', error);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        if (!isEditMode && !selectedCurso) {
            alert("Debe seleccionar un curso.");
            return;
        }

        setLoading(true);
        const requestData = {
            curso_cod: selectedCurso ? selectedCurso.cod : initialData?.curso_cod,
            fecha,
            horario,
            docente,
            ubicacion,
            cupo: parseInt(cupo) || 0
        };

        try {
            if (isEditMode) {
                await updateCcAsistenciaEvento(initialData.id, requestData);
                onSuccess(`Evento #ST-${initialData.id} actualizado con éxito`);
            } else {
                await createCcAsistenciaEvento(requestData);
                onSuccess(`Nuevo evento creado con éxito`);
            }
            onClose();
        } catch (error) {
            console.error('Error saving event:', error);
            alert(`Error al guardar: ${error.message || 'Error desconocido'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <form onSubmit={handleSave}>
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">{isEditMode ? 'Editar Evento' : 'Crear Evento'}</Typography>
                    <IconButton aria-label="close" onClick={onClose}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Box display="flex" flexDirection="column" gap={2}>
                        
                        <Autocomplete
                            options={cursos}
                            getOptionLabel={(option) => `[${option.cod}] ${option.nombre}`}
                            value={selectedCurso}
                            onChange={(event, newValue) => setSelectedCurso(newValue)}
                            disabled={isEditMode}
                            renderInput={(params) => <TextField {...params} label="Curso / Capacitación" required={!isEditMode} />}
                        />
                        
                        <TextField
                            label="Fecha del Evento"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            required
                            fullWidth
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                        />
                        <TextField
                            label="Horario (Ej. 10:00 a 12:00 hs)"
                            required
                            fullWidth
                            value={horario}
                            onChange={(e) => setHorario(e.target.value)}
                        />
                        <TextField
                            label="Ubicación"
                            fullWidth
                            value={ubicacion}
                            onChange={(e) => setUbicacion(e.target.value)}
                        />
                        <TextField
                            label="Nombre y Apellido del Docente"
                            fullWidth
                            value={docente}
                            onChange={(e) => setDocente(e.target.value)}
                        />
                         <TextField
                            label="Cupo"
                            type="number"
                            fullWidth
                            value={cupo}
                            onChange={(e) => setCupo(e.target.value)}
                        />

                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="error" variant="outlined">Cancelar</Button>
                    <Button type="submit" color="primary" variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Guardar'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
