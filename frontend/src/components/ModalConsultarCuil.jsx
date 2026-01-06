import React, { useState } from 'react';
import {
    Dialog,
    Typography,
    Box,
    TextField,
    Button,
    IconButton,
    InputAdornment,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Close as CloseIcon,
    Badge as BadgeIcon,
    PersonSearch as PersonSearchIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import { getConsultarAsistencia } from '../services/asistencias.service';
import ModalDatosParticipante from './ModalDatosParticipante';

const ModalConsultarCuil = ({ open, onClose, idEvento, nombreCurso, onConfirmAttendance }) => {
    const [cuil, setCuil] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Estado para el segundo modal
    const [userData, setUserData] = useState(null);
    const [showDatosModal, setShowDatosModal] = useState(false);

    const formatCuil = (value) => {
        // Remove non-numeric characters
        const numbers = value.replace(/\D/g, '');

        // Format as XX-XXXXXXXX-X
        if (numbers.length <= 2) return numbers;
        if (numbers.length <= 10) return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
        return `${numbers.slice(0, 2)}-${numbers.slice(2, 10)}-${numbers.slice(10, 11)}`;
    };

    const handleChange = (event) => {
        const rawValue = event.target.value;
        // Only allow erasing or adding numbers
        const numbers = rawValue.replace(/\D/g, '');
        if (numbers.length <= 11) {
            setCuil(formatCuil(numbers));
            setError(''); // Limpiar error al escribir
        }
    };

    const handleSubmit = async () => {
        // Validate length (11 numbers plus 2 hyphens = 13 chars)
        const cleanCuil = cuil.replace(/\D/g, '');
        if (cleanCuil.length !== 11) {
            setError('El CUIL debe tener 11 dígitos.');
            return;
        }

        if (!idEvento) {
            setError('Error interno: No se ha seleccionado un evento.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = await getConsultarAsistencia(cleanCuil, idEvento);

            // Si funciona, guardamos datos y abrimos el segundo modal
            setUserData(data);
            setShowDatosModal(true);

        } catch (err) {
            console.error(err);
            setError(err.message || 'Error al consultar el participante.');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseDatosModal = () => {
        setShowDatosModal(false);
        setUserData(null);
    };

    const handleConfirmDatos = (data) => {
        // Ejecutar la acción final (confirmar asistencia)
        if (onConfirmAttendance) {
            onConfirmAttendance(data);
        }
        // Cerrar todo
        handleCloseDatosModal();
        onClose(); // Cerrar el modal principal también
        setCuil('');
    };

    // Si el segundo modal está abierto, lo mostramos
    if (showDatosModal) {
        return (
            <ModalDatosParticipante
                open={showDatosModal}
                onClose={handleCloseDatosModal}
                onConfirm={handleConfirmDatos}
                userData={userData}
                idEvento={idEvento}
                nombreCurso={nombreCurso}
            />
        );
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    boxShadow: 24,
                    overflow: 'hidden'
                }
            }}
        >
            {/* Close Button */}
            <IconButton
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    right: 16,
                    top: 16,
                    color: 'text.secondary',
                    '&:hover': {
                        bgcolor: 'action.hover',
                    }
                }}
            >
                <CloseIcon />
            </IconButton>

            <Box sx={{ p: 4, pt: 5 }}>
                {/* Header Icon */}
                <Box
                    sx={{
                        mx: 'auto',
                        mb: 3,
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: (theme) => `${theme.palette.primary.main}1A`, // 10% opacity equivalent
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <BadgeIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                </Box>

                {/* Title */}
                <Typography
                    variant="h5"
                    align="center"
                    sx={{
                        fontWeight: 'bold',
                        mb: 1,
                        color: 'text.primary'
                    }}
                >
                    Consultar CUIL
                </Typography>

                {/* Subtitle / Course Name */}
                {nombreCurso && (
                    <Typography
                        variant="subtitle1"
                        align="center"
                        color="primary"
                        sx={{ mb: 1, fontWeight: 'medium' }}
                    >
                        {nombreCurso}
                    </Typography>
                )}
                {/* Event ID */}
                {idEvento && (
                    <Typography
                        variant="caption"
                        align="center"
                        display="block"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                    >
                        Evento #{idEvento}
                    </Typography>
                )}

                {/* Description */}
                <Typography
                    variant="body2"
                    align="center"
                    color="text.secondary"
                    sx={{ mb: 4 }}
                >
                    Ingrese el número de CUIL del usuario referente para verificar su estado de autorización.
                </Typography>

                {/* Mensajes de Error */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Input Section */}
                <Box sx={{ mb: 1 }}>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            fontWeight: 600,
                            mb: 1,
                            color: 'text.primary'
                        }}
                    >
                        Ingrese su CUIL
                    </Typography>

                    <TextField
                        fullWidth
                        placeholder="20-12345678-9"
                        value={cuil}
                        onChange={handleChange}
                        disabled={loading}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PersonSearchIcon sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                            sx: {
                                borderRadius: 2,
                                bgcolor: 'background.paper',
                            }
                        }}
                        sx={{ mb: 1 }}
                    />

                    <Typography variant="caption" color="text.secondary">
                        Formato requerido: XX-XXXXXXXX-X (el sistema agregará los guiones automáticamente).
                    </Typography>
                </Box>
            </Box>

            {/* Footer / Actions */}
            <Box
                sx={{
                    bgcolor: 'grey.50',
                    px: 3,
                    py: 2,
                    borderTop: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row-reverse' },
                    gap: 1.5
                }}
            >
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                    disabled={loading || cuil.replace(/\D/g, '').length !== 11}
                    fullWidth
                    sx={{
                        fontWeight: 'bold',
                        py: 1.25,
                        borderRadius: 2
                    }}
                >
                    {loading ? 'Consultando...' : 'Consultar'}
                </Button>

                <Button
                    variant="outlined"
                    onClick={onClose}
                    disabled={loading}
                    fullWidth
                    sx={{
                        fontWeight: 'bold',
                        py: 1.25,
                        borderRadius: 2,
                        color: 'text.primary',
                        borderColor: 'divider',
                        '&:hover': {
                            borderColor: 'text.secondary',
                            bgcolor: 'action.hover'
                        }
                    }}
                >
                    Cancelar
                </Button>
            </Box>
        </Dialog>
    );
};

export default ModalConsultarCuil;
