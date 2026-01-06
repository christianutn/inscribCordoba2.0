
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

            <Box sx={{ p: 4, pt: 5, textAlign: 'center' }}>
                {/* Avatar / Icon */}
                <Avatar
                    sx={{
                        mx: 'auto',
                        mb: 3,
                        width: 80,
                        height: 80,
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                        fontSize: 40
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
                        mb: 1
                    }}
                >
                    Confirmar Asistencia
                </Typography>

                {/* Course Info */}
                {nombreCurso && (
                    <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                        {nombreCurso}
                    </Typography>
                )}
                {idEvento && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                        Evento #{idEvento}
                    </Typography>
                )}

                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Verifique los datos del participante antes de confirmar.
                </Typography>

                {/* User Details */}
                <Box sx={{
                    bgcolor: 'grey.50',
                    p: 3,
                    borderRadius: 3,
                    mb: 2,
                    border: 1,
                    borderColor: 'divider'
                }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            NOMBRE Y APELLIDO
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
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
                    px: 3,
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
