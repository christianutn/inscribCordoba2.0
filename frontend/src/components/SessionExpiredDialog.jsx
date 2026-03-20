import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Fade,
    useTheme
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

/**
 * Modal que informa al usuario que su sesión expiró por inactividad.
 * El usuario debe presionar el botón para ir al login.
 * Usa los colores del theme del sistema (CBA).
 */
const SessionExpiredDialog = ({ open, onClose }) => {
    const theme = useTheme();

    return (
        <Dialog
            open={open}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
                }
            }}
            slotProps={{
                backdrop: {
                    sx: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(8px)',
                    }
                }
            }}
        >
            {/* Barra superior - color del sistema */}
            <Box
                sx={{
                    height: 6,
                    backgroundColor: theme.palette.primary.main,
                }}
            />

            <DialogContent sx={{ textAlign: 'center', py: 5, px: 4 }}>
                {/* Ícono animado */}
                <Fade in={open} timeout={600}>
                    <Box
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 90,
                            height: 90,
                            borderRadius: '50%',
                            backgroundColor: theme.palette.grey[200],
                            mb: 3,
                            position: 'relative',
                            animation: open ? 'pulse 2s ease-in-out infinite' : 'none',
                            '@keyframes pulse': {
                                '0%': { boxShadow: `0 0 0 0 ${theme.palette.primary.main}4D` },
                                '70%': { boxShadow: `0 0 0 15px ${theme.palette.primary.main}00` },
                                '100%': { boxShadow: `0 0 0 0 ${theme.palette.primary.main}00` },
                            },
                        }}
                    >
                        <AccessTimeIcon
                            sx={{
                                fontSize: 45,
                                color: theme.palette.primary.main,
                            }}
                        />
                    </Box>
                </Fade>

                {/* Título */}
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 700,
                        color: theme.palette.grey[600],
                        mb: 1.5,
                        letterSpacing: '-0.3px',
                    }}
                >
                    Sesión Expirada
                </Typography>

                {/* Subtítulo */}
                <Typography
                    variant="body1"
                    sx={{
                        color: theme.palette.grey[500],
                        mb: 1,
                        fontSize: '1.05rem',
                        lineHeight: 1.6,
                    }}
                >
                    Tu sesión ha sido cerrada por <strong>inactividad prolongada</strong>.
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        color: theme.palette.grey[400],
                        mb: 3,
                        fontSize: '0.9rem',
                    }}
                >
                    Por motivos de seguridad, se requiere que inicies sesión nuevamente.
                </Typography>
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'center', pb: 4, px: 4 }}>
                <Button
                    variant="contained"
                    onClick={onClose}
                    size="large"
                    sx={{
                        borderRadius: '50px',
                        px: 5,
                        py: 1.5,
                        fontWeight: 600,
                        fontSize: '1rem',
                        textTransform: 'none',
                        backgroundColor: theme.palette.primary.main,
                        boxShadow: 'none',
                        '&:hover': {
                            backgroundColor: theme.palette.secondary.main,
                            boxShadow: 'none',
                            transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.2s ease',
                    }}
                >
                    Iniciar Sesión
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SessionExpiredDialog;
