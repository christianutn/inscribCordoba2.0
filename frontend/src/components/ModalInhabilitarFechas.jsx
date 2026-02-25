import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
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
import { getFeriadosDelAnio } from '../services/api.service.js';
import { getFechasInvalidas } from '../services/instancias.service.js';
import { getFechasInhabilitadas, postFechasInhabilitadas } from '../services/fechas_inhabilitadas.service.js';
import { getFechasInhabilitadasFin, postFechasInhabilitadasFin } from '../services/fechas_inhabilitadas_fin.service.js';

const TAB_INICIO = 0;
const TAB_FIN = 1;

const tabConfig = {
    [TAB_INICIO]: {
        label: 'Fechas de Inicio',
        color: '#1976d2',
        bgLight: '#e3f2fd',
        description: 'Seleccione un rango de fechas para inhabilitar como fechas de INICIO de cursada.',
        chipLabel: 'Inicio de cursada',
        successMsg: 'Fechas de inicio inhabilitadas correctamente.',
        errorMsg: 'Error al guardar las fechas de inicio inhabilitadas.',
    },
    [TAB_FIN]: {
        label: 'Fechas de Fin',
        color: '#e65100',
        bgLight: '#fff3e0',
        description: 'Seleccione un rango de fechas para inhabilitar como fechas de FIN de cursada.',
        chipLabel: 'Fin de cursada',
        successMsg: 'Fechas de fin inhabilitadas correctamente.',
        errorMsg: 'Error al guardar las fechas de fin inhabilitadas.',
    },
};

const ModalInhabilitarFechas = ({ open, onClose }) => {
    const [activeTab, setActiveTab] = useState(TAB_INICIO);
    const [dateRange, setDateRange] = useState([null, null]);
    const [motivo, setMotivo] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [aplicarAmbas, setAplicarAmbas] = useState(false);

    // Mapas separados para inicio y fin
    const [disabledDatesMapInicio, setDisabledDatesMapInicio] = useState(new Map());
    const [disabledDatesMapFin, setDisabledDatesMapFin] = useState(new Map());

    useEffect(() => {
        if (open) {
            fetchData();
            // Reset state on open
            setActiveTab(TAB_INICIO);
            setDateRange([null, null]);
            setMotivo('');
            setError(null);
            setSuccess(false);
            setAplicarAmbas(false);
        }
    }, [open]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const currentYear = dayjs().year();
            const nextYear = currentYear + 1;

            const [feriados, invalidasCurrent, invalidasNext, inhabilitadasInicio, inhabilitadasFin] = await Promise.all([
                getFeriadosDelAnio(),
                getFechasInvalidas(currentYear),
                getFechasInvalidas(nextYear),
                getFechasInhabilitadas(),
                getFechasInhabilitadasFin()
            ]);

            // --- Mapa para Fechas de INICIO ---
            const mapInicio = new Map();

            if (Array.isArray(feriados)) {
                feriados.forEach(f => {
                    mapInicio.set(f.fecha, `Feriado: ${f.nombre}`);
                });
            }

            const processInvalidas = (list, map) => {
                if (Array.isArray(list)) {
                    list.forEach(item => {
                        map.set(item.calendario_fecha, `Límite alcanzado: ${item.motivo_invalidez}`);
                    });
                }
            };
            processInvalidas(invalidasCurrent, mapInicio);
            processInvalidas(invalidasNext, mapInicio);

            if (Array.isArray(inhabilitadasInicio)) {
                inhabilitadasInicio.forEach(item => {
                    mapInicio.set(item.fecha, `Inhabilitada (Inicio): ${item.motivo || 'Sin motivo'}`);
                });
            }

            setDisabledDatesMapInicio(mapInicio);

            // --- Mapa para Fechas de FIN ---
            const mapFin = new Map();

            // Los feriados también aplican para fechas de fin
            if (Array.isArray(feriados)) {
                feriados.forEach(f => {
                    mapFin.set(f.fecha, `Feriado: ${f.nombre}`);
                });
            }

            if (Array.isArray(inhabilitadasFin)) {
                inhabilitadasFin.forEach(item => {
                    mapFin.set(item.fecha, `Inhabilitada (Fin): ${item.motivo || 'Sin motivo'}`);
                });
            }

            setDisabledDatesMapFin(mapFin);

        } catch (err) {
            console.error("Error fetching dates:", err);
            setError("Error al cargar fechas inhabilitadas y feriados.");
        } finally {
            setLoading(false);
        }
    };

    const currentMap = activeTab === TAB_INICIO ? disabledDatesMapInicio : disabledDatesMapFin;

    const shouldDisableDate = (date) => {
        const dateStr = date.format('YYYY-MM-DD');
        return currentMap.has(dateStr);
    };

    const buildPayload = (disabledMap) => {
        const startDate = dateRange[0];
        const endDate = dateRange[1] || startDate;
        const datesToSend = [];

        let currentDate = startDate;
        while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
            const dateStr = currentDate.format('YYYY-MM-DD');

            if (!disabledMap.has(dateStr)) {
                datesToSend.push({
                    fecha: dateStr,
                    motivo: motivo || 'Sin motivo'
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
                const datesToSendInicio = buildPayload(disabledDatesMapInicio);
                totalDates += datesToSendInicio.length;
                if (datesToSendInicio.length > 0) {
                    promises.push(postFechasInhabilitadas({ fechas: datesToSendInicio }));
                }
            }

            if (activeTab === TAB_FIN || aplicarAmbas) {
                const datesToSendFin = buildPayload(disabledDatesMapFin);
                totalDates += datesToSendFin.length;
                if (datesToSendFin.length > 0) {
                    promises.push(postFechasInhabilitadasFin({ fechas: datesToSendFin }));
                }
            }

            if (totalDates === 0) {
                setError("Todas las fechas seleccionadas ya están inhabilitadas.");
                setLoading(false);
                return;
            }

            await Promise.all(promises);
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (err) {
            console.error("Error saving disabled dates:", err);
            setError(aplicarAmbas
                ? "Error al guardar las fechas inhabilitadas."
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
        ? 'Fechas inhabilitadas correctamente para inicio y fin de cursada.'
        : config.successMsg;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ pb: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
                        Inhabilitar Fechas
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
                            Las fechas en gris ya están inhabilitadas (por feriados, cupos o bloqueos previos).
                        </Typography>
                        <DateRangeCalendar
                            value={dateRange}
                            onChange={(newValue) => setDateRange(newValue)}
                            shouldDisableDate={shouldDisableDate}
                            calendars={2}
                        />
                    </LocalizationProvider>

                    <TextField
                        label="Motivo (Opcional)"
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                    />

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
                        ? 'Inhabilitar Inicio y Fin'
                        : `Inhabilitar ${config.chipLabel}`
                    }
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalInhabilitarFechas;
