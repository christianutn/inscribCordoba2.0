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
    Backdrop
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateRangeCalendar } from '@mui/x-date-pickers-pro/DateRangeCalendar';
import dayjs from 'dayjs';
import { getFeriadosDelAnio } from '../services/api.service.js';
import { getFechasInvalidas } from '../services/instancias.service.js';
import { getFechasInhabilitadas, postFechasInhabilitadas } from '../services/fechas_inhabilitadas.service.js';

const ModalInhabilitarFechas = ({ open, onClose }) => {
    const [dateRange, setDateRange] = useState([null, null]);
    const [motivo, setMotivo] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Map of date string (YYYY-MM-DD) -> reason/type
    const [disabledDatesMap, setDisabledDatesMap] = useState(new Map());

    useEffect(() => {
        if (open) {
            fetchData();
            // Reset state on open
            setDateRange([null, null]);
            setMotivo('');
            setError(null);
            setSuccess(false);
        }
    }, [open]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const currentYear = dayjs().year();
            const nextYear = currentYear + 1;

            const [feriados, invalidasCurrent, invalidasNext, inhabilitadas] = await Promise.all([
                getFeriadosDelAnio(), // Assuming this returns for current year, API might need year check if it supports it, but ignoring for now as per prompt
                getFechasInvalidas(currentYear),
                getFechasInvalidas(nextYear),
                getFechasInhabilitadas()
            ]);

            const map = new Map();

            // Process Feriados
            if (Array.isArray(feriados)) {
                feriados.forEach(f => {
                    map.set(f.fecha, `Feriado: ${f.nombre}`);
                });
            }

            // Process Fechas Invalidas (Capacity limits)
            const processInvalidas = (list) => {
                if (Array.isArray(list)) {
                    list.forEach(item => {
                        map.set(item.calendario_fecha, `Límite alcanzado: ${item.motivo_invalidez}`);
                    });
                }
            };
            processInvalidas(invalidasCurrent);
            processInvalidas(invalidasNext);

            // Process Fechas Inhabilitadas (Already manually disabled)
            if (Array.isArray(inhabilitadas)) {
                inhabilitadas.forEach(item => {
                    map.set(item.fecha, `Inhabilitada: ${item.motivo || 'Sin motivo'}`);
                });
            }

            setDisabledDatesMap(map);

        } catch (err) {
            console.error("Error fetching dates:", err);
            setError("Error al cargar fechas inhabilitadas y feriados.");
        } finally {
            setLoading(false);
        }
    };

    const shouldDisableDate = (date) => {
        const dateStr = date.format('YYYY-MM-DD');
        return disabledDatesMap.has(dateStr);
    };

    const handleSave = async () => {
        if (!dateRange[0]) {
            setError("Debe seleccionar al menos una fecha.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const startDate = dateRange[0];
            const endDate = dateRange[1] || startDate;
            const datesToSend = [];

            let currentDate = startDate;
            while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
                const dateStr = currentDate.format('YYYY-MM-DD');

                // Only add if NOT already disabled
                if (!disabledDatesMap.has(dateStr)) {
                    datesToSend.push({
                        fecha: dateStr,
                        motivo: motivo || 'Sin motivo'
                    });
                }

                currentDate = currentDate.add(1, 'day');
            }

            if (datesToSend.length === 0) {
                setError("Todas las fechas seleccionadas ya están inhabilitadas.");
                setLoading(false);
                return;
            }

            const payload = {
                fechas: datesToSend
            };


            await postFechasInhabilitadas(payload);
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (err) {
            console.error("Error saving disabled dates:", err);
            setError("Error al guardar las fechas inhabilitadas.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Inhabilitar Fechas</DialogTitle>
            <DialogContent>
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, position: 'absolute' }}
                    open={loading}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>Fechas inhabilitadas correctamente.</Alert>}

                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Seleccione un rango de fechas. Las fechas en gris ya están inhabilitadas (por feriados, cupos o bloqueos previos).
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
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Cancelar</Button>
                <Button onClick={handleSave} variant="contained" color="primary" disabled={loading || success}>
                    Confirmar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalInhabilitarFechas;
