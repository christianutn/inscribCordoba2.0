import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cambiarContrasenia } from "../services/usuarios.service.js";
import Footer from './layout/footer';

// Material UI Components
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import CssBaseline from '@mui/material/CssBaseline';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

// Icons
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const CambioContrasenia = () => {
    const navigate = useNavigate();

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [nuevaContrasenia, setNuevaContrasenia] = useState("");
    const [nuevaContraseniaConfirmada, setNuevaContraseniaConfirmada] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        let errorTimer;
        if (error) {
            errorTimer = setTimeout(() => {
                setError(null);
            }, 4000);
        }
        return () => clearTimeout(errorTimer);
    }, [error]);

    const limpiarFormulario = () => {
        setNuevaContrasenia("");
        setNuevaContraseniaConfirmada("");
    };

    const validarDatos = () => {
        if (!nuevaContrasenia) {
            throw new Error("Es necesario ingresar una nueva contraseña");
        }
        if (!nuevaContraseniaConfirmada) {
            throw new Error("Es necesario confirmar la nueva contraseña");
        }
        if (nuevaContrasenia !== nuevaContraseniaConfirmada) {
            throw new Error("Las contraseñas no coinciden");
        }
    };

    const handleEnviar = async (e) => {
        e.preventDefault();
        try {
            setCargando(true);
            validarDatos();

            await cambiarContrasenia(nuevaContrasenia);
            setSuccess(true);
            setError(null);
            limpiarFormulario();

            setTimeout(() => {
                localStorage.removeItem("jwt");
                navigate("/login");
            }, 3000);

        } catch (error) {
            setError(error.message);
            setSuccess(false);
        } finally {
            setCargando(false);
        }
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
            {error && (
                <Alert variant="filled" severity="error">
                    {error}
                </Alert>
            )}
            {success && (
                <Alert variant="filled" severity="success">
                    Contraseña actualizada con éxito. Deberá ingresar nuevamente con su nueva clave.
                </Alert>
            )}
        </Stack>
    );

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                background: '#f4f6f8',
            }}
        >
            <CssBaseline />
            {renderAlerts()}

            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={cargando}
            >
                <CircularProgress color="inherit" />
            </Backdrop>

            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
                <Container component="main" maxWidth="xs">
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
                            Cambio de contraseña
                        </Typography>

                        <Alert
                            severity="info"
                            sx={{
                                textAlign: 'left',
                                mb: 4,
                                '& .MuiAlert-message': {
                                    fontSize: '1.1rem',
                                    lineHeight: 1.5
                                },
                                '& .MuiAlert-icon': {
                                    fontSize: '1.5rem'
                                }
                            }}
                        >
                            Es necesario el cambio de su contraseña.
                        </Alert>

                        <Box component="form" onSubmit={handleEnviar} noValidate sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Nueva contraseña"
                                type={showPassword ? "text" : "password"}
                                id="nuevaContrasenia"
                                variant="outlined"
                                autoFocus
                                value={nuevaContrasenia}
                                onChange={(e) => setNuevaContrasenia(e.target.value)}
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

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Repite la nueva contraseña"
                                type={showConfirmPassword ? "text" : "password"}
                                id="nuevaContraseniaConfirmada"
                                variant="outlined"
                                value={nuevaContraseniaConfirmada}
                                onChange={(e) => setNuevaContraseniaConfirmada(e.target.value)}
                                sx={{
                                    '& .MuiInputLabel-root': { fontSize: '1.1rem' },
                                    '& .MuiOutlinedInput-root': { fontSize: '1.15rem' }
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle confirm password visibility"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                onMouseDown={(e) => e.preventDefault()}
                                                edge="end"
                                                size="large"
                                            >
                                                {showConfirmPassword ? <VisibilityOff fontSize="medium" /> : <Visibility fontSize="medium" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
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
                                disabled={cargando}
                            >
                                ENVIAR
                            </Button>

                            <Grid container justifyContent="center">
                                <Grid item>
                                    <Link
                                        component="button"
                                        variant="body1"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            navigate("/login");
                                        }}
                                        sx={{
                                            cursor: 'pointer',
                                            textDecoration: 'none',
                                            color: 'primary.main',
                                            fontWeight: 'medium',
                                            fontSize: '1.1rem',
                                            '&:hover': {
                                                textDecoration: 'underline'
                                            }
                                        }}
                                    >
                                        Volver al Inicio de Sesión
                                    </Link>
                                </Grid>
                            </Grid>
                        </Box>

                    </Paper>
                </Container>
            </Box>
            <Footer />
        </Box>
    );
};

export default CambioContrasenia;