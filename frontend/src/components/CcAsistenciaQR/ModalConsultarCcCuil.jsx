import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Button, TextField, CircularProgress, IconButton, Alert, useTheme, useMediaQuery, Paper } from '@mui/material';
import { Close as CloseIcon, Search as SearchIcon } from '@mui/icons-material';
import { getPersonaCidi } from '../../services/cc_asistencia.service.js';

export default function ModalConsultarCcCuil({ open, onClose, idEvento, nombreCurso, onConfirmAttendance }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [cuil, setCuil] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [participantInfo, setParticipantInfo] = useState(null);

    const handleSearch = async () => {
        if (!cuil || cuil.length !== 11) {
            setError('Por favor, ingresa un CUIL válido (11 dígitos, sin guiones).');
            return;
        }

        setLoading(true);
        setError('');
        setParticipantInfo(null);
        try {
            const data = await getPersonaCidi(cuil);
            setParticipantInfo({
                cuil: data.cuil,
                nombre: data.nombre,
                apellido: data.apellido,
            });
        } catch (err) {
            setError('No se pudo obtener información del participante o no existe en CIDI.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        if (participantInfo) {
            onConfirmAttendance(participantInfo);
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
                    <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontFamily: 'Geogrotesque Sharp', fontWeight: 'bold', color: '#1A1A1A' }}>
                        Agregar Participante
                    </Typography>
                    <Typography variant="body" sx={{ fontFamily: 'Poppins', color: '#5C6F82', mt: 0.5 }}>
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
                <Box display="flex" flexDirection="column" gap={3}>
                    <Box display="flex" gap={1.5} alignItems="flex-end" flexDirection={isMobile ? 'column' : 'row'}>
                        <Box sx={{ flexGrow: 1, width: '100%' }}>
                            <Typography
                                variant="subtitle1"
                                sx={{ fontFamily: 'Poppins', mb: 1, color: '#1A1A1A', fontWeight: 600 }}
                            >
                                CUIL del Participante
                            </Typography>
                            <TextField
                                placeholder="Ingrese 11 dígitos"
                                variant="outlined"
                                fullWidth
                                value={cuil}
                                onChange={(e) => setCuil(e.target.value.replace(/\D/g, '').slice(0, 11))}
                                disabled={loading || participantInfo !== null}
                                InputProps={{ sx: { fontFamily: 'Poppins', borderRadius: '8px', height: '56px' } }}
                            />
                        </Box>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSearch}
                            disabled={loading || participantInfo !== null || cuil.length !== 11}
                            sx={{
                                minWidth: isMobile ? '100%' : 140,
                                height: '56px',
                                fontFamily: 'Geogrotesque Sharp',
                                borderRadius: '8px',
                                fontWeight: 'bold'
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : <><SearchIcon sx={{ mr: 1 }} />BUSCAR</>}
                        </Button>
                    </Box>

                    {error && <Alert severity="error" sx={{ borderRadius: '8px' }}>{error}</Alert>}

                    {participantInfo && (
                        <Paper elevation={0} sx={{ p: 3, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', mt: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', mb: 1, color: '#64748B', fontWeight: 600 }}>DATOS ENCONTRADOS</Typography>
                            <Typography variant="h5" sx={{ fontFamily: 'Geogrotesque Sharp', fontWeight: 'bold', color: 'primary.main', mb: 0.5 }}>
                                {participantInfo.nombre} {participantInfo.apellido}
                            </Typography>
                            <Typography variant="body1" sx={{ fontFamily: 'Poppins', color: '#1A1A1A' }}>
                                <strong>CUIL:</strong> {participantInfo.cuil}
                            </Typography>
                        </Paper>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 4, pt: 2, gap: 2 }}>
                {participantInfo ? (
                    <>
                        <Button
                            onClick={() => setParticipantInfo(null)}
                            sx={{ fontFamily: 'Geogrotesque Sharp', color: '#64748B', fontSize: '1rem', height: '48px', px: 3, '&:hover': { bgcolor: '#F1F5F9' } }}
                        >
                            CANCELAR
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            color="primary"
                            variant="contained"
                            sx={{
                                fontFamily: 'Geogrotesque Sharp',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                height: '48px',
                                px: 4,
                                boxShadow: '0 4px 12px rgba(0,123,255,0.2)'
                            }}
                        >
                            REGISTRAR
                        </Button>
                    </>
                ) : (
                    <Button
                        onClick={onClose}
                        sx={{ fontFamily: 'Geogrotesque Sharp', color: '#64748B', fontSize: '1rem', height: '48px', px: 3, '&:hover': { bgcolor: '#F1F5F9' } }}
                    >
                        CERRAR
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
