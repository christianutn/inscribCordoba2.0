import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography,
    Button, TextField, IconButton, Autocomplete, CircularProgress, Snackbar, Alert, useTheme, useMediaQuery
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { getCursos } from '../../services/cursos.service.js';
import { createCcAsistenciaEvento, updateCcAsistenciaEvento } from '../../services/cc_asistencia.service.js';

export default function ModalCrearCcEvento({ open, onClose, onSuccess, initialData }) {
    const isEditMode = !!initialData;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [loading, setLoading] = useState(false);
    const [cursos, setCursos] = useState([]);
    const [selectedCurso, setSelectedCurso] = useState(null);
    const [fecha, setFecha] = useState('');
    const [horario, setHorario] = useState('');
    const [docente, setDocente] = useState('');
    const [ubicacion, setUbicacion] = useState('');
    const [cupo, setCupo] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

    const showAlert = (message, severity = 'error') => {
        setSnackbar({ open: true, message, severity });
    };

    useEffect(() => {
        if (open) {
            loadCursos();
            if (isEditMode) {
                setFecha(initialData.fecha || '');
                setHorario(initialData.horario || '');
                setDocente(initialData.docente || '');
                setUbicacion(initialData.ubicacion || '');
                setCupo(initialData.cupo || '');
            } else {
                setFecha(''); setHorario(''); setDocente(''); setUbicacion(''); setCupo(''); setSelectedCurso(null);
            }
        }
    }, [open, isEditMode, initialData]);

    const loadCursos = async () => {
        try {
            const data = await getCursos();
            setCursos(data);
            if (isEditMode && initialData && initialData.curso_cod) {
                const found = data.find(c => c.cod === initialData.curso_cod);
                if (found) setSelectedCurso(found);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!isEditMode && !selectedCurso) {
            showAlert("Debe seleccionar un curso.");
            return;
        }

        if (parseInt(cupo) <= 0) {
            showAlert("El cupo debe ser mayor a 0.");
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
                onSuccess(`Evento actualizado con éxito`);
            } else {
                await createCcAsistenciaEvento(requestData);
                onSuccess(`Nuevo evento creado con éxito`);
            }
            onClose();
        } catch (error) {
            console.error('Error saving event:', error);
            showAlert(`Error al guardar: ${error.message || 'Error desconocido'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{ sx: { borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' } }}
        >
            <form onSubmit={handleSave}>
                <DialogTitle sx={{ m: 0, p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontFamily: 'Geogrotesque Sharp', fontWeight: 'bold', color: '#1A1A1A' }}>
                        {isEditMode ? 'Editar Evento' : 'Crear Evento'}
                    </Typography>
                    <IconButton
                        onClick={onClose}
                        sx={{ color: '#9E9E9E', '&:hover': { color: '#1A1A1A', bgcolor: 'rgba(0,0,0,0.04)' } }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 4, pt: 1 }}>
                    <Box display="flex" flexDirection="column" gap={3} sx={{ mt: 1 }}>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', mb: 1, color: '#1A1A1A', fontWeight: 600 }}>
                                Curso / Capacitación
                            </Typography>
                            <Autocomplete
                                options={cursos}
                                getOptionLabel={(option) => `${option.nombre}`}
                                value={selectedCurso}
                                onChange={(event, newValue) => setSelectedCurso(newValue)}
                                disabled={isEditMode}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Seleccione un curso"
                                        required={!isEditMode}
                                        InputProps={{ ...params.InputProps, sx: { fontFamily: 'Poppins', borderRadius: '8px' } }}
                                    />
                                )}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 3, flexDirection: isMobile ? 'column' : 'row' }}>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', mb: 1, color: '#1A1A1A', fontWeight: 600 }}>
                                    Fecha del Evento
                                </Typography>
                                <TextField
                                    type="date"
                                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                                    required
                                    fullWidth
                                    value={fecha}
                                    onChange={(e) => setFecha(e.target.value)}
                                    InputProps={{ sx: { fontFamily: 'Poppins', borderRadius: '8px' } }}
                                />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', mb: 1, color: '#1A1A1A', fontWeight: 600 }}>
                                    Horario
                                </Typography>
                                <TextField
                                    placeholder="Ej. 10:00 a 12:00"
                                    required
                                    fullWidth
                                    value={horario}
                                    onChange={(e) => setHorario(e.target.value)}
                                    InputProps={{ sx: { fontFamily: 'Poppins', borderRadius: '8px' } }}
                                />
                            </Box>
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', mb: 1, color: '#1A1A1A', fontWeight: 600 }}>
                                Ubicación
                            </Typography>
                            <TextField
                                placeholder="Ej. 27 de abril 123"
                                fullWidth
                                value={ubicacion}
                                onChange={(e) => setUbicacion(e.target.value)}
                                InputProps={{ sx: { fontFamily: 'Poppins', borderRadius: '8px' } }}
                            />
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', mb: 1, color: '#1A1A1A', fontWeight: 600 }}>
                                Nombre y Apellido del Docente
                            </Typography>
                            <TextField
                                placeholder="Ingrese el nombre del docente"
                                fullWidth
                                value={docente}
                                onChange={(e) => setDocente(e.target.value)}
                                InputProps={{ sx: { fontFamily: 'Poppins', borderRadius: '8px' } }}
                            />
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', mb: 1, color: '#1A1A1A', fontWeight: 600 }}>
                                Cupo Máximo
                            </Typography>
                            <TextField
                                type="number"
                                fullWidth
                                inputProps={{ min: "1" }}
                                value={cupo}
                                onChange={(e) => setCupo(e.target.value)}
                                InputProps={{ sx: { fontFamily: 'Poppins', borderRadius: '8px' } }}
                            />
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 4, pt: 2, gap: 2 }}>
                    <Button
                        onClick={onClose}
                        sx={{
                            fontFamily: 'Geogrotesque Sharp',
                            color: '#64748B',
                            fontSize: '1rem',
                            height: '48px',
                            px: 3,
                            '&:hover': { bgcolor: '#F1F5F9' }
                        }}
                    >
                        CANCELAR
                    </Button>
                    <Button
                        type="submit"
                        color="primary"
                        variant="contained"
                        disabled={loading}
                        sx={{
                            fontFamily: 'Geogrotesque Sharp',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            height: '48px',
                            px: 4,
                            boxShadow: '0 4px 12px rgba(0,123,255,0.2)'
                        }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : (isEditMode ? 'GUARDAR' : 'CREAR')}
                    </Button>
                </DialogActions>
            </form>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: '12px' }} variant="filled">{snackbar.message}</Alert>
            </Snackbar>
        </Dialog>
    );
}
