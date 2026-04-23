import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import BurbujasLoader from './UIElements/BurbujasLoader';
import { useNavigate, useLocation } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Footer from './layout/footer';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useAuth } from '../context/AuthContext';
import config from '../config.js';
import Button from '@mui/material/Button';

const Login = () => {
    const { user, loading, showSessionExpired, cidiError, setCidiError } = useAuth();
    const [mensajeDeError, setMensajeDeError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/principal";

    useDocumentTitle('Redirigiendo...');

    useEffect(() => {
        // Esperamos a que AuthContext termine de chequear el estado inicial
        if (loading) return;

        if (user) {
            navigate(from, { replace: true });
            return;
        }

        // Si hubo un error en CiDi, lo pasamos al estado local y nos detenemos para que el usuario lo vea
        if (cidiError) {
            setMensajeDeError(cidiError);
            setCidiError(null);
            return;
        }

        // Verificar si venimos de un cierre por inactividad
        const reason = localStorage.getItem('logout_reason');
        if (reason === 'inactivity') {
            if (!showSessionExpired) {
                setMensajeDeError("Tu sesión ha expirado por inactividad. Por favor, ingresa de nuevo.");
            }
            localStorage.removeItem('logout_reason');
            return; // Nos detenemos para que el usuario vea el mensaje
        }

        // Si ya hay un error mostrándose, no redirigimos para evitar un bucle
        if (mensajeDeError) return;

        // Si no hay usuario, no está cargando y no hay errores -> Redirigimos directo a CiDi
        window.location.href = config.cidiLoginUrl;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, navigate, cidiError, loading, mensajeDeError, showSessionExpired]);

    const renderAlerts = () => (
        <Stack
            sx={{
                width: '100%',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 9999,
            }}
            spacing={0}
        >
            {mensajeDeError && (
                <Alert variant="filled" severity="error">
                    {mensajeDeError}
                </Alert>
            )}
        </Stack>
    );

    return (
        <>
            {renderAlerts()}

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                    background: '#f4f6f8',
                }}
            >
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
                    <Container component="main" maxWidth="xs" sx={{ mt: 8, mb: 8 }}>
                        <CssBaseline />
                        <Paper
                            elevation={6}
                            sx={{
                                padding: '48px 32px',
                                borderRadius: '16px',
                                textAlign: 'center',
                            }}
                        >
                            <Avatar
                                sx={{
                                    margin: '0 auto 20px auto',
                                    backgroundColor: 'primary.main',
                                    width: 80,
                                    height: 80,
                                }}
                            >
                                <LockOutlinedIcon sx={{ fontSize: 45 }} />
                            </Avatar>
                            
                            {!mensajeDeError ? (
                                <>
                                    <Typography
                                        component="h1"
                                        variant="h5"
                                        sx={{ fontWeight: 'bold', mb: 3 }}
                                    >
                                        Conectando con Ciudadano Digital...
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px', py: 2 }}>
                                        <BurbujasLoader />
                                    </Box>
                                </>
                            ) : (
                                <>
                                    <Typography
                                        component="h1"
                                        variant="h5"
                                        color="error"
                                        sx={{ fontWeight: 'bold', mb: 3 }}
                                    >
                                        Error de Autenticación
                                    </Typography>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={() => {
                                            setMensajeDeError(null);
                                            window.location.href = config.cidiLoginUrl;
                                        }}
                                        sx={{
                                            borderRadius: '50px',
                                            padding: '12px 0',
                                            fontWeight: 'bold',
                                            backgroundColor: '#1976d2',
                                            color: '#fff',
                                            mt: 2
                                        }}
                                    >
                                        Reintentar ingreso
                                    </Button>
                                </>
                            )}
                        </Paper>
                    </Container>
                </Box>
                <Footer />
            </Box>
        </>
    );
}

export default Login;