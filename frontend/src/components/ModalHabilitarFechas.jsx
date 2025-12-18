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
    Backdrop
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateRangeCalendar } from '@mui/x-date-pickers-pro/DateRangeCalendar';
import dayjs from 'dayjs';
import { getFechasInhabilitadas, deleteFechasInhabilitadas } from '../services/fechas_inhabilitadas.service.js';

const ModalHabilitarFechas = ({ open, onClose }) => {
    const [dateRange, setDateRange] = useState([null, null]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Set of date strings (YYYY-MM-DD) that are currently disabled manually
    const [manuallyDisabledDates, setManuallyDisabledDates] = useState(new Set());

    useEffect(() => {
        if (open) {
            fetchData();
            // Reset state on open
            setDateRange([null, null]);
            setError(null);
            setSuccess(false);
        }
    }, [open]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const inhabilitadas = await getFechasInhabilitadas();
            const set = new Set();

            if (Array.isArray(inhabilitadas)) {
                inhabilitadas.forEach(item => {
                    set.add(item.fecha);
                });
            }

            setManuallyDisabledDates(set);

        } catch (err) {
            console.error("Error fetching dates:", err);
            setError("Error al cargar fechas inhabilitadas.");
        } finally {
            setLoading(false);
        }
    };

    const shouldDisableDate = (date) => {
        const dateStr = date.format('YYYY-MM-DD');
        // We WANT to enable dates, so we should ONLY interact with dates that ARE in the set.
        // The prop is "shouldDisableDate" -> if true, the user CANNOT select it.
        // So we want to disable everything that is NOT in our set.
        return !manuallyDisabledDates.has(dateStr);
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

                // Only add if it IS currently disabled (and thus valid for re-enabling)
                if (manuallyDisabledDates.has(dateStr)) {
                    datesToSend.push({
                        fecha: dateStr
                    });
                }

                currentDate = currentDate.add(1, 'day');
            }

            if (datesToSend.length === 0) {
                setError("Ninguna de las fechas seleccionadas está inhabilitada.");
                setLoading(false);
                return;
            }

            const payload = {
                fechas: datesToSend
            };

            await deleteFechasInhabilitadas(payload);
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (err) {
            console.error("Error enabling dates:", err);
            setError("Error al habilitar las fechas.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Habilitar Fechas</DialogTitle>
            <DialogContent>
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, position: 'absolute' }}
                    open={loading}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>Fechas habilitadas correctamente.</Alert>}

                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Seleccione las fechas que desea volver a habilitar. Solo puede seleccionar fechas que fueron inhabilitadas manualmente.
                        </Typography>
                        <DateRangeCalendar
                            value={dateRange}
                            onChange={(newValue) => setDateRange(newValue)}
                            shouldDisableDate={shouldDisableDate}
                            calendars={2}
                        />
                    </LocalizationProvider>
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

export default ModalHabilitarFechas;
