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
import { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from 'react-router-dom';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';


// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

const Login = () => {

    //Setear mensaje de error
    const [mensajeDeError, setMensajeDeError] = useState(null);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const handleSubmit = async (event) => {
        event.preventDefault();
        setOpen(true);

        const data = new FormData(event.currentTarget);

        try {
            //se obtiene el token en caso de ser cuil y password correctos
            const token = await obtenerToken(data.get('cuil'), data.get('contrasenia'));

            //Guardar token en header authorization

            localStorage.setItem('jwt', token);

            setMensajeDeError(null);

            navigate("/principal");

        } catch (error) {
            if(error.statusCode === 429){
                setMensajeDeError(error.message);
            } else {
                setMensajeDeError("Usuario o contraseña incorrectos");
            }
            
        } finally {
            setOpen(false);
        }
    };

    useEffect(() => {
        let timer;
        if (mensajeDeError) {
            timer = setTimeout(() => {
                setMensajeDeError(null); // Oculta el mensaje después 1.2 segundos
            }, 1200); // cantidad de segundos 
        }
        return () => clearTimeout(timer); // Limpia el temporizador si el componente se desmonta
    }, [mensajeDeError]);

    return (
        <>
            {mensajeDeError && (
                <Stack
                    sx={{
                        width: '100%', // Ocupa todo el ancho de la pantalla
                        position: 'fixed',
                        top: 0, // Posición en la parte superior de la pantalla
                        left: 0,
                        zIndex: 9999,
                    }}
                    spacing={2}
                >
                    <Alert variant="filled" severity="error" sx={{ width: '100%' }} >
                        {mensajeDeError}
                    </Alert>
                </Stack>
            )}
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
                                <AccountCircle  style={{ fontSize: 150, color: '#073256' }} /> {/* Aplica la clase directamente */}
                            </div>

                            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    id="cuil"
                                    label="Nombre de usuario"
                                    name="cuil"
                                    autoComplete="cuil"
                                    autoFocus
                                    variant="standard"  // Cambiar el campo de texto a un estilo de línea

                                />

                                <TextField
                                    margin="normal"
                                    fullWidth
                                    name="contrasenia"
                                    label="Contraseña"
                                    type="password"
                                    id="contrasenia"
                                    autoComplete="current-password"
                                    variant="standard"  // Cambiar el campo de texto a un estilo de línea
                                />

                                <FormControlLabel
                                    control={<Checkbox value="remember" color="primary" />}
                                    label="Recordar mi usuario"
                                    sx={{ display: 'flex', alignItems: 'center', }} // Estilos 
                                />


                                <Grid container>
                                    <Grid item xs style={{ textAlign: 'center' }}>
                                        <Link href="#" variant="body2">
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
                                        borderRadius: '50px',  // Bordes redondeados
                                    }}
                                >
                                    Iniciar Sesión
                                </Button>

                            </Box>
                        </Box>
                    </Container>
                </ThemeProvider>
            </div>


        </>

    );
}

export default Login;