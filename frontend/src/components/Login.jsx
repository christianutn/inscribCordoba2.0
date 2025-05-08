import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import obtenerToken from '../services/obtenerToken.js';
// Assume you have a service function for password recovery
// import solicitarRecuperacionContrasenia from '../services/solicitarRecuperacion.js';
import { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from 'react-router-dom';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import { recuperoContrasenia } from '../services/usuarios.service.js'

const defaultTheme = createTheme();

const Login = () => {
    const [mensajeDeError, setMensajeDeError] = useState(null);
    const [mensajeDeExito, setMensajeDeExito] = useState(null);
    const [open, setOpen] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setOpen(true);
        setMensajeDeError(null);
        setMensajeDeExito(null);

        const data = new FormData(event.currentTarget);

        try {
            const token = await obtenerToken(data.get('cuil'), data.get('contrasenia'));
            localStorage.setItem('jwt', token);
            navigate("/principal");
        } catch (error) {
            if (error.response && error.response.status === 429) {
                setMensajeDeError(error.response.data?.message || 'Demasiados intentos. Intente más tarde.');
            } else if (error.response && error.response.status === 401) {
                setMensajeDeError("Usuario o contraseña incorrectos");
            }
            else {
                setMensajeDeError("Ocurrió un error inesperado. Intente nuevamente.");
                console.error("Login error:", error);
            }
        } finally {
            setOpen(false);
        }
    };

    const handleForgotPasswordSubmit = async (event) => {
        event.preventDefault();
        setOpen(true);
        setMensajeDeError(null);
        setMensajeDeExito(null);

        const data = new FormData(event.currentTarget);
        const cuil = data.get('cuilRecovery');

        try {
            await recuperoContrasenia(cuil);
            console.log("Requesting password recovery for CUIL:", cuil);
            // Example: await solicitarRecuperacionContrasenia(cuil);
            // await new Promise(resolve => setTimeout(resolve, 1500));

            setMensajeDeExito("Si el CUIL está registrado, recibirás instrucciones para restablecer tu contraseña.");
            // setShowForgotPassword(false); // Optionally switch back

        } catch (error) {
            console.error("Password recovery error:", error);
            setMensajeDeError("No se pudo procesar la solicitud de recuperación. Intente nuevamente.");
        } finally {
            setOpen(false);
        }
    };

    useEffect(() => {
        let errorTimer;
        let successTimer;
        if (mensajeDeError) {
            errorTimer = setTimeout(() => {
                setMensajeDeError(null);
            }, 4000);
        }
        if (mensajeDeExito) {
            successTimer = setTimeout(() => {
                setMensajeDeExito(null);
            }, 5000);
        }
        return () => {
            clearTimeout(errorTimer);
            clearTimeout(successTimer);
        };
    }, [mensajeDeError, mensajeDeExito]);

    const toggleFormView = (event) => {
        event.preventDefault();
        setShowForgotPassword(!showForgotPassword);
        setMensajeDeError(null);
        setMensajeDeExito(null);
    };

    const renderAlerts = () => (
        <Stack
            sx={{
                width: '100%',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
            }}
            spacing={0}
        >
            {mensajeDeError && (
                <Alert variant="filled" severity="error" sx={{ width: '100%', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} >
                    {mensajeDeError}
                </Alert>
            )}
            {mensajeDeExito && (
                <Alert variant="filled" severity="success" sx={{ width: '100%', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
                    {mensajeDeExito}
                </Alert>
            )}
        </Stack>
    );

    const renderLoginForm = () => (
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
                margin="normal"
                required
                fullWidth
                id="cuil"
                label="Nombre de usuario"
                name="cuil"
                autoComplete="username"
                autoFocus
                variant="standard"
            />
            <TextField
                margin="normal"
                required
                fullWidth
                name="contrasenia"
                label="Contraseña"
                type="password"
                id="contrasenia"
                autoComplete="current-password"
                variant="standard"
            />
            <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Recordar mi usuario"
                sx={{ display: 'flex', alignItems: 'center', mt: 1 }}
            />
            <Grid container sx={{ mt: 1 }}>
                <Grid item xs style={{ textAlign: 'center' }}>
                    <Link href="#" variant="body2" onClick={toggleFormView}>
                        ¿Olvidaste tu contraseña?
                    </Link>
                </Grid>
            </Grid>
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                    mt: 3,
                    mb: 2,
                    bgcolor: '#073256',
                    color: '#fff',
                    borderRadius: '50px',
                    '&:hover': {
                        bgcolor: '#0A4B7F',
                    }
                }}
                disabled={open}
            >
                Iniciar Sesión
            </Button>
        </Box>
    );

    const renderForgotPasswordForm = () => (
        <Box component="form" onSubmit={handleForgotPasswordSubmit} noValidate sx={{ mt: 1 }}>
            <Typography component="h2" variant="h6" align="center" sx={{ mb: 2, color: '#073256' }}>
                Recuperar Contraseña
            </Typography>
            <Typography variant="body2" align="center" sx={{ mb: 2 }}>
                Ingresa tu CUIL para recibir instrucciones de recuperación.
            </Typography>
            <TextField
                margin="normal"
                required
                fullWidth
                id="cuilRecovery"
                label="CUIL"
                name="cuilRecovery"
                autoComplete="username"
                autoFocus
                variant="standard"
            />
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                    mt: 3,
                    mb: 2,
                    bgcolor: '#073256',
                    color: '#fff',
                    borderRadius: '50px',
                    '&:hover': {
                        bgcolor: '#0A4B7F',
                    }
                }}
                disabled={open}
                
            >
                Enviar Instrucciones
            </Button>   
            <Grid container>
                <Grid item xs style={{ textAlign: 'center' }}>
                    <Link href="#" variant="body2" onClick={toggleFormView}>
                        Volver a Iniciar Sesión
                    </Link>
                </Grid>
            </Grid>
        </Box>
    );

    return (
        <>
            {renderAlerts()}

            {open && (
                <Backdrop
                    sx={{ color: '#00519C', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={open}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
            )}

            <div className="body-login">
                <ThemeProvider theme={defaultTheme}>
                    <Container component="main" maxWidth="xs" className="login-container">
                        <CssBaseline />
                        <Box
                            className="login-box"
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <div className="login-avatar">
                                <AccountCircle style={{ fontSize: 150, color: '#073256' }} />
                            </div>

                            {showForgotPassword ? renderForgotPasswordForm() : renderLoginForm()}

                        </Box>
                    </Container>
                </ThemeProvider>
            </div>
        </>
    );
}

export default Login;