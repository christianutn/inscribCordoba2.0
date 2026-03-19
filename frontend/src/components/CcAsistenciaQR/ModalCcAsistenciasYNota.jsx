import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Button, TextField, Grid, Switch, Paper, Alert, Snackbar, InputAdornment, IconButton } from '@mui/material';
import { Close as CloseIcon, Save as SaveIcon } from '@mui/icons-material';
import { updateNotaYAsistencia } from '../../services/cc_asistencia.service.js';

export default function ModalCcAsistenciasYNota({ open, onClose, participante, idEvento, nombreCurso, onDataChange }) {
    const [nota, setNota] = useState(0);
    const [estadoAsistencia, setEstadoAsistencia] = useState(0);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        if(participante) {
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
        } catch (error) {
            setSnackbar({ open: true, message: 'Error al guardar los datos', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h6">Gestión de Participante</Typography>
                    <Typography variant="subtitle2" color="text.secondary">{nombreCurso} • ID Evento: {idEvento}</Typography>
                </Box>
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: '#f4f6f8', borderRadius: 2 }}>
                            <Typography variant="h6" color="primary.main">{participante?.apellido}, {participante?.nombre}</Typography>
                            <Typography variant="body2" color="text.secondary">CUIL: {participante?.cuil}</Typography>
                        </Paper>
                    </Grid>

                    {/* Nota */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Nota"
                            type="number"
                            fullWidth
                            value={nota}
                            onChange={(e) => setNota(parseInt(e.target.value) || 0)}
                            InputProps={{
                                inputProps: { min: 0, max: 100 }
                            }}
                        />
                    </Grid>

                    {/* Asistencia */}
                    <Grid item xs={12} sm={6}>
                        <Paper variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: estadoAsistencia === 1 ? 'success.main' : 'divider' }}>
                            <Box>
                                <Typography variant="body1" fontWeight="bold">Asistencia</Typography>
                                <Typography variant="body2" color={estadoAsistencia === 1 ? 'success.main' : 'text.disabled'}>
                                    {estadoAsistencia === 1 ? 'Presente' : 'Ausente'}
                                </Typography>
                            </Box>
                            <Switch
                                checked={estadoAsistencia === 1}
                                onChange={(e) => setEstadoAsistencia(e.target.checked ? 1 : 0)}
                                color="success"
                            />
                        </Paper>
                    </Grid>

                </Grid>
                
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="error" variant="outlined">Cerrar</Button>
                <Button onClick={handleSaveNota} color="primary" variant="contained" disabled={loading} startIcon={<SaveIcon />}>Guardar Cambios</Button>
            </DialogActions>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">{snackbar.message}</Alert>
            </Snackbar>
        </Dialog>
    );
}
