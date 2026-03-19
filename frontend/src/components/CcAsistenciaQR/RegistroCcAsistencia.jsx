import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container, Box, Typography, Button, TextField, CircularProgress,
    Alert, Paper, Avatar, InputAdornment, IconButton
} from '@mui/material';
import {
    Search as SearchIcon,
    CheckCircle as CheckCircleIcon,
    Person as PersonIcon,
    Cancel as CancelIcon,
    AssignmentTurnedIn as AssignmentTurnedInIcon
} from '@mui/icons-material';
import { getPersonaCidi, confirmarCcAsistencia, getCcAsistenciaEventoById, upsertParticipanteG } from '../../services/cc_asistencia.service.js';

export default function RegistroCcAsistencia() {
    const { eventoId } = useParams();
    const navigate = useNavigate();

    const [evento, setEvento] = useState(null);
    const [loadingEvento, setLoadingEvento] = useState(true);
    const [error, setError] = useState('');

    const [cuil, setCuil] = useState('');
    const [participantInfo, setParticipantInfo] = useState(null);
    const [loadingCuil, setLoadingCuil] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchEvento = async () => {
            try {
                const data = await getCcAsistenciaEventoById(eventoId);
                setEvento(data);
            } catch (err) {
                setError('Evento no encontrado o ha ocurrido un error.');
            } finally {
                setLoadingEvento(false);
            }
        };
        fetchEvento();
    }, [eventoId]);

    const handleSearch = async () => {
        if (!cuil || cuil.length !== 11) {
            setError('Por favor, ingresa un CUIL válido (11 dígitos, sin guiones).');
            return;
        }

        setLoadingCuil(true);
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
            setError('No se pudo encontrar el participante en CIDI.');
        } finally {
            setLoadingCuil(false);
        }
    };

    const handleConfirm = async () => {
        try {
            setLoadingCuil(true);
            setError('');
            await upsertParticipanteG(participantInfo);
            await confirmarCcAsistencia({ cuil: participantInfo.cuil, evento_id: evento.id });

            setSuccessMessage(`¡Asistencia registrada exitosamente!`);
        } catch (err) {
            setError('Ocurrió un error al registrar la asistencia.');
        } finally {
            setLoadingCuil(false);
        }
    };

    if (loadingEvento) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress size={60} /></Box>;

    if (!evento) return <Container maxWidth="xs" sx={{ mt: 4 }}><Alert severity="error" sx={{ fontSize: '1.1rem' }}>{error}</Alert></Container>;

    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        const partes = fecha.split('-');
        if (partes.length === 3) return `${partes[2]}-${partes[1]}-${partes[0]}`;
        return fecha;
    };

    return (
        <Container maxWidth="xs" sx={{ mt: { xs: 2, sm: 6 }, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Paper
                elevation={6}
                sx={{
                    borderRadius: 4,
                    width: '100%',
                    overflow: 'hidden',
                    boxShadow: '0px 10px 40px rgba(0,0,0,0.1)'
                }}
            >
                <Box sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center' }}>

                    {!successMessage && !participantInfo && (
                        <>
                            <Avatar sx={{ mx: 'auto', mb: 2, width: { xs: 70, sm: 80 }, height: { xs: 70, sm: 80 }, bgcolor: 'primary.light', color: 'primary.main' }}>
                                <AssignmentTurnedInIcon sx={{ fontSize: { xs: 35, sm: 40 } }} />
                            </Avatar>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1, fontSize: { xs: '1.5rem', sm: '1.75rem' } }}>
                                Registro de Asistencia
                            </Typography>
                            <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '1.2rem', sm: '1.3rem' }, lineHeight: 1.3 }}>
                                {evento.curso?.nombre}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" display="block" sx={{ mb: 4, fontSize: { xs: '1.1rem', sm: '1.2rem' } }}>
                                📅 {formatearFecha(evento.fecha)} <br /> 🕒 {evento.horario}
                            </Typography>

                            <Box sx={{ mb: 2 }}>
                                <TextField
                                    placeholder="Ingresa tu CUIL"
                                    variant="outlined"
                                    fullWidth
                                    autoFocus
                                    value={cuil}
                                    onChange={(e) => setCuil(e.target.value.replace(/\D/g, '').slice(0, 11))}
                                    disabled={loadingCuil}
                                    helperText="11 dígitos, sin guiones"
                                    FormHelperTextProps={{
                                        sx: { fontSize: '0.95rem', mt: 1, textAlign: 'left', fontWeight: 500 }
                                    }}
                                    inputProps={{
                                        sx: {
                                            textAlign: 'left',
                                            fontSize: '1.3rem',
                                            fontWeight: 'bold',
                                            letterSpacing: 2,
                                            '&::placeholder': {
                                                fontWeight: 'normal',
                                                letterSpacing: 0,
                                                opacity: 0.7
                                            }
                                        }
                                    }}
                                    InputProps={{
                                        sx: { py: 0.5 },
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton color="primary" onClick={handleSearch} disabled={loadingCuil || cuil.length !== 11} edge="end" size="large" sx={{ mr: 0.5 }}>
                                                    {loadingCuil ? <CircularProgress size={28} color="inherit" /> : <SearchIcon fontSize="large" />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            bgcolor: 'grey.50',
                                            transition: 'all 0.2s',
                                            '&.Mui-focused': {
                                                bgcolor: 'white',
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                                            }
                                        }
                                    }}
                                />
                            </Box>

                            {error && <Alert severity="error" sx={{ borderRadius: 2, mt: 2, textAlign: 'left', fontSize: '1rem' }}>{error}</Alert>}

                            <Button
                                variant="contained"
                                onClick={handleSearch}
                                disabled={loadingCuil || cuil.length !== 11}
                                fullWidth
                                size="large"
                                sx={{ borderRadius: 3, py: 1.8, mt: 2, fontWeight: 'bold', fontSize: '1.15rem' }}
                            >
                                Buscar Datos
                            </Button>
                        </>
                    )}

                    {!successMessage && participantInfo && (
                        <>
                            <Avatar sx={{ mx: 'auto', mb: 2, width: { xs: 70, sm: 80 }, height: { xs: 70, sm: 80 }, bgcolor: 'primary.light', color: 'primary.main' }}>
                                <PersonIcon sx={{ fontSize: { xs: 35, sm: 40 } }} />
                            </Avatar>

                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1, fontSize: { xs: '1.5rem', sm: '1.75rem' } }}>
                                Confirmar Asistencia
                            </Typography>
                            <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold', mb: 2, fontSize: { xs: '1.2rem', sm: '1.3rem' }, lineHeight: 1.3 }}>
                                {evento.curso?.nombre}
                            </Typography>

                            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 3, fontSize: '1.1rem' }}>
                                Verifica tus datos antes de confirmar.
                            </Typography>

                            <Box sx={{ bgcolor: 'grey.50', p: { xs: 2.5, sm: 3 }, borderRadius: 3, mb: 1, border: 1, borderColor: 'divider', textAlign: 'left' }}>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" color="text.secondary" display="block" gutterBottom sx={{ fontSize: '0.95rem', fontWeight: 600, letterSpacing: 0.5 }}>
                                        NOMBRE Y APELLIDO
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1.3rem', sm: '1.45rem' }, lineHeight: 1.2, color: 'text.primary' }}>
                                        {participantInfo.nombre} {participantInfo.apellido}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary" display="block" gutterBottom sx={{ fontSize: '0.95rem', fontWeight: 600, letterSpacing: 0.5 }}>
                                        CUIL
                                    </Typography>
                                    <Typography variant="subtitle1" sx={{ fontFamily: 'monospace', fontSize: { xs: '1.25rem', sm: '1.35rem' }, fontWeight: 600, color: 'text.primary' }}>
                                        {participantInfo.cuil}
                                    </Typography>
                                </Box>
                            </Box>
                        </>
                    )}

                    {successMessage && (
                        <>
                            <CheckCircleIcon color="success" sx={{ mx: 'auto', fontSize: { xs: 90, sm: 110 }, mb: 2, display: 'block' }} />
                            <Typography variant="h5" color="text.primary" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2rem' } }}>
                                ¡Asistencia Exitosa!
                            </Typography>
                            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', mb: 2, fontSize: { xs: '1.4rem', sm: '1.5rem' }, lineHeight: 1.2 }}>
                                {participantInfo?.nombre} {participantInfo?.apellido}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: '1.15rem' }}>
                                Tu asistencia ha sido registrada para <b>{evento.curso?.nombre}</b>
                            </Typography>
                        </>
                    )}
                </Box>

                {error && participantInfo && !successMessage && (
                    <Box sx={{ px: { xs: 3, sm: 5 }, pb: 2 }}>
                        <Alert severity="error" sx={{ fontSize: '1.05rem' }}>{error}</Alert>
                    </Box>
                )}

                {/* Confirm Section Footers */}
                {!successMessage && participantInfo && (
                    <Box sx={{
                        bgcolor: 'grey.50', px: { xs: 3, sm: 5 }, py: { xs: 2.5, sm: 3 }, borderTop: 1, borderColor: 'divider',
                        display: 'flex', flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 2, justifyContent: 'space-between'
                    }}>
                        <Button
                            variant="outlined"
                            onClick={() => setParticipantInfo(null)}
                            startIcon={<CancelIcon />}
                            fullWidth
                            disabled={loadingCuil}
                            size="large"
                            sx={{ fontWeight: 'bold', fontSize: '1.1rem', py: 1.5, color: 'text.secondary', borderColor: 'divider', '&:hover': { borderColor: 'text.primary', bgcolor: 'action.hover' } }}
                        >
                            Cancelar
                        </Button>

                        <Button
                            variant="contained"
                            onClick={handleConfirm}
                            startIcon={loadingCuil ? <CircularProgress size={24} color="inherit" /> : <CheckCircleIcon />}
                            fullWidth
                            disabled={loadingCuil}
                            size="large"
                            sx={{ fontWeight: 'bold', fontSize: '1.1rem', py: 1.5, bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
                        >
                            Confirmar
                        </Button>
                    </Box>
                )}
            </Paper>
        </Container>
    );
}
