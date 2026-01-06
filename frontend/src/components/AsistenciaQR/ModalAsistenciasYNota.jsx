import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Grid,
    Paper,
    Divider,
    IconButton
} from '@mui/material';
import { Close as CloseIcon, EventAvailable, NoteAdd } from '@mui/icons-material';

const ModalAsistenciasYNota = ({ open, onClose, participante, asistencia, nombreCurso, idEvento }) => {
    // asistencia is an object { "YYYY-MM-DD": 1/0 }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2 }
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Box>
                    <Typography variant="h6" component="div" fontWeight="bold" color="primary">
                        Detalle de Asistencia y Notas
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                        {nombreCurso} (ID: {idEvento})
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                <Grid container spacing={3}>
                    {/* Participant Info */}
                    <Grid item xs={12}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                Participante: {participante?.nombres} {participante?.apellido}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                CUIL: {participante?.cuil}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Nota actual: {participante?.nota !== null ? participante?.nota : 'Sin nota'}
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* Attendance List */}
                    <Grid item xs={12} md={8}>
                        <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 600 }}>
                            Registro de Asistencia
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {asistencia && Object.keys(asistencia).length > 0 ? (
                                Object.entries(asistencia).map(([fecha, estado]) => (
                                    <Paper
                                        key={fecha}
                                        variant="outlined"
                                        sx={{
                                            p: 1.5,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            borderColor: estado === 1 ? 'success.light' : 'error.light',
                                            bgcolor: estado === 1 ? '#e8f5e9' : '#ffebee'
                                        }}
                                    >
                                        <Typography variant="body2" fontWeight={500} color="text.primary">
                                            {fecha}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            fontWeight="bold"
                                            color={estado === 1 ? 'success.main' : 'error.main'}
                                        >
                                            {estado === 1 ? 'ASISTIÓ' : 'AUSENTE'}
                                        </Typography>
                                    </Paper>
                                ))
                            ) : (
                                <Typography variant="body2" color="text.secondary">No hay registros de días para este evento.</Typography>
                            )}
                        </Box>
                    </Grid>

                    {/* Actions */}
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 600 }}>
                            Acciones
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<EventAvailable />}
                                fullWidth
                                onClick={() => alert("Funcionalidad 'Actualizar Asistencia' en construcción")}
                            >
                                Modificar Asistencia
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<NoteAdd />}
                                fullWidth
                                onClick={() => alert("Funcionalidad 'Modificar Nota' en construcción")}
                            >
                                {participante?.nota ? 'Modificar Nota' : 'Agregar Nota'}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} color="primary">
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalAsistenciasYNota;
