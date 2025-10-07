import React, { useCallback } from 'react';
import {
    Box, Modal, Card, CardContent, CardHeader, IconButton, Divider, List, ListItem,
    ListItemText, Chip, Typography, Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';
import ActionButton from '../../UIElements/ActionButton';
import { modalStyle } from '../constants';
import { formatBooleanToSiNo, formatValue } from '../utils';

const DetalleInstanciaModal = ({
    open,
    onClose,
    selectedRowData,
    onOpenReasignModal,
    onOpenEstadoModal,
    onOpenOtrosModal,
    onOpenRestrictionsModal,
    onToggleAutogestionado,
    onOpenFechasModal,
    onOpenComentariosModal,
    onOpenPublicadaModal,
    onOpenCupoModal
}) => {

    const originalInstanciaData = selectedRowData?.originalInstancia;

    const renderDetailItem = useCallback((label, value, isBoolean = false, actionButton = null, showIf = true) => {
        if (!showIf) {
            return null;
        }
        const displayValue = isBoolean ? formatBooleanToSiNo(value) : (formatValue(value) || '-');
        return ( 
            <React.Fragment key={label}>
                <ListItem sx={{ py: 0.8, px: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <ListItemText
                        primary={displayValue}
                        secondary={label}
                        primaryTypographyProps={{ fontWeight: 500, wordBreak: 'break-word', color: "black" }}
                        secondaryTypographyProps={{ fontSize: '0.8rem' }}
                    />
                    {actionButton}
                </ListItem>
                <Divider component="li" sx={{ my: 0.5 }} />
            </React.Fragment>
        );
    }, []);

    const renderAgeRestriction = () => {
        if (!originalInstanciaData?.tiene_restriccion_edad) {
            return "Ninguna";
        }
        const desde = originalInstanciaData.restriccion_edad_desde;
        const hasta = originalInstanciaData.restriccion_edad_hasta;
        if (desde && hasta) return `Desde ${desde} hasta ${hasta} años`;
        if (desde && !hasta) return `Desde ${desde} años en adelante`;
        if (!desde && hasta) return `Hasta ${hasta} años`;
        return "Definida pero incompleta";
    };

    if (!selectedRowData || !originalInstanciaData) return null;

    return (
        <Modal open={open} onClose={onClose} aria-labelledby="course-detail-title">
            <Box sx={modalStyle}>
                <Card sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
                    <CardHeader
                        avatar={<InfoIcon color="primary" />}
                        id="course-detail-title"
                        title={originalInstanciaData.detalle_curso?.nombre || "Detalle de Instancia"}
                        titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                        subheader={`Código Curso: ${originalInstanciaData.curso}`}
                        action={<IconButton aria-label="Cerrar" onClick={onClose}><CloseIcon /></IconButton>}
                        sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, bgcolor: 'grey.100' }}
                    />
                    <CardContent sx={{ overflowY: 'auto', flexGrow: 1, p: 2 }}>
                        <List dense>
                            {renderDetailItem("Asignado", selectedRowData["Asignado"], false, <ActionButton onClick={onOpenReasignModal}>Reasignar</ActionButton>)}
                            {renderDetailItem("Estado de Instancia", originalInstanciaData.estado_instancia, false, <ActionButton onClick={onOpenEstadoModal}>Cambiar</ActionButton>)}

                            <Divider sx={{ my: 1 }}><Chip label="Fechas Instancia" size="small" /></Divider>
                            {renderDetailItem("Fecha Inicio Curso", originalInstanciaData.fecha_inicio_curso)}
                            {renderDetailItem("Fecha Fin Curso", originalInstanciaData.fecha_fin_curso)}
                            {renderDetailItem("Fecha Inicio Inscripción", originalInstanciaData.fecha_inicio_inscripcion)}
                            {renderDetailItem("Fecha Fin Inscripción", originalInstanciaData.fecha_fin_inscripcion, false)}
                            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                                <ActionButton onClick={onOpenFechasModal}>
                                    Cambiar Fechas
                                </ActionButton>
                            </Box>

                            <Divider sx={{ my: 1 }}><Chip label="Detalles Instancia" size="small" /></Divider>
                            {renderDetailItem("Cupo", originalInstanciaData.cupo || 0, false, <ActionButton onClick={onOpenCupoModal}>Cambiar</ActionButton>)}
                            {renderDetailItem("Es Autogestionado", originalInstanciaData.es_autogestionado, true, <ActionButton onClick={onToggleAutogestionado}>Cambiar</ActionButton>)}
                            {renderDetailItem("Publicada en Portal", originalInstanciaData.es_publicada_portal_cc, true, <ActionButton onClick={onOpenPublicadaModal}>Cambiar</ActionButton>)}
                            {renderDetailItem("Comentario", originalInstanciaData.comentario, false, <ActionButton onClick={onOpenComentariosModal}>Cambiar</ActionButton>)}
                            {renderDetailItem("Cantidad de Inscriptos", originalInstanciaData.cantidad_inscriptos || 0, false, <ActionButton onClick={onOpenOtrosModal}>Cambiar</ActionButton>)}

                            <Divider sx={{ my: 1 }}><Chip label="Restricciones" size="small" /></Divider>
                            <ListItem sx={{ py: 1, px: 0, display: 'block' }}>
                                <ListItemText primary="Edad" secondary="Restricción por rango de edad" />
                                <Typography variant="body2" color="text.secondary">{renderAgeRestriction()}</Typography>
                            </ListItem>
                            <ListItem sx={{ py: 1, px: 0, display: 'block' }}>
                                <ListItemText primary="Departamentos" secondary="Limitado a estas áreas" />
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                    {(originalInstanciaData.detalle_restricciones_por_departamento?.length > 0) ?
                                        originalInstanciaData.detalle_restricciones_por_departamento.map(d => <Chip key={d.departamento_id} label={d.detalle_departamento?.nombre || d.departamento_id} size="small" />) :
                                        <Typography variant="body2" color="text.secondary"><i>Ninguna</i></Typography>
                                    }
                                </Box>
                            </ListItem>
                            <ListItem sx={{ py: 1, px: 0, display: 'block' }}>
                                <ListItemText primary="Correlatividades" secondary="Requiere haber aprobado estos cursos" />
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                    {(originalInstanciaData.detalle_restricciones_por_correlatividad?.length > 0) ?
                                        originalInstanciaData.detalle_restricciones_por_correlatividad.map(c => <Chip key={c.curso_correlativo} label={c.detalle_curso_correlativo?.nombre || c.curso_correlativo} size="small" />) :
                                        <Typography variant="body2" color="text.secondary"><i>Ninguna</i></Typography>
                                    }
                                </Box>
                            </ListItem>
                            <ListItem sx={{ justifyContent: 'flex-end', pt: 2, gap: 1 }}>
                                <Button variant="contained" onClick={onOpenRestrictionsModal} startIcon={<SettingsIcon />}>Gestionar Restricciones</Button>
                            </ListItem>
                        </List>
                    </CardContent>
                </Card>
            </Box>
        </Modal>
    );
};

export default DetalleInstanciaModal;
