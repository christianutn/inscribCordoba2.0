import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
    Container, Box, Typography, Button, TextField, CircularProgress,
    Alert, Paper, Avatar, InputAdornment, IconButton, useTheme, useMediaQuery, Stack
} from '@mui/material';
import {
    Search as SearchIcon,
    CheckCircle as CheckCircleIcon,
    Person as PersonIcon,
    Cancel as CancelIcon,
    AssignmentTurnedIn as AssignmentTurnedInIcon,
    EventBusy as EventBusyIcon,
    Facebook as FacebookIcon,
    X as XIcon,
    Instagram as InstagramIcon,
    YouTube as YouTubeIcon
} from '@mui/icons-material';
import { getPersonaCidi, confirmarCcAsistencia, getCcAsistenciaEventoById, upsertParticipanteG } from '../../services/cc_asistencia.service.js';
import logoCba from '../imagenes/gobierno_blanco.png';

export default function RegistroCcAsistencia() {
    const { eventoId } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [evento, setEvento] = useState(null);
    const [loadingEvento, setLoadingEvento] = useState(true);
    const [error, setError] = useState('');

    const [cuil, setCuil] = useState('');
    const [participantInfo, setParticipantInfo] = useState(null);
    const [loadingCuil, setLoadingCuil] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [eventoValido, setEventoValido] = useState(true);

    useEffect(() => {
        const fetchEvento = async () => {
            try {
                const data = await getCcAsistenciaEventoById(eventoId);
                const today = dayjs().format('YYYY-MM-DD');
                if (data.fecha !== today) {
                    setEventoValido(false);
                }
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
                nombre: data.nombre,
                apellido: data.apellido
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
            const backendError = err.response?.data?.message || err.message;
            setError(backendError || 'Ocurrió un error al registrar la asistencia.');
        } finally {
            setLoadingCuil(false);
        }
    };

    if (loadingEvento) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><CircularProgress size={60} /></Box>;

    if (!evento) return <Container maxWidth="xs" sx={{ mt: 8 }}><Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert></Container>;

    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        const partes = fecha.split('-');
        if (partes.length === 3) return `${partes[2]}-${partes[1]}-${partes[0]}`;
        return fecha;
    };

    const formatearHorario = (texto) => {
        if (!texto) return '';
        let procesado = texto.toLowerCase();
        procesado = procesado.replace(/\bhs?\.?\b/g, '').trim();
        procesado = procesado.replace(/\b(\d{1,2})(?::(\d{2}))?\b/g, (match, hora, min) => {
            const h = hora.padStart(2, '0');
            const m = min || '00';
            return `${h}:${m}`;
        });
        procesado = procesado.replace(/\s+/g, ' ').trim();
        return procesado ? `${procesado}` : '';
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            minHeight: '100dvh', // Dynamic viewport height for modern browsers
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#F8FAFC'
        }}>
            <Container
                maxWidth="xs"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center', // Horizontal centering
                    py: { xs: 2, sm: 4 }, // Slightly less padding on mobile
                    px: 2
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: '24px',
                        width: '100%',
                        overflow: 'hidden',
                        boxShadow: '0 12px 48px rgba(0,0,0,0.08)',
                        border: '1px solid #E2E8F0',
                        bgcolor: '#fff'
                    }}
                >
                    <Box sx={{ p: { xs: 4, sm: 5 }, textAlign: 'center' }}>

                        {!eventoValido && (
                            <>
                                <Avatar sx={{ mx: 'auto', mb: 3, width: 80, height: 80, bgcolor: '#ffebe9', color: 'error.main', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }}>
                                    <EventBusyIcon sx={{ fontSize: 40 }} />
                                </Avatar>

                                <Typography variant="h5" sx={{ fontFamily: 'Geogrotesque Sharp', fontWeight: 'bold', color: '#1A1A1A', mb: 1 }}>
                                    Registro no disponible
                                </Typography>

                                <Typography variant="h6" sx={{ fontFamily: 'Poppins', color: 'primary.main', fontWeight: 600, mb: 1, lineHeight: 1.3 }}>
                                    {evento.curso?.nombre}
                                </Typography>

                                <Alert severity="error" sx={{ mt: 3, mb: 3, borderRadius: '12px', textAlign: 'left', fontFamily: 'Poppins' }}>
                                    No es posible confirmar la asistencia en este momento. La fecha del evento <strong>({formatearFecha(evento.fecha)})</strong> no coincide con la fecha actual.
                                </Alert>

                                <Button
                                    variant="outlined"
                                    onClick={() => window.location.reload()}
                                    fullWidth
                                    sx={{ fontFamily: 'Geogrotesque Sharp', borderRadius: '12px', py: 1.5, fontWeight: 'bold', fontSize: '1rem', color: 'error.main', borderColor: 'error.main' }}
                                >
                                    ACTUALIZAR PÁGINA
                                </Button>
                            </>
                        )}

                        {eventoValido && !successMessage && !participantInfo && (
                            <>
                                <Avatar sx={{ mx: 'auto', mb: 3, width: 80, height: 80, bgcolor: 'primary.light', color: 'primary.main', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }}>
                                    <AssignmentTurnedInIcon sx={{ fontSize: 40 }} />
                                </Avatar>

                                <Typography variant="h5" sx={{ fontFamily: 'Geogrotesque Sharp', fontWeight: 'bold', color: '#1A1A1A', mb: 1 }}>
                                    Registro de Asistencia
                                </Typography>

                                <Typography variant="h6" sx={{ fontFamily: 'Poppins', color: 'primary.main', fontWeight: 600, mb: 1, lineHeight: 1.3 }}>
                                    {evento.curso?.nombre}
                                </Typography>

                                <Typography variant="body1" sx={{ fontFamily: 'Poppins', color: '#64748B', mb: 4 }}>
                                    📅 {formatearFecha(evento.fecha)} <br /> 🕒 {formatearHorario(evento.horario)}
                                </Typography>

                                <Box sx={{ mb: 3 }}>
                                    <TextField
                                        placeholder="Ingresa tu CUIL"
                                        variant="outlined"
                                        fullWidth
                                        autoFocus
                                        value={cuil}
                                        onChange={(e) => setCuil(e.target.value.replace(/\D/g, '').slice(0, 11))}
                                        disabled={loadingCuil}
                                        helperText="11 dígitos, sin guiones"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonIcon sx={{ color: '#94A3B8' }} />
                                                </InputAdornment>
                                            ),
                                            sx: {
                                                fontFamily: 'Poppins',
                                                borderRadius: '12px',
                                                fontSize: '1.2rem',
                                                fontWeight: 600,
                                                letterSpacing: 2,
                                                bgcolor: '#F8FAFC',
                                                '& fieldset': { borderColor: '#E2E8F0' },
                                                '&:hover fieldset': { borderColor: 'primary.main' }
                                            }
                                        }}
                                        FormHelperTextProps={{ sx: { fontFamily: 'Poppins', mt: 1, fontWeight: 500 } }}
                                    />
                                </Box>

                                {error && <Alert severity="error" sx={{ borderRadius: '12px', mb: 3, textAlign: 'left' }}>{error}</Alert>}

                                <Button
                                    variant="contained"
                                    onClick={handleSearch}
                                    disabled={loadingCuil || cuil.length !== 11}
                                    fullWidth
                                    sx={{
                                        fontFamily: 'Geogrotesque Sharp',
                                        borderRadius: '12px',
                                        py: 2,
                                        fontWeight: 'bold',
                                        fontSize: '1.1rem',
                                        boxShadow: '0 4px 12px rgba(0,123,255,0.2)'
                                    }}
                                >
                                    {loadingCuil ? <CircularProgress size={24} color="inherit" /> : 'BUSCAR DATOS'}
                                </Button>
                            </>
                        )}

                        {eventoValido && !successMessage && participantInfo && (
                            <>
                                <Avatar sx={{ mx: 'auto', mb: 3, width: 80, height: 80, bgcolor: 'primary.light', color: 'primary.main', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }}>
                                    <PersonIcon sx={{ fontSize: 40 }} />
                                </Avatar>

                                <Typography variant="h5" sx={{ fontFamily: 'Geogrotesque Sharp', fontWeight: 'bold', color: '#1A1A1A', mb: 1 }}>
                                    Confirmar Datos
                                </Typography>

                                <Typography variant="body1" sx={{ fontFamily: 'Poppins', color: '#64748B', mb: 4 }}>
                                    Verifica tu información antes de registrar la asistencia.
                                </Typography>

                                <Paper
                                    elevation={0}
                                    sx={{
                                        bgcolor: '#F8FAFC',
                                        p: 3,
                                        borderRadius: '16px',
                                        mb: 4,
                                        border: '1px solid #E2E8F0',
                                        textAlign: 'left'
                                    }}
                                >
                                    <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', color: '#64748B', fontWeight: 600, mb: 1, letterSpacing: 0.5 }}>
                                        NOMBRE Y APELLIDO
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontFamily: 'Geogrotesque Sharp', fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
                                        {participantInfo.nombre} {participantInfo.apellido}
                                    </Typography>

                                    <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', color: '#64748B', fontWeight: 600, mb: 1, letterSpacing: 0.5 }}>
                                        CUIL
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontFamily: 'Poppins', fontWeight: 600, color: '#1A1A1A' }}>
                                        {participantInfo.cuil}
                                    </Typography>
                                </Paper>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleConfirm}
                                        disabled={loadingCuil}
                                        fullWidth
                                        sx={{
                                            fontFamily: 'Geogrotesque Sharp',
                                            borderRadius: '12px',
                                            py: 2,
                                            fontWeight: 'bold',
                                            fontSize: '1.1rem',
                                            boxShadow: '0 4px 12px rgba(0,123,255,0.2)'
                                        }}
                                    >
                                        {loadingCuil ? <CircularProgress size={24} color="inherit" /> : 'CONFIRMAR ASISTENCIA'}
                                    </Button>

                                    <Button
                                        variant="text"
                                        onClick={() => setParticipantInfo(null)}
                                        disabled={loadingCuil}
                                        fullWidth
                                        sx={{
                                            fontFamily: 'Geogrotesque Sharp',
                                            color: '#64748B',
                                            fontWeight: 'bold',
                                            fontSize: '1rem',
                                            py: 1.5
                                        }}
                                    >
                                        CANCELAR
                                    </Button>
                                </Box>
                            </>
                        )}

                        {eventoValido && successMessage && (
                            <>
                                <CheckCircleIcon sx={{ fontSize: 100, color: 'success.main', mb: 3 }} />

                                <Typography variant="h4" sx={{ fontFamily: 'Geogrotesque Sharp', fontWeight: 'bold', color: '#1A1A1A', mb: 2 }}>
                                    ¡Registro Exitoso!
                                </Typography>

                                <Typography variant="h6" sx={{ fontFamily: 'Poppins', color: 'primary.main', fontWeight: 600, mb: 2 }}>
                                    {participantInfo?.nombre} {participantInfo?.apellido}
                                </Typography>

                                <Typography variant="body1" sx={{ fontFamily: 'Poppins', color: '#64748B', mb: 4, lineHeight: 1.6 }}>
                                    Tu asistencia ha sido registrada correctamente para:<br />
                                    <strong>{evento.curso?.nombre}</strong>
                                </Typography>
                            </>
                        )}
                    </Box>

                    {eventoValido && error && participantInfo && !successMessage && (
                        <Box sx={{ px: 4, pb: 4 }}>
                            <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>
                        </Box>
                    )}
                </Paper>
            </Container>

            {/* Footer Institucional Transparente Vertical para Mobile */}
            <Box
                component="footer"
                sx={{
                    backgroundColor: "transparent",
                    color: "#64748B",
                    width: "100%",
                    py: 4,
                    mt: 'auto',
                    textAlign: 'center'
                }}
            >
                <Container maxWidth="xs">
                    <Stack spacing={1} alignItems="center">
                        {/* Logo solicitado: gobierno_blanco.png con filtro para gris oscuro */}
                        <Box
                            component="img"
                            src={logoCba}
                            alt="Gobierno de Córdoba"
                            sx={{
                                width: '220px',
                                height: "auto",
                                // Aplicamos brillo 0 y opacidad baja para lograr un gris institucional
                                filter: 'brightness(0) opacity(0.6)',
                                mb: 1 // Pequeño espacio positivo hacia abajo
                            }}
                        />

                        {/* Redes Sociales en Gris */}
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <IconButton
                                size="small"
                                sx={{ color: '#636465' }}
                                component="a"
                                href="https://es-la.facebook.com/gobdecordoba/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <FacebookIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                                size="small"
                                sx={{ color: '#636465' }}
                                component="a"
                                href="https://x.com/gobdecordoba?lang=es"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <XIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                                size="small"
                                sx={{ color: '#636465' }}
                                component="a"
                                href="https://www.instagram.com/cordobaok/?hl=es-la"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <InstagramIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                                size="small"
                                sx={{ color: '#636465' }}
                                component="a"
                                href="https://www.youtube.com/user/gobiernodecordoba"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <YouTubeIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                    </Stack>
                </Container>
            </Box>
        </Box>
    );
}
