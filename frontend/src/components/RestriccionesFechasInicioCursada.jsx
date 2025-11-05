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
import DetalleFechasPorDia from "./DetalleFechas.jsx";
import DetalleMes from "./DetalleMes.jsx";

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
              
                setSelectedMes(listaMeses[rest.mesBloqueado ?? 0]);
                setMaximoCuposDiario(String(rest.maximoCuposXDia ?? ""));
                setMaximoCuposMensual(String(rest.maximoCuposXMes ?? ""));
                setMaximoCursosDiario(String(rest.maximoCursosXDia ?? ""));
                setMaximoCursosMensual(String(rest.maximoCursosXMes ?? ""));
                setMaximoAcumulado(String(rest.maximoAcumulado ?? ""));

            } catch (error) {
                console.error("Error fetching data:", error);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setSuccess(false);
                setError(error.message || "Error al cargar los datos");
            } finally {
                setCargando(false);
            }
        })();
    }, [navigate]);

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
                                <TextField label={"Límite de cursos por mes"} type={"number"} value={maximoCursosMensual} getValue={(value) => setMaximoCursosMensual(value)} fullWidth inputProps={{ min: "0" }} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField label={"Límite de cursos por día"} type={"number"} value={maximoCursosDiario} getValue={(value) => setMaximoCursosDiario(value)} fullWidth inputProps={{ min: "0" }} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField label={"Límite de cupos por mes"} type={"number"} value={maximoCuposMensual} getValue={(value) => setMaximoCuposMensual(value)} fullWidth inputProps={{ min: "0" }} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField label={"Límite de cupos por día"} type={"number"} value={maximoCuposDiario} getValue={(value) => setMaximoCuposDiario(value)} fullWidth inputProps={{ min: "0" }} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField label={"Máximo acumulado de cursos"} type={"number"} value={maximoAcumulado} getValue={(value) => setMaximoAcumulado(value)} fullWidth inputProps={{ min: "0" }} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Autocomplete
                                    label={"Mes bloqueado para nuevos inicios"}
                                    options={listaMeses}
                                    value={selectedMes}
                                    getValue={(value) => setSelectedMes(value)}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 3 }}>
                        <Button type="button" mensaje={"Guardar Cambios"} hanldeOnClick={handleEnviar} disabled={cargando} />
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
        </>
    );
}

export default RestriccionesFechasInicioCursada;