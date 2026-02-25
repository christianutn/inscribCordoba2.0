import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    CircularProgress,
    Alert,
    Backdrop,
    Tabs,
    Tab,
    Chip,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateRangeCalendar } from '@mui/x-date-pickers-pro/DateRangeCalendar';
import dayjs from 'dayjs';
import { getFechasInhabilitadas, deleteFechasInhabilitadas } from '../services/fechas_inhabilitadas.service.js';
import { getFechasInhabilitadasFin, deleteFechasInhabilitadasFin } from '../services/fechas_inhabilitadas_fin.service.js';

const TAB_INICIO = 0;
const TAB_FIN = 1;

const tabConfig = {
    [TAB_INICIO]: {
        label: 'Fechas de Inicio',
        color: '#1976d2',
        bgLight: '#e3f2fd',
        description: 'Seleccione las fechas de INICIO de cursada que desea volver a habilitar.',
        chipLabel: 'Inicio de cursada',
        successMsg: 'Fechas de inicio habilitadas correctamente.',
        errorMsg: 'Error al habilitar las fechas de inicio.',
    },
    [TAB_FIN]: {
        label: 'Fechas de Fin',
        color: '#e65100',
        bgLight: '#fff3e0',
        description: 'Seleccione las fechas de FIN de cursada que desea volver a habilitar.',
        chipLabel: 'Fin de cursada',
        successMsg: 'Fechas de fin habilitadas correctamente.',
        errorMsg: 'Error al habilitar las fechas de fin.',
    },
};

const ModalHabilitarFechas = ({ open, onClose }) => {
    const [activeTab, setActiveTab] = useState(TAB_INICIO);
    const [dateRange, setDateRange] = useState([null, null]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [aplicarAmbas, setAplicarAmbas] = useState(false);

    // Sets separados de fechas inhabilitadas manualmente para inicio y fin
    const [manuallyDisabledInicio, setManuallyDisabledInicio] = useState(new Set());
    const [manuallyDisabledFin, setManuallyDisabledFin] = useState(new Set());

    useEffect(() => {
        if (open) {
            fetchData();
            // Reset state on open
            setActiveTab(TAB_INICIO);
            setDateRange([null, null]);
            setError(null);
            setSuccess(false);
            setAplicarAmbas(false);
        }
    }, [open]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [inhabilitadasInicio, inhabilitadasFin] = await Promise.all([
                getFechasInhabilitadas(),
                getFechasInhabilitadasFin()
            ]);

            const setInicio = new Set();
            if (Array.isArray(inhabilitadasInicio)) {
                inhabilitadasInicio.forEach(item => {
                    setInicio.add(item.fecha);
                });
            }
            setManuallyDisabledInicio(setInicio);

            const setFin = new Set();
            if (Array.isArray(inhabilitadasFin)) {
                inhabilitadasFin.forEach(item => {
                    setFin.add(item.fecha);
                });
            }
            setManuallyDisabledFin(setFin);

        } catch (err) {
            console.error("Error fetching dates:", err);
            setError("Error al cargar fechas inhabilitadas.");
        } finally {
            setLoading(false);
        }
    };

    const currentSet = activeTab === TAB_INICIO ? manuallyDisabledInicio : manuallyDisabledFin;

    const shouldDisableDate = (date) => {
        const dateStr = date.format('YYYY-MM-DD');
        // Solo se pueden seleccionar fechas que ESTÁN inhabilitadas (para habilitarlas)
        // Deshabilitar todo lo que NO esté en el set
        return !currentSet.has(dateStr);
    };

    const buildPayload = (disabledSet) => {
        const startDate = dateRange[0];
        const endDate = dateRange[1] || startDate;
        const datesToSend = [];

        let currentDate = startDate;
        while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
            const dateStr = currentDate.format('YYYY-MM-DD');

            // Solo agregar si está actualmente inhabilitada
            if (disabledSet.has(dateStr)) {
                datesToSend.push({
                    fecha: dateStr
                });
            }

            currentDate = currentDate.add(1, 'day');
        }

        return datesToSend;
    };

    const handleSave = async () => {
        if (!dateRange[0]) {
            setError("Debe seleccionar al menos una fecha.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const promises = [];
            let totalDates = 0;

            if (activeTab === TAB_INICIO || aplicarAmbas) {
                const datesToSendInicio = buildPayload(manuallyDisabledInicio);
                totalDates += datesToSendInicio.length;
                if (datesToSendInicio.length > 0) {
                    promises.push(deleteFechasInhabilitadas({ fechas: datesToSendInicio }));
                }
            }

            if (activeTab === TAB_FIN || aplicarAmbas) {
                const datesToSendFin = buildPayload(manuallyDisabledFin);
                totalDates += datesToSendFin.length;
                if (datesToSendFin.length > 0) {
                    promises.push(deleteFechasInhabilitadasFin({ fechas: datesToSendFin }));
                }
            }

            if (totalDates === 0) {
                setError("Ninguna de las fechas seleccionadas está inhabilitada.");
                setLoading(false);
                return;
            }

            await Promise.all(promises);
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (err) {
            console.error("Error enabling dates:", err);
            setError(aplicarAmbas
                ? "Error al habilitar las fechas."
                : tabConfig[activeTab].errorMsg
            );
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        // Resetear selección al cambiar de tab
        setDateRange([null, null]);
        setError(null);
        setSuccess(false);
    };

    const config = tabConfig[activeTab];

    const successMessage = aplicarAmbas
        ? 'Fechas habilitadas correctamente para inicio y fin de cursada.'
        : config.successMsg;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ pb: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
                        Habilitar Fechas
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, position: 'absolute' }}
                    open={loading}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>

                {/* Tabs para seleccionar tipo */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="fullWidth"
                        TabIndicatorProps={{
                            style: { backgroundColor: config.color, height: 3 }
                        }}
                    >
                        <Tab
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{
                                        width: 10, height: 10, borderRadius: '50%',
                                        backgroundColor: tabConfig[TAB_INICIO].color
                                    }} />
                                    <span>{tabConfig[TAB_INICIO].label}</span>
                                </Box>
                            }
                            sx={{
                                textTransform: 'none',
                                fontWeight: activeTab === TAB_INICIO ? 700 : 400,
                                color: activeTab === TAB_INICIO ? tabConfig[TAB_INICIO].color : 'text.secondary',
                                '&.Mui-selected': { color: tabConfig[TAB_INICIO].color },
                            }}
                        />
                        <Tab
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{
                                        width: 10, height: 10, borderRadius: '50%',
                                        backgroundColor: tabConfig[TAB_FIN].color
                                    }} />
                                    <span>{tabConfig[TAB_FIN].label}</span>
                                </Box>
                            }
                            sx={{
                                textTransform: 'none',
                                fontWeight: activeTab === TAB_FIN ? 700 : 400,
                                color: activeTab === TAB_FIN ? tabConfig[TAB_FIN].color : 'text.secondary',
                                '&.Mui-selected': { color: tabConfig[TAB_FIN].color },
                            }}
                        />
                    </Tabs>
                </Box>

                {/* Indicador visual del tipo seleccionado */}
                <Box sx={{
                    p: 1.5,
                    mb: 2,
                    borderRadius: 1,
                    backgroundColor: config.bgLight,
                    borderLeft: `4px solid ${config.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <Chip
                        label={config.chipLabel}
                        size="small"
                        sx={{
                            backgroundColor: config.color,
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                        }}
                    />
                    <Typography variant="body2" color="text.secondary">
                        {config.description}
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Solo puede seleccionar fechas que fueron inhabilitadas manualmente. Las fechas en gris no están inhabilitadas.
                        </Typography>
                        <DateRangeCalendar
                            value={dateRange}
                            onChange={(newValue) => setDateRange(newValue)}
                            shouldDisableDate={shouldDisableDate}
                            calendars={2}
                        />
                    </LocalizationProvider>

                    {/* Checkbox para aplicar a ambas */}
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={aplicarAmbas}
                                onChange={(e) => setAplicarAmbas(e.target.checked)}
                                sx={{
                                    '&.Mui-checked': {
                                        color: '#7b1fa2',
                                    }
                                }}
                            />
                        }
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: 'black' }}>
                                    Aplicar también a
                                </Typography>
                                <Chip
                                    label={activeTab === TAB_INICIO
                                        ? tabConfig[TAB_FIN].chipLabel
                                        : tabConfig[TAB_INICIO].chipLabel
                                    }
                                    size="small"
                                    sx={{
                                        backgroundColor: activeTab === TAB_INICIO
                                            ? tabConfig[TAB_FIN].color
                                            : tabConfig[TAB_INICIO].color,
                                        color: '#fff',
                                        fontWeight: 600,
                                        fontSize: '0.7rem'
                                    }}
                                />
                            </Box>
                        }
                        sx={{
                            p: 1,
                            borderRadius: 1,
                            border: aplicarAmbas ? '1px solid #7b1fa2' : '1px solid #e0e0e0',
                            backgroundColor: aplicarAmbas ? '#f3e5f5' : 'transparent',
                            transition: 'all 0.2s ease',
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} color="inherit">Cancelar</Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={loading || success}
                    sx={{
                        backgroundColor: aplicarAmbas ? '#7b1fa2' : config.color,
                        '&:hover': {
                            backgroundColor: aplicarAmbas ? '#6a1b9a' : config.color,
                            filter: 'brightness(0.9)',
                        }
                    }}
                >
                    {aplicarAmbas
                        ? 'Habilitar Inicio y Fin'
                        : `Habilitar ${config.chipLabel}`
                    }
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalHabilitarFechas;
