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

    useEffect(() => {
        const rememberedCuil = localStorage.getItem('rememberedCuil');
        const rememberedContrasenia = localStorage.getItem('rememberedContrasenia');
        if (rememberedCuil && rememberedContrasenia) {
            setCuil(rememberedCuil);
            setContrasenia(rememberedContrasenia);
            setRememberMe(true);
        }
    }, []);

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

        const data = new FormData(event.currentTarget);
        const cuil = data.get('cuilRecovery');

        try {
            const resp = await recuperoContrasenia(cuil);
            if (resp && resp.cuilRecovery) {
                setMensajeDeExito(
                    `Si el CUIL está registrado, recibirás instrucciones para restablecer tu contraseña en el correo: ${resp.cuilRecovery}`
                );
            } else {
                setMensajeDeExito(
                    "Si el CUIL está registrado, recibirás instrucciones para restablecer tu contraseña."
                );
            }
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
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => setShowPassword(!showPassword)}
                                onMouseDown={(e) => e.preventDefault()}
                                edge="end"
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
            <FormControlLabel
                control={<Checkbox value="remember" color="primary" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />}
                label="Recordar mi usuario y contraseña"
            />
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                    mt: 3,
                    mb: 2,
                    borderRadius: '50px',
                    padding: '10px 0',
                    fontWeight: 'bold',
                }}
                disabled={open}
            >
                Iniciar Sesión
            </Button>
            <Grid container>
                <Grid item xs>
                    <Link href="#" variant="body2" onClick={toggleFormView} sx={{ cursor: 'pointer' }}>
                        ¿Olvidaste tu contraseña?
                    </Link>
                </Grid>
            </Grid>
        </Box>
    );

    const renderForgotPasswordForm = () => (
        <Box component="form" onSubmit={handleForgotPasswordSubmit} noValidate sx={{ mt: 1 }}>

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
                variant="outlined"
            />
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                    mt: 3,
                    mb: 2,
                    borderRadius: '50px',
                    padding: '10px 0',
                    fontWeight: 'bold',
                }}
                disabled={open}
            >
                Enviar Instrucciones
            </Button>
            <Grid container justifyContent="center">
                <Grid item>
                    <Link href="#" variant="body2" onClick={toggleFormView} sx={{ cursor: 'pointer' }}>
                        Volver a Iniciar Sesión
                    </Link>
                </Grid>
            </Grid>
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
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    background: '#f0f2f5',
                }}
            >
                <Container component="main" maxWidth="xs">
                    <CssBaseline />
                    <Paper
                        elevation={6}
                        sx={{
                            padding: '40px 30px',
                            borderRadius: '15px',
                            textAlign: 'center',
                        }}
                    >
                        <Avatar
                            sx={{
                                margin: '0 auto 15px auto',
                                backgroundColor: 'primary.main',
                                width: 60,
                                height: 60,
                            }}
                        >
                            <LockOutlinedIcon fontSize="large" />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            {showForgotPassword ? 'Recuperar Contraseña' : 'Iniciar Sesión'}
                        </Typography>
                        {showForgotPassword ? renderForgotPasswordForm() : renderLoginForm()}
                    </Paper>
                </Container>
            </Box>
        </>
    );
}

export default Login;