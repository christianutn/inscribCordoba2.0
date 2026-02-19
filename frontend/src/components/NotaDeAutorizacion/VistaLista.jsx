import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Button,
    IconButton,
    Tooltip,
    Stack,
    Box,
    useTheme
} from '@mui/material';
import { PictureAsPdf, CheckCircle, Cancel } from '@mui/icons-material';
import dayjs from 'dayjs';

const VistaLista = ({ data, onVerPdf, onRechazar, onAutorizar }) => {
    const theme = useTheme();

    return (
        <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }} elevation={1}>
            <Table sx={{ minWidth: 650 }} aria-label="tabla de autorizaciones">
                <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Área / Ministerio</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Referente</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Fecha Rec.</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                No se encontraron datos
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((item) => {
                            const nota = item.NotaAutorizacion;
                            const persona = nota?.detalle_usuario?.detalle_persona;
                            const area = nota?.detalle_usuario?.detalle_area;
                            const ministerio = area?.detalle_ministerio;
                            const estado = item.Estado;
                            const isPendiente = item.estado_nota_autorizacion_cod === 'PEND';
                            const isAutorizado = item.estado_nota_autorizacion_cod === 'AUT';

                            return (
                                <TableRow key={item.id} hover>
                                    <TableCell>
                                        <Box sx={{ fontWeight: 'medium' }}>{area?.nombre}</Box>
                                        <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{ministerio?.nombre}</Box>
                                    </TableCell>
                                    <TableCell>
                                        {persona ? `${persona.apellido}, ${persona.nombre}` : 'No disponible'}
                                    </TableCell>
                                    <TableCell>
                                        {nota?.fecha_desde ? dayjs(nota.fecha_desde).format('DD/MM/YYYY') : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={estado?.nombre}
                                            color={isPendiente ? "warning" : isAutorizado ? "success" : "default"}
                                            size="small"
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Tooltip title="Ver PDF">
                                                <IconButton
                                                    color="primary"
                                                    size="small"
                                                    onClick={() => onVerPdf(nota?.ruta_archivo_local)}
                                                >
                                                    <PictureAsPdf fontSize="small" />
                                                </IconButton>
                                            </Tooltip>

                                            {isPendiente && (
                                                <>
                                                    <Tooltip title="Autorizar">
                                                        <IconButton
                                                            sx={{ color: theme.palette.success.main }}
                                                            size="small"
                                                            onClick={() => onAutorizar(nota)}
                                                        >
                                                            <CheckCircle fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Rechazar">
                                                        <IconButton
                                                            color="error"
                                                            size="small"
                                                            onClick={() => onRechazar(nota?.id)}
                                                        >
                                                            <Cancel fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default VistaLista;
