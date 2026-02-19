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
    Stack,
    Container,
    Paper,
    useTheme,
    Alert,
    IconButton,
    Tooltip,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
import { ViewModule, ViewList } from '@mui/icons-material';
import dayjs from 'dayjs';
import { getUltimosEstadoDeAutorizaciones, rechazarNotaDeAutorizacion } from "../../services/cambiosEstadoAutorizacion.service.js";
import { useNavigate } from 'react-router-dom';
import VistaCards from './VistaCards';
import VistaLista from './VistaLista';

const Autorizaciones = () => {
    const navigate = useNavigate();
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
    const [viewType, setViewType] = useState('cards');

    useEffect(() => {
        const fetchUltimoEstadoDeAutorizaciones = async () => {
            try {
                const response = await getUltimosEstadoDeAutorizaciones();
                setAutorizaciones(response);

                // Extract unique areas for the filter
                const uniqueAreas = [...new Set(response.map(item => item.NotaAutorizacion?.detalle_usuario?.detalle_area?.nombre).filter(Boolean))];
                setAreas(uniqueAreas);
            } catch (error) {
                console.error("Error al obtener el último estado de autorizaciones:", error);
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

    const handleRechazar = async (id) => {
        try {
            await rechazarNotaDeAutorizacion({ nota_autorizacion_id: id });
            const fetchUltimoEstadoDeAutorizaciones = async () => {
                try {
                    const response = await getUltimosEstadoDeAutorizaciones();
                    setAutorizaciones(response);
                } catch (error) {
                    setAlert({
                        open: true,
                        message: "Error al obtener el último estado de autorizaciones",
                        severity: "error"
                    });
                }
            };
            fetchUltimoEstadoDeAutorizaciones();
            setAlert({
                open: true,
                message: "Nota de autorización rechazada exitosamente",
                severity: "success"
            });
        } catch (error) {
            setAlert({
                open: true,
                message: "Error al rechazar la nota de autorización",
                severity: "error"
            }).finally(() => {
                // Scroll to top  
                window.scrollTo({ top: 0, behavior: 'smooth' });
            })
        }
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
                        Notas de Autorización
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
                            <Box display="flex" alignItems="center" justifyContent="space-between">
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
                                <ToggleButtonGroup
                                    value={viewType}
                                    exclusive
                                    onChange={(e, nextView) => nextView && setViewType(nextView)}
                                    aria-label="tipo de vista"
                                    size="small"
                                >
                                    <ToggleButton value="cards" aria-label="vista cards">
                                        <Tooltip title="Vista de Tarjetas">
                                            <ViewModule />
                                        </Tooltip>
                                    </ToggleButton>
                                    <ToggleButton value="list" aria-label="vista lista">
                                        <Tooltip title="Vista de Lista">
                                            <ViewList />
                                        </Tooltip>
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Box>
                        </Grid>

                    </Grid>
                </Paper>

                {/* Content Section */}
                {viewType === 'cards' ? (
                    <VistaCards
                        data={filteredAutorizaciones}
                        onVerPdf={handleVerPdf}
                        onRechazar={handleRechazar}
                        onAutorizar={(nota) => navigate('/confirmaciones', { state: { datos: nota } })}
                    />
                ) : (
                    <VistaLista
                        data={filteredAutorizaciones}
                        onVerPdf={handleVerPdf}
                        onRechazar={handleRechazar}
                        onAutorizar={(nota) => navigate('/confirmaciones', { state: { datos: nota } })}
                    />
                )}
            </Container>
        </Box>
    );
};

export default Autorizaciones;
