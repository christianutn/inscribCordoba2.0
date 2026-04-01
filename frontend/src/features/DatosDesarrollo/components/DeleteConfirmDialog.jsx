import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography, Box
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const MESES = [
    '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DeleteConfirmDialog = ({ open, onClose, onConfirm, record }) => {
    if (!record) return null;

    const periodo = `${MESES[record.mes]} ${record.anio}`;
    const desarrollador = record.detalle_usuario
        ? `${record.detalle_usuario.nombre || ''} ${record.detalle_usuario.apellido || ''}`.trim()
        : record.cuil;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
                <WarningAmberIcon color="warning" />
                <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
                    Confirmar Eliminación
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    ¿Está seguro que desea eliminar el siguiente registro?
                </Typography>
                <Box sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'grey.50',
                    border: '1px solid',
                    borderColor: 'grey.200'
                }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Período:</strong> {periodo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Desarrollador:</strong> {desarrollador}
                    </Typography>
                    {record.lineas_cod_modificadas != null && (
                        <Typography variant="body2" color="text.secondary">
                            <strong>Líneas Mod.:</strong> {record.lineas_cod_modificadas.toLocaleString()}
                        </Typography>
                    )}
                </Box>
                <Typography variant="caption" color="error.main" sx={{ mt: 1.5, display: 'block' }}>
                    Esta acción no se puede deshacer.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} color="inherit">
                    Cancelar
                </Button>
                <Button onClick={() => onConfirm(record.id)} variant="contained" color="error" disableElevation>
                    Eliminar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteConfirmDialog;
