import React from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Button,
    Stack,
    useTheme
} from '@mui/material';
import dayjs from 'dayjs';

const VistaCards = ({ data, onVerPdf, onRechazar, onAutorizar }) => {
    const theme = useTheme();

    return (
        <Grid container spacing={3}>
            {data.map((item) => {
                const nota = item.NotaAutorizacion;
                const persona = nota?.detalle_usuario?.detalle_persona;
                const area = nota?.detalle_usuario?.detalle_area;
                const ministerio = area?.detalle_ministerio;
                const estado = item.Estado;
                const isPendiente = item.estado_nota_autorizacion_cod === 'PEND';
                const isAutorizado = item.estado_nota_autorizacion_cod === 'AUT';

                return (
                    <Grid item xs={12} md={6} xl={4} key={item.id}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }} elevation={1}>
                            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                    <Typography variant="h6" component="div" fontWeight="bold">
                                        {area?.nombre} / {ministerio?.nombre}
                                    </Typography>
                                    <Chip
                                        label={estado?.nombre}
                                        color={isPendiente ? "warning" : isAutorizado ? "success" : "default"}
                                        size="small"
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                </Box>

                                <Box sx={{ color: 'text.primary', fontSize: '0.875rem', flexGrow: 1 }}>
                                    <Typography gutterBottom>
                                        <Box component="span" fontWeight="bold">Referente:</Box> {persona ? `${persona.apellido}, ${persona.nombre}` : 'No disponible'}
                                    </Typography>
                                    <Typography gutterBottom>
                                        <Box component="span" fontWeight="bold">Fecha de Recepción:</Box> {nota?.fecha_desde ? dayjs(nota.fecha_desde).format('DD-MM-YYYY') : '-'}
                                    </Typography>
                                    {isAutorizado && (
                                        <Typography >
                                            <Box component="span" fontWeight="bold">Fecha de Aprobación:</Box> {item.fecha_desde ? dayjs(item.fecha_desde).format('DD-MM-YYYY') : '-'}
                                        </Typography>
                                    )}
                                </Box>

                                <Stack spacing={2} mt={2}>
                                    <Box>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={() => onVerPdf(nota?.ruta_archivo_local)}
                                            sx={{
                                                bgcolor: theme.palette.primary.main,
                                                '&:hover': { bgcolor: theme.palette.primary.dark }
                                            }}
                                        >
                                            Ver PDF
                                        </Button>
                                    </Box>
                                    <Stack direction="row" spacing={2}>
                                        {isPendiente && (
                                            <>
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    fullWidth
                                                    onClick={() => onRechazar(nota?.id)}
                                                    sx={{ fontWeight: 'bold' }}
                                                >
                                                    Rechazar
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    fullWidth
                                                    onClick={() => onAutorizar(nota)}
                                                    sx={{
                                                        bgcolor: theme.palette.primary.main,
                                                        '&:hover': { bgcolor: theme.palette.primary.dark },
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    Autorizar
                                                </Button>
                                            </>
                                        )}
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                );
            })}
        </Grid>
    );
};

export default VistaCards;
