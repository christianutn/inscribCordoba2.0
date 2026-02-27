import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TextField from './UIElements/TextField';
import { getMyUser } from "../services/usuarios.service.js";
import Titulo from './fonts/TituloPrincipal';
import Subtitulo from "./fonts/SubtituloPrincipal.jsx";
import { Divider, Grid, Box } from "@mui/material";
import Button from "./UIElements/Button.jsx";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Autocomplete from "../components/UIElements/Autocomplete.jsx";
import { getRestricciones, putRestriccion } from "../services/restricciones.service.js";
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import DetalleFechasPorDia from "./DetalleFechas.jsx";
import { Button as MuiButton } from '@mui/material';
import DetalleMes from "./DetalleMes.jsx";
import ModalInhabilitarFechas from "./ModalInhabilitarFechas.jsx";
import ModalHabilitarFechas from "./ModalHabilitarFechas.jsx";
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

const RestriccionesFechasInicioCursada = () => {
    const navigate = useNavigate();

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [selectedMes, setSelectedMes] = useState(null);
    const [maximoCuposMensual, setMaximoCuposMensual] = useState("");
    const [maximoCuposDiario, setMaximoCuposDiario] = useState("");
    const [maximoCursosMensual, setMaximoCursosMensual] = useState("");
    const [maximoCursosDiario, setMaximoCursosDiario] = useState("");
    const [maximoAcumulado, setMaximoAcumulado] = useState("");
    const [openModalInhabilitar, setOpenModalInhabilitar] = useState(false);
    const [openModalHabilitar, setOpenModalHabilitar] = useState(false);
    const [initialValues, setInitialValues] = useState({
        maximoCursosMensual: '',
        maximoCursosDiario: '',
        maximoCuposMensual: '',
        maximoCuposDiario: '',
        maximoAcumulado: '',
        selectedMes: null
    });
    const [isEdited, setIsEdited] = useState(false);
    const listaMeses = ["Sin Bloqueo", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    useEffect(() => {
        (async () => {
            try {
                setCargando(true);
                const user = await getMyUser();

                if (!user.cuil) {
                    navigate("/login");
                    return;
                }

                const rest = await getRestricciones();

                const newVals = {
                    maximoCursosMensual: String(rest.restriccion.maximoCursosXMes ?? ""),
                    maximoCursosDiario: String(rest.restriccion.maximoCursosXDia ?? ""),
                    maximoCuposMensual: String(rest.restriccion.maximoCuposXMes ?? ""),
                    maximoCuposDiario: String(rest.restriccion.maximoCuposXDia ?? ""),
                    maximoAcumulado: String(rest.restriccion.maximoAcumulado ?? ""),
                    selectedMes: listaMeses[rest.restriccion.mesBloqueado ?? 0]
                };

                setInitialValues(newVals);
                setMaximoCursosMensual(newVals.maximoCursosMensual);
                setMaximoCursosDiario(newVals.maximoCursosDiario);
                setMaximoCuposMensual(newVals.maximoCuposMensual);
                setMaximoCuposDiario(newVals.maximoCuposDiario);
                setMaximoAcumulado(newVals.maximoAcumulado);
                setSelectedMes(newVals.selectedMes);
                setIsEdited(false);

            } catch (error) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setSuccess(false);
                setError(error.message || "Error al cargar los datos");
            } finally {
                setCargando(false);
            }
        })();
    }, [navigate]);

    useEffect(() => {
        if (
            maximoCursosMensual !== initialValues.maximoCursosMensual ||
            maximoCursosDiario !== initialValues.maximoCursosDiario ||
            maximoCuposMensual !== initialValues.maximoCuposMensual ||
            maximoCuposDiario !== initialValues.maximoCuposDiario ||
            maximoAcumulado !== initialValues.maximoAcumulado ||
            selectedMes !== initialValues.selectedMes
        ) {
            setIsEdited(true);
        } else {
            setIsEdited(false);
        }
    }, [maximoCursosMensual, maximoCursosDiario, maximoCuposMensual, maximoCuposDiario, maximoAcumulado, selectedMes, initialValues]);

    const limpiarFormulario = () => {
    }

    const isValidInteger = (value) => {
        const strValue = String(value).trim();
        if (strValue === "") return true;
        const number = Number(strValue);
        return Number.isInteger(number) && number >= 0;
    }

    const validarDatos = () => {
        if (maximoCursosDiario !== "" && !isValidInteger(maximoCursosDiario)) {
            throw new Error("El límite de cursos diarios debe ser un número entero no negativo (o dejarse vacío).");
        }
        if (maximoCursosMensual !== "" && !isValidInteger(maximoCursosMensual)) {
            throw new Error("El límite de cursos mensuales debe ser un número entero no negativo (o dejarse vacío).");
        }
        if (maximoCuposDiario !== "" && !isValidInteger(maximoCuposDiario)) {
            throw new Error("El límite de cupos diarios debe ser un número entero no negativo (o dejarse vacío).");
        }
        if (maximoCuposMensual !== "" && !isValidInteger(maximoCuposMensual)) {
            throw new Error("El límite de cupos mensuales debe ser un número entero no negativo (o dejarse vacío).");
        }
        if (maximoAcumulado !== "" && !isValidInteger(maximoAcumulado)) {
            throw new Error("El máximo acumulado de cursos debe ser un número entero no negativo (o dejarse vacío).");
        }
        if (!selectedMes || !listaMeses.includes(selectedMes)) {
            throw new Error("Debe seleccionar un mes para bloqueo (o 'Sin Bloqueo').");
        }

        const numCursosDiario = maximoCursosDiario === "" ? Infinity : Number(maximoCursosDiario);
        const numCursosMensual = maximoCursosMensual === "" ? Infinity : Number(maximoCursosMensual);
        const numCuposDiario = maximoCuposDiario === "" ? Infinity : Number(maximoCuposDiario);
        const numCuposMensual = maximoCuposMensual === "" ? Infinity : Number(maximoCuposMensual);

        if (numCursosDiario > numCursosMensual) {
            throw new Error("El límite diario de cursos no puede ser mayor que el límite mensual.");
        }
        if (numCuposDiario > numCuposMensual) {
            throw new Error("El límite diario de cupos no puede ser mayor que el límite mensual.");
        }
    }


    const handleEnviar = async () => {
        try {
            setCargando(true);
            setError(null);
            setSuccess(false);
            validarDatos();

            const payload = {
                mesBloqueado: listaMeses.indexOf(selectedMes),
                maximoCursosXDia: maximoCursosDiario === "" ? null : Number(maximoCursosDiario),
                maximoCursosXMes: maximoCursosMensual === "" ? null : Number(maximoCursosMensual),
                maximoCuposXDia: maximoCuposDiario === "" ? null : Number(maximoCuposDiario),
                maximoCuposXMes: maximoCuposMensual === "" ? null : Number(maximoCuposMensual),
                maximoAcumulado: maximoAcumulado === "" ? null : Number(maximoAcumulado)
            };


            await putRestriccion(payload);

            setSuccess(true);
            limpiarFormulario();
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error("Error sending data:", error);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setSuccess(false);
            setError(error.message || "Error al guardar los cambios");
        } finally {
            setCargando(false);
        }
    }

    const btnSecondaryStyle = {
        textTransform: 'none',
        fontWeight: 500,
        fontSize: '0.95rem',
        borderRadius: 1.5,
        px: 2.5,
        py: 1,
        borderColor: '#bdbdbd',
        color: '#444',
    };

    const btnPrimaryStyle = {
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.95rem',
        borderRadius: 1.5,
        px: 3,
        py: 1,
        bgcolor: '#00519C',
        '&:hover': { bgcolor: '#003f7a' },
    };

    return (
        <>
            {error && (
                <Alert variant="filled" severity="error" sx={{ width: '100%', mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert variant="filled" severity="success" sx={{ width: '100%', mb: 2 }} onClose={() => setSuccess(false)}>
                    Restricciones actualizadas con éxito
                </Alert>
            )}
            {cargando && (
                <Backdrop
                    sx={{ color: '#00519C', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={cargando}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
            )}

            <Box component="form" sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%' }} noValidate autoComplete="off">
                <Grid container spacing={3}>

                    <Grid item xs={12}>
                        <Titulo texto='Restricciones de Inicio de Cursada' />
                        <Divider sx={{ mb: 2, borderBottomWidth: 2, borderColor: 'rgba(0, 0, 0, 0.12)', mt: 1 }} />
                    </Grid>

                    <Grid item xs={12}>
                        <Subtitulo texto="Establecer Límites y Bloqueo Mensual" />
                        <Grid container spacing={2} sx={{ mt: 0.5 }}>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField label={"Límite de cursos por mes"} type={"number"} value={maximoCursosMensual} getValue={setMaximoCursosMensual} fullWidth inputProps={{ min: "0" }} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField label={"Límite de cursos por día"} type={"number"} value={maximoCursosDiario} getValue={setMaximoCursosDiario} fullWidth inputProps={{ min: "0" }} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField label={"Límite de cupos por mes"} type={"number"} value={maximoCuposMensual} getValue={setMaximoCuposMensual} fullWidth inputProps={{ min: "0" }} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField label={"Límite de cupos por día"} type={"number"} value={maximoCuposDiario} getValue={setMaximoCuposDiario} fullWidth inputProps={{ min: "0" }} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField label={"Máximo acumulado de cursos"} type={"number"} value={maximoAcumulado} getValue={setMaximoAcumulado} fullWidth inputProps={{ min: "0" }} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Autocomplete
                                    label={"Mes bloqueado para nuevos inicios"}
                                    options={listaMeses}
                                    value={selectedMes}
                                    getValue={setSelectedMes}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 2, mb: 3, flexWrap: 'wrap' }}>
                            <MuiButton variant="contained" onClick={handleEnviar} disabled={cargando || !isEdited} disableElevation sx={btnPrimaryStyle}>
                                Guardar Cambios
                            </MuiButton>

                            <MuiButton variant="outlined" startIcon={<EventBusyIcon />} onClick={() => setOpenModalInhabilitar(true)} disabled={cargando}
                                sx={{ ...btnSecondaryStyle, '&:hover': { borderColor: '#00519C', color: '#00519C', bgcolor: '#f0f7ff' } }}>
                                Inhabilitar Fechas
                            </MuiButton>

                            <MuiButton variant="outlined" startIcon={<EventAvailableIcon />} onClick={() => setOpenModalHabilitar(true)} disabled={cargando}
                                sx={{ ...btnSecondaryStyle, '&:hover': { borderColor: '#2e7d32', color: '#2e7d32', bgcolor: '#f0fff4' } }}>
                                Habilitar Fechas
                            </MuiButton>
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Divider sx={{ mb: 2, borderBottomWidth: 1, borderColor: 'rgba(0, 0, 0, 0.12)', mt: 1 }} />
                    </Grid>

                    <Grid item xs={12} sx={{ mt: 3 }}>
                        <Subtitulo texto="Visualización de Cupos Actuales" />
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{ border: '1px solid rgba(0,0,0,0.12)', p: 2, borderRadius: 1, height: '100%' }}>
                            <Subtitulo texto="Detalle Diario" />
                            <DetalleFechasPorDia
                                maximoCuposDiario={maximoCuposDiario}
                                maximoCursosDiario={maximoCursosDiario}
                                maximoAcumulado={maximoAcumulado}
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{ border: '1px solid rgba(0,0,0,0.12)', p: 2, borderRadius: 1, height: '100%', mt: 3 }}>
                            <Subtitulo texto="Detalle Mensual" />
                            <DetalleMes
                                maximoCuposMensual={maximoCuposMensual}
                                maximoCursosMensual={maximoCursosMensual}
                            />
                        </Box>
                    </Grid>

                </Grid>
            </Box>
            <ModalInhabilitarFechas
                open={openModalInhabilitar}
                onClose={() => setOpenModalInhabilitar(false)}
            />
            <ModalHabilitarFechas
                open={openModalHabilitar}
                onClose={() => setOpenModalHabilitar(false)}
            />
        </>
    );
}

export default RestriccionesFechasInicioCursada;