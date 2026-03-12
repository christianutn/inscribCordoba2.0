import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import obtenerToken from '../services/obtenerToken.js';
import { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from 'react-router-dom';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import { recuperoContrasenia } from '../services/usuarios.service.js';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Footer from './layout/footer';
import useDocumentTitle from '../hooks/useDocumentTitle.js';



const Login = () => {
    const [mensajeDeError, setMensajeDeError] = useState(null);
    const [mensajeDeExito, setMensajeDeExito] = useState(null);
    const [open, setOpen] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const navigate = useNavigate();
    const [cuil, setCuil] = useState('');
    const [contrasenia, setContrasenia] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [cuilRecovery, setCuilRecovery] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [maskedEmail, setMaskedEmail] = useState('');

    useDocumentTitle(showForgotPassword ? 'Recuperar Contraseña' : 'Iniciar Sesión');

    useEffect(() => {
        const token = localStorage.getItem('jwt');
        if (token) {
            navigate("/principal");
        }

        const rememberedCuil = localStorage.getItem('rememberedCuil');
        const rememberedContrasenia = localStorage.getItem('rememberedContrasenia');
        if (rememberedCuil && rememberedContrasenia) {
            setCuil(rememberedCuil);
            setContrasenia(rememberedContrasenia);
            setRememberMe(true);
        }
    }, [navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setOpen(true);
        setMensajeDeError(null);
        setMensajeDeExito(null);

        try {
            const token = await obtenerToken(cuil, contrasenia);
            localStorage.setItem('jwt', token);
            if (rememberMe) {
                localStorage.setItem('rememberedCuil', cuil);
                localStorage.setItem('rememberedContrasenia', contrasenia);
            } else {
                localStorage.removeItem('rememberedCuil');
                localStorage.removeItem('rememberedContrasenia');
            }
            navigate("/principal");
        } catch (error) {
            if (error.statusCode === 429) {
                setMensajeDeError(error.message);
            } else {
                setMensajeDeError("Usuario o contraseña incorrectos");
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

        try {
            const resp = await recuperoContrasenia(cuilRecovery);
            if (resp && resp.cuilRecovery) {
                setMaskedEmail(resp.cuilRecovery);
                setMensajeDeExito(
                    `Instrucciones enviadas al correo registrado.`
                );
            } else {
                setMensajeDeExito(
                    "Instrucciones enviadas al correo registrado."
                );
            }
            setEmailSent(true);
        } catch (error) {
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
        setCuilRecovery('');
        setEmailSent(false);
        setMaskedEmail('');
    };

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
            {mensajeDeExito && (
                <Alert variant="filled" severity="success">
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
                autoComplete="username"
                autoFocus
                variant="outlined"
                value={cuil}
                onChange={(e) => setCuil(e.target.value)}
                sx={{
                    '& .MuiInputLabel-root': { fontSize: '1.1rem' },
                    '& .MuiOutlinedInput-root': { fontSize: '1.15rem' }
                }}
            />
            <TextField
                margin="normal"
                required
                fullWidth
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                id="contrasenia"
                autoComplete="current-password"
                variant="outlined"
                value={contrasenia}
                onChange={(e) => setContrasenia(e.target.value)}
                sx={{
                    '& .MuiInputLabel-root': { fontSize: '1.1rem' },
                    '& .MuiOutlinedInput-root': { fontSize: '1.15rem' }
                }}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => setShowPassword(!showPassword)}
                                onMouseDown={(e) => e.preventDefault()}
                                edge="end"
                                size="large"
                            >
                                {showPassword ? <VisibilityOff fontSize="medium" /> : <Visibility fontSize="medium" />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
            <FormControlLabel
                control={<Checkbox value="remember" color="primary" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />}
                label={<Typography variant="body1" sx={{ fontSize: '1.05rem' }}>Recordar mi usuario y contraseña</Typography>}
                sx={{ mt: 1 }}
            />
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                    mt: 4,
                    mb: 3,
                    borderRadius: '50px',
                    padding: '14px 0',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    letterSpacing: '0.5px'
                }}
                disabled={open}
            >
                Iniciar Sesión
            </Button>
            <Grid container justifyContent="center">
                <Grid item>
                    <Link
                        href="#"
                        variant="body1"
                        onClick={toggleFormView}
                        sx={{
                            cursor: 'pointer',
                            textDecoration: 'none',
                            color: 'primary.dark', // High contrast blue
                            fontWeight: 'medium',
                            fontSize: '1.1rem',
                            '&:hover': {
                                textDecoration: 'underline'
                            }
                        }}
                    >
                        ¿Olvidaste tu contraseña?
                    </Link>
                </Grid>
            </Grid>
        </Box>
    );

    const renderForgotPasswordForm = () => (
        <Box component="form" onSubmit={handleForgotPasswordSubmit} noValidate sx={{ mt: 1 }}>
            {!emailSent ? (
                <>
                    <Typography variant="body1" align="center" sx={{ mb: 3, fontSize: '1.1rem' }}>
                        Ingresa tu CUIL para recibir instrucciones de recuperación.
                    </Typography>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="cuilRecovery"
                        label="CUIL"
                        name="cuilRecovery"
                        autoComplete="off"
                        autoFocus
                        variant="outlined"
                        value={cuilRecovery}
                        onChange={(e) => setCuilRecovery(e.target.value)}
                        sx={{
                            '& .MuiInputLabel-root': { fontSize: '1.1rem' },
                            '& .MuiOutlinedInput-root': { fontSize: '1.15rem' }
                        }}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{
                            mt: 4,
                            mb: 3,
                            borderRadius: '50px',
                            padding: '14px 0',
                            fontWeight: 'bold',
                            fontSize: '1.2rem',
                            letterSpacing: '0.5px'
                        }}
                        disabled={open || !cuilRecovery.trim()}
                    >
                        Enviar Instrucciones
                    </Button>
                    <Grid container justifyContent="center">
                        <Grid item>
                            <Link
                                href="#"
                                variant="body1"
                                onClick={toggleFormView}
                                sx={{
                                    cursor: 'pointer',
                                    textDecoration: 'none',
                                    color: 'primary.dark',
                                    fontWeight: 'medium',
                                    fontSize: '1.1rem',
                                    '&:hover': {
                                        textDecoration: 'underline'
                                    }
                                }}
                            >
                                Volver a Iniciar Sesión
                            </Link>
                        </Grid>
                    </Grid>
                </>
            ) : (
                <>
                    <Box sx={{
                        bgcolor: '#e8f5e9',
                        p: 3,
                        borderRadius: 2,
                        mb: 3,
                        textAlign: 'center'
                    }}>
                        <Typography variant="h6" sx={{ color: '#2e7d32', mb: 2, fontWeight: 'bold' }}>
                            ✓ Instrucciones Enviadas
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            Hemos enviado las instrucciones para restablecer tu contraseña al siguiente correo:
                        </Typography>
                        {maskedEmail && (
                            <Typography
                                variant="h6"
                                sx={{
                                    color: '#1976d2',
                                    mb: 2,
                                    fontWeight: 'medium',
                                    wordBreak: 'break-all',
                                    overflowWrap: 'anywhere'
                                }}
                            >
                                {maskedEmail}
                            </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            Por favor, revisa tu bandeja de entrada y sigue los pasos indicados en el correo.
                        </Typography>
                    </Box>
                    <Grid container justifyContent="center">
                        <Grid item>
                            <Link
                                href="#"
                                variant="body1"
                                onClick={toggleFormView}
                                sx={{
                                    cursor: 'pointer',
                                    textDecoration: 'none',
                                    color: 'primary.dark',
                                    fontWeight: 'medium',
                                    fontSize: '1.1rem',
                                    '&:hover': {
                                        textDecoration: 'underline'
                                    }
                                }}
                            >
                                Volver a Iniciar Sesión
                            </Link>
                        </Grid>
                    </Grid>
                </>
            )}
        </Box>
    );

    return (
        <>
            {renderAlerts()}
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={open}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
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
                            <Typography
                                component="h1"
                                variant="h4"
                                sx={{
                                    fontWeight: 'bold',
                                    mb: 3,
                                    fontSize: { xs: '1.75rem', sm: '2rem' }
                                }}
                            >
                                {showForgotPassword ? 'Recuperar Contraseña' : 'Iniciar Sesión'}
                            </Typography>
                            {showForgotPassword ? renderForgotPasswordForm() : renderLoginForm()}
                        </Paper>
                    </Container>
                </Box>
                <Footer />
            </Box>
        </>
    );
}

export default Login;