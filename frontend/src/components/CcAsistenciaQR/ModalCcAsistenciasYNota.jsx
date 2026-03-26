import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Button, TextField, Grid, Switch, Paper, Alert, Snackbar, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { updateNotaYAsistencia } from '../../services/cc_asistencia.service.js';

export default function ModalCcAsistenciasYNota({ open, onClose, participante, idEvento, nombreCurso, onDataChange }) {
    const [nota, setNota] = useState(0);
    const [estadoAsistencia, setEstadoAsistencia] = useState(0);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        if (participante) {
            setNota(participante.nota !== null ? participante.nota : 0);
            setEstadoAsistencia(participante.estado_asistencia !== null ? participante.estado_asistencia : 0);
        }
    }, [participante]);

    const handleSaveNota = async () => {
        setLoading(true);
        try {
            await updateNotaYAsistencia(participante.id, { nota, estado_asistencia: estadoAsistencia });
            setSnackbar({ open: true, message: 'Nota y asistencia guardadas correctamente', severity: 'success' });
            if (onDataChange) onDataChange();
            setTimeout(() => {
                onClose();
            }, 800);

        } catch (error) {
            setSnackbar({ open: true, message: 'Error al guardar los datos', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{ sx: { borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' } }}
        >
            <DialogTitle sx={{ m: 0, p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h5" sx={{ fontFamily: 'Geogrotesque Sharp', fontWeight: 'bold', color: '#1A1A1A' }}>
                        Gestión de Participante
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#5C6F82', mt: 0.5 }}>
                        {nombreCurso}
                    </Typography>
                </Box>
                <IconButton 
                    onClick={onClose} 
                    sx={{ color: '#9E9E9E', '&:hover': { color: '#1A1A1A', bgcolor: 'rgba(0,0,0,0.04)' } }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 4 }}>
                <Grid container spacing={4}>
                    {/* Alumno Info Card */}
                    <Grid item xs={12}>
                        <Paper elevation={0} sx={{ p: 3, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                            <Typography 
                                variant="h5" 
                                sx={{ 
                                    fontFamily: 'Geogrotesque Sharp', 
                                    fontWeight: 'bold', 
                                    color: 'primary.main',
                                    mb: 0.5
                                }}
                            >
                                {participante?.apellido}, {participante?.nombre}
                            </Typography>
                            <Typography variant="body1" sx={{ fontFamily: 'Poppins', color: '#64748B', fontWeight: 500 }}>
                                CUIL: {participante?.cuil}
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* Nota */}
                    <Grid item xs={12} sm={6}>
                        <Typography 
                            variant="subtitle2" 
                            sx={{ fontFamily: 'Poppins', mb: 1, color: '#1A1A1A', fontWeight: 600 }}
                        >
                            Calificación
                        </Typography>
                        <TextField
                            placeholder="Ej: 85"
                            type="number"
                            fullWidth
                            value={nota}
                            onChange={(e) => setNota(parseInt(e.target.value) || 0)}
                            InputProps={{
                                inputProps: { min: 0, max: 100 },
                                sx: { fontFamily: 'Poppins', fontSize: '16px', borderRadius: '8px' }
                            }}
                        />
                    </Grid>

                    {/* Asistencia */}
                    <Grid item xs={12} sm={6}>
                        <Typography 
                            variant="subtitle2" 
                            sx={{ fontFamily: 'Poppins', mb: 1, color: '#1A1A1A', fontWeight: 600 }}
                        >
                            Estado de Asistencia
                        </Typography>
                        <Paper 
                            elevation={0} 
                            sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                px: 2, 
                                py: 1.2, 
                                borderRadius: '8px',
                                border: '1px solid #E2E8F0',
                                bgcolor: '#fff'
                            }}
                        >
                            <Typography 
                                variant="body1" 
                                sx={{ 
                                    fontFamily: 'Poppins', 
                                    fontWeight: 500,
                                    color: estadoAsistencia === 1 ? 'success.main' : '#64748B' 
                                }}
                            >
                                {estadoAsistencia === 1 ? 'Presente' : 'Ausente'}
                            </Typography>
                            <Switch
                                checked={estadoAsistencia === 1}
                                onChange={(e) => setEstadoAsistencia(e.target.checked ? 1 : 0)}
                                color="success"
                                sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': { color: 'success.main' },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: 'success.main' }
                                }}
                            />
                        </Paper>
                    </Grid>
                </Grid>
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
                    CERRAR
                </Button>
                <Button 
                    onClick={handleSaveNota} 
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
                    GUARDAR
                </Button>
            </DialogActions>

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

