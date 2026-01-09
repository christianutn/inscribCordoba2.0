import React, { useEffect, useState, useMemo } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Chip,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Checkbox,
    FormControlLabel,
    Button,
    Container,
    Paper,
    useTheme,
    Alert
} from '@mui/material';
import dayjs from 'dayjs';
import { getUltimosEstadoDeAutorizaciones } from "../../services/cambiosEstadoAutorizacion.service.js";

const VisualizacionMisNotasRefentes = () => {
    const theme = useTheme();
    const [autorizaciones, setAutorizaciones] = useState([]);
    const [filtros, setFiltros] = useState({
        referente: '',
        area: 'all',
        soloPendientes: false
    });
    const [areas, setAreas] = useState([]);

    const [alert, setAlert] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        const fetchUltimoEstadoDeAutorizaciones = async () => {
            try {
                // The service response structure is expected to be an array as described in the prompt
                const response = await getUltimosEstadoDeAutorizaciones();
                setAutorizaciones(response);

                // Extract unique areas for the filter from the response
                const uniqueAreas = [...new Set(response.map(item => item.NotaAutorizacion?.detalle_usuario?.detalle_area?.nombre).filter(Boolean))];
                setAreas(uniqueAreas);
            } catch (error) {
                console.error("Error al obtener el último estado de autorizaciones:", error);
                setAlert({
                    open: true,
                    message: "Error al cargar las notas de autorización.",
                    severity: "error"
                });
            }
        };

        fetchUltimoEstadoDeAutorizaciones();
    }, []);

    const handleFiltroChange = (event) => {
        const { name, value, checked, type } = event.target;
        setFiltros(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const filteredAutorizaciones = useMemo(() => {
        return autorizaciones.filter(item => {
            const { referente, area, soloPendientes } = filtros;
            const nota = item.NotaAutorizacion;
            const persona = nota?.detalle_usuario?.detalle_persona;
            const areaNombre = nota?.detalle_usuario?.detalle_area?.nombre;
            const estadoCod = item.estado_nota_autorizacion_cod;

            // Filter by Referente (Name or Surname)
            const nombreCompleto = `${persona?.nombre || ''} ${persona?.apellido || ''}`.toLowerCase();
            const matchReferente = referente === '' || nombreCompleto.includes(referente.toLowerCase());

            // Filter by Area
            const matchArea = area === 'all' || areaNombre === area;

            // Filter by Pending Status
            const matchPendiente = !soloPendientes || estadoCod === 'PEND';

            return matchReferente && matchArea && matchPendiente;
        });
    }, [autorizaciones, filtros]);

    const handleVerPdf = (ruta) => {
        if (ruta) {
            // Remove leading slash from route if present to avoid double slashes
            const cleanRuta = ruta.startsWith('/') ? ruta.slice(1) : ruta;

            const url = process.env.NODE_ENV === 'development'
                ? 'http://localhost:4000'
                : window.location.origin;

            window.open(`${url}/${cleanRuta}`, '_blank');
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
            {
                alert.open && (
                    <Alert
                        open={alert.open}
                        onClose={() => setAlert({ ...alert, open: false })}
                        severity={alert.severity}
                        sx={{ mb: 2 }}
                    >
                        {alert.message}
                    </Alert>
                )
            }
            <Container maxWidth="xl">
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom color="text.primary">
                        Mis Notas de Autorización
                    </Typography>
                </Box>

                {/* Filters Section */}
                <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }} elevation={0} variant="outlined">
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Filtros
                    </Typography>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={4} lg={4}>
                            <TextField
                                fullWidth
                                label="Nombre / Apellido de Referente"
                                name="referente"
                                value={filtros.referente}
                                onChange={handleFiltroChange}
                                variant="outlined"
                                size="medium"
                            />
                        </Grid>
                        <Grid item xs={12} md={4} lg={4}>
                            <FormControl fullWidth variant="outlined">
                                <InputLabel>Área</InputLabel>
                                <Select
                                    label="Área"
                                    name="area"
                                    value={filtros.area}
                                    onChange={handleFiltroChange}
                                >
                                    <MenuItem value="all">Todas las áreas</MenuItem>
                                    {areas.map((areaName) => (
                                        <MenuItem key={areaName} value={areaName}>
                                            {areaName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4} lg={4}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={filtros.soloPendientes}
                                        onChange={handleFiltroChange}
                                        name="soloPendientes"
                                        color="primary"
                                    />
                                }
                                label="Mostrar solo pendientes"
                            />
                        </Grid>
                    </Grid>
                </Paper>

                {/* Cards Grid */}
                <Grid container spacing={3}>
                    {filteredAutorizaciones.map((item) => {
                        const nota = item.NotaAutorizacion;
                        const persona = nota?.detalle_usuario?.detalle_persona;
                        const area = nota?.detalle_usuario?.detalle_area;
                        const ministerio = area?.detalle_ministerio;
                        const estado = item.Estado;
                        const isPendiente = item.estado_nota_autorizacion_cod === 'PEND';
                        const isAutorizado = item.estado_nota_autorizacion_cod === 'AUT';

                        return (
                            <Grid item xs={12} md={6} xl={4} key={item.id}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }} elevation={1}>
                                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                            <Typography variant="h6" component="div" fontWeight="bold">
                                                {area?.nombre} / {ministerio?.nombre}
                                            </Typography>
                                            <Chip
                                                label={estado?.nombre}
                                                color={isPendiente ? "warning" : isAutorizado ? "success" : "default"}
                                                size="small"
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </Box>

                                        <Box sx={{ color: 'text.primary', fontSize: '0.875rem', flexGrow: 1 }}>
                                            <Typography gutterBottom>
                                                <Box component="span" fontWeight="bold">Referente:</Box> {persona ? `${persona.apellido}, ${persona.nombre}` : 'No disponible'}
                                            </Typography>
                                            <Typography gutterBottom>
                                                <Box component="span" fontWeight="bold">Fecha de Recepción:</Box> {nota?.fecha_desde ? dayjs(nota.fecha_desde).format('DD-MM-YYYY') : '-'}
                                            </Typography>
                                            {isAutorizado && (
                                                <Typography >
                                                    <Box component="span" fontWeight="bold">Fecha de Aprobación:</Box> {item.fecha_desde ? dayjs(item.fecha_desde).format('DD-MM-YYYY') : '-'}
                                                </Typography>
                                            )}
                                        </Box>

                                        <Box mt={2}>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => handleVerPdf(nota?.ruta_archivo_local)}
                                                sx={{
                                                    bgcolor: theme.palette.primary.main,
                                                    '&:hover': { bgcolor: theme.palette.primary.dark }
                                                }}
                                            >
                                                Ver PDF
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
                {filteredAutorizaciones.length === 0 && (
                    <Box sx={{ textAlign: 'center', mt: 5 }}>
                        <Typography variant="body1" color="text.secondary">
                            No se encontraron notas de autorización.
                        </Typography>
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default VisualizacionMisNotasRefentes;
