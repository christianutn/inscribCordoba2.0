import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Button, TextField, CircularProgress, IconButton, Alert } from '@mui/material';
import { Close as CloseIcon, Search as SearchIcon } from '@mui/icons-material';
import { getPersonaCidi } from '../../services/cc_asistencia.service.js';

export default function ModalConsultarCcCuil({ open, onClose, idEvento, nombreCurso, onConfirmAttendance }) {
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
                cuil: cuil,
                nombre: data.Nombre,
                apellido: data.Apellido,
                correo: data.Email || '',
                es_empleado: (data.Empleado || 'N').toUpperCase() === 'S',
                reparticion: 'Ciudadano'
            });
        } catch (err) {
            setError('No se pudo obtener información del participante o no existe en CIDI.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        if(participantInfo) {
            onConfirmAttendance(participantInfo);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Agregar Participante - {nombreCurso}</Typography>
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" gap={1}>
                        <TextField
                            label="Ingrese CUIL"
                            variant="outlined"
                            fullWidth
                            value={cuil}
                            onChange={(e) => setCuil(e.target.value.replace(/\D/g, '').slice(0, 11))}
                            disabled={loading || participantInfo !== null}
                            helperText="11 dígitos, sin guiones"
                        />
                        <Button variant="contained" onClick={handleSearch} disabled={loading || participantInfo !== null || cuil.length !== 11} sx={{ minWidth: 120 }}>
                            {loading ? <CircularProgress size={24} color="inherit" /> : <><SearchIcon sx={{ mr: 1 }} />Buscar</>}
                        </Button>
                    </Box>
                    {error && <Alert severity="error">{error}</Alert>}
                    
                    {participantInfo && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>Datos del Participante</Typography>
                            <Typography variant="body1"><strong>Nombre Completo:</strong> {participantInfo.nombre} {participantInfo.apellido}</Typography>
                            <Typography variant="body1"><strong>CUIL:</strong> {participantInfo.cuil}</Typography>
                            <Typography variant="body1"><strong>Correo:</strong> {participantInfo.correo || 'No especificado'}</Typography>
                            <Typography variant="body1"><strong>Es Empleado:</strong> {participantInfo.es_empleado ? 'Sí' : 'No'}</Typography>
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                {participantInfo ? (
                    <>
                        <Button onClick={() => setParticipantInfo(null)} color="error" variant="outlined">Cancelar</Button>
                        <Button onClick={handleConfirm} color="primary" variant="contained">Confirmar y Agregar</Button>
                    </>
                ) : (
                    <Button onClick={onClose} color="primary" variant="outlined">Cerrar</Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
