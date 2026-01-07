import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Grid,
    Paper,
    IconButton,
    Switch,
    TextField,
    InputAdornment,
    Tooltip,
    Alert,
    Snackbar
} from '@mui/material';
import {
    Close as CloseIcon,
    Save as SaveIcon,
} from '@mui/icons-material';
import {
    crearOActualizarNota,
    getNotasPorCuilYEvento,
    putAsistencia
} from '../../services/asistencias.service.js';

const ModalAsistenciasYNota = ({ open, onClose, participante, asistencia, nombreCurso, idEvento, onDataChange }) => {
    // Local state to simulate interactivity
    const [localAsistencia, setLocalAsistencia] = useState(asistencia || {});
    const [localNota, setLocalNota] = useState('');

    // UI Feedback state
    const [loadingNota, setLoadingNota] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        // Fetch existing note when modal opens
        const fetchNota = async () => {
            if (participante?.cuil && idEvento) {
                try {
                    const data = await getNotasPorCuilYEvento(participante.cuil, idEvento);
                    if (data && data.nota) {
                        setLocalNota(data.nota);
                    } else {
                        setLocalNota('');
                    }
                } catch (error) {
                    // Start with empty note if not found or error (handled silently for better UX)
                    setLocalNota('');
                }
            }
        };
        fetchNota();
        setLocalAsistencia(asistencia || {});
    }, [participante, idEvento, asistencia]);

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    const showMessage = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSaveNota = async () => {
        setLoadingNota(true);
        try {
            await crearOActualizarNota(participante.cuil, idEvento, localNota);
            showMessage('Nota guardada correctamente');
            if (typeof onDataChange === 'function') {
                onDataChange();
            }
        } catch (error) {
            console.error('Error saving nota:', error);
            showMessage('Error al guardar la nota', 'error');
        } finally {
            setLoadingNota(false);
        }
    };

    const handleToggleAsistencia = async (fecha) => {
        const newState = localAsistencia[fecha] === 1 ? 0 : 1;

        // Optimistic UI update
        setLocalAsistencia(prev => ({
            ...prev,
            [fecha]: newState
        }));

        try {
            await putAsistencia(participante.cuil, idEvento, fecha, newState);
            showMessage(`Asistencia actualizada para el ${fecha}`);
            if (typeof onDataChange === 'function') {
                onDataChange();
            }
        } catch (error) {
            console.error('Error updating asistencia:', error);
            showMessage('Error al actualizar la asistencia', 'error');
            // Revert on error
            setLocalAsistencia(prev => ({
                ...prev,
                [fecha]: newState === 1 ? 0 : 1
            }));
        }
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, boxShadow: 24 }
                }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, borderBottom: '1px solid #eee' }}>
                    <Box>
                        <Typography variant="h6" component="div" fontWeight="bold" color="primary">
                            Gestión de Participante
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary">
                            {nombreCurso} • ID Evento: {idEvento}
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ pt: 3, pb: 2 }}>
                    <Grid container spacing={4}>
                        {/* Participant Info & Note Management */}
                        <Grid item xs={12}>
                            <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'rgba(0, 123, 255, 0.04)', borderRadius: 3, border: '1px solid rgba(0, 123, 255, 0.1)' }}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="h6" color="primary.main" fontWeight="bold">
                                            {participante?.apellido}, {participante?.nombres}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                            <strong>CUIL:</strong> {participante?.cuil}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Nota del Participante"
                                            fullWidth
                                            variant="outlined"
                                            size="small"
                                            value={localNota}
                                            onChange={(e) => setLocalNota(e.target.value)}
                                            placeholder="Escriba una nota..."
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <Tooltip title="Guardar Nota">
                                                            <span>
                                                                <IconButton
                                                                    edge="end"
                                                                    color="primary"
                                                                    onClick={handleSaveNota}
                                                                    disabled={loadingNota}
                                                                >
                                                                    <SaveIcon />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{ bgcolor: 'white' }}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* Attendance List */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box component="span" sx={{ width: 4, height: 18, bgcolor: 'primary.main', borderRadius: 1 }} />
                                Registro de Asistencia Diaria
                            </Typography>

                            <Grid container spacing={2}>
                                {localAsistencia && Object.keys(localAsistencia).length > 0 ? (
                                    Object.entries(localAsistencia).map(([fecha, estado]) => (
                                        <Grid item xs={12} sm={6} key={fecha}>
                                            <Paper
                                                variant="outlined"
                                                sx={{
                                                    p: 2,
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    borderRadius: 2,
                                                    transition: 'all 0.2s',
                                                    borderColor: estado === 1 ? 'success.light' : 'divider',
                                                    bgcolor: estado === 1 ? 'rgba(76, 175, 80, 0.04)' : 'transparent',
                                                    '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }
                                                }}
                                            >
                                                <Box>
                                                    <Typography variant="body2" fontWeight="bold" color="text.primary">
                                                        {fecha}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        fontWeight="bold"
                                                        color={estado === 1 ? 'success.main' : 'text.disabled'}
                                                        sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                                                    >
                                                        {estado === 1 ? 'Asistió' : 'Ausente'}
                                                    </Typography>
                                                </Box>
                                                <Switch
                                                    checked={estado === 1}
                                                    onChange={() => handleToggleAsistencia(fecha)}
                                                    color="success"
                                                />
                                            </Paper>

                                        </Grid>
                                    ))
                                ) : (
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4, fontStyle: 'italic' }}>
                                            No hay registros de días configurados para este evento.
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid #eee' }}>
                    <Button onClick={onClose} variant="contained" disableElevation sx={{ borderRadius: 2, px: 4 }}>
                        Cerrar
                    </Button>
                </DialogActions>
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    sx={{ mt: 7 }}
                >
                    <Alert
                        onClose={handleCloseSnackbar}
                        severity={snackbar.severity}
                        sx={{ width: '100%', boxShadow: 3 }}
                        variant="filled"
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Dialog>
        </>
    );
};

export default ModalAsistenciasYNota;
