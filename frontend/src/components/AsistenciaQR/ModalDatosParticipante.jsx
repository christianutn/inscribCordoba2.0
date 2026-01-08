
import React from 'react';
import {
    Dialog,
    Typography,
    Box,
    Button,
    IconButton,
    Avatar,
    Divider
} from '@mui/material';
import {
    Close as CloseIcon,
    Person as PersonIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';


const ModalDatosParticipante = ({ open, onClose, onConfirm, userData, idEvento, nombreCurso }) => {

    if (!userData) return null;

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

            <Box sx={{ p: { xs: 2, sm: 4 }, pt: { xs: 3, sm: 5 }, textAlign: 'center' }}>
                {/* Avatar / Icon */}
                <Avatar
                    sx={{
                        mx: 'auto',
                        mb: 2,
                        width: { xs: 60, sm: 80 },
                        height: { xs: 60, sm: 80 },
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                        fontSize: { xs: 30, sm: 40 }
                    }}
                >
                    <PersonIcon fontSize="inherit" />
                </Avatar>

                {/* Title */}
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 'bold',
                        color: 'text.primary',
                        mb: 1,
                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                    }}
                >
                    Confirmar Asistencia
                </Typography>

                {/* Course Info */}
                {nombreCurso && (
                    <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'medium', mb: 0.5, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                        {nombreCurso}
                    </Typography>
                )}
                {idEvento && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                        Evento #{idEvento}
                    </Typography>
                )}

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Verifique los datos del participante antes de confirmar.
                </Typography>

                {/* User Details */}
                <Box sx={{
                    bgcolor: 'grey.50',
                    p: 2,
                    borderRadius: 3,
                    mb: 2,
                    border: 1,
                    borderColor: 'divider'
                }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            NOMBRE Y APELLIDO
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                            {userData.nombre} {userData.apellido}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            CUIL
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontFamily: 'monospace', letterSpacing: 1 }}>
                            {userData.cuil}
                        </Typography>
                    </Box>
                </Box>

                {userData.existe === false && (
                    <Typography variant="caption" color="warning.main" sx={{ display: 'block', mb: 2, fontWeight: 'bold' }}>
                        ⚠️ Este participante no se encuentra inscripto en la base local, pero fue encontrado en CIDI.
                    </Typography>
                )}

            </Box>

            {/* Footer / Actions */}
            <Box
                sx={{
                    bgcolor: 'grey.50',
                    px: { xs: 2, sm: 3 },
                    py: 2,
                    borderTop: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: { xs: 'column-reverse', sm: 'row' },
                    gap: 1.5,
                    justifyContent: 'space-between'
                }}
            >
                <Button
                    variant="outlined"
                    onClick={onClose}
                    startIcon={<CancelIcon />}
                    fullWidth
                    sx={{
                        fontWeight: 'bold',
                        color: 'text.secondary',
                        borderColor: 'divider',
                        '&:hover': {
                            borderColor: 'text.primary',
                            bgcolor: 'action.hover'
                        }
                    }}
                >
                    Cancelar
                </Button>

                <Button
                    variant="contained"
                    onClick={() => onConfirm(userData)}
                    startIcon={<CheckCircleIcon />}
                    fullWidth
                    sx={{
                        fontWeight: 'bold',
                        bgcolor: 'success.main',
                        '&:hover': {
                            bgcolor: 'success.dark'
                        }
                    }}
                >
                    Confirmar
                </Button>
            </Box>

        </Dialog>
    );
};

export default ModalDatosParticipante;
