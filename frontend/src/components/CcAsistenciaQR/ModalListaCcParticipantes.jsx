import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, IconButton, Typography, Button, TextField, Tooltip, Snackbar, Alert } from '@mui/material';
import { Close as CloseIcon, Preview as PreviewIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import ModalCcAsistenciasYNota from './ModalCcAsistenciasYNota.jsx';
import ModalConsultarCcCuil from './ModalConsultarCcCuil.jsx';
import { confirmarCcAsistencia } from '../../services/cc_asistencia.service.js';

export default function ModalListaCcParticipantes({ open, onClose, inscriptos, nombreCurso, idEvento, onDataChange }) {
    const [filterText, setFilterText] = useState('');

    // Rows parsing
    const rows = (inscriptos || []).map((p, idx) => ({ id: p.id || idx, ...p }));

    const filteredRows = rows.filter(row => {
        const lower = filterText.toLowerCase();
        return (
            (row.cuil && row.cuil.toLowerCase().includes(lower)) ||
            (row.nombre && row.nombre.toLowerCase().includes(lower)) ||
            (row.apellido && row.apellido.toLowerCase().includes(lower))
        );
    });

    const [openNotaModal, setOpenNotaModal] = useState(false);
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [openConsultarCuil, setOpenConsultarCuil] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handleOpenNotaModal = (row) => {
        setSelectedParticipant(row);
        setOpenNotaModal(true);
    };

    const handleConfirmNewParticipant = async (userData) => {
        try {
            await confirmarCcAsistencia({ cuil: userData.cuil, evento_id: idEvento });
            setSnackbar({ open: true, message: `Se agregó a ${userData.nombre} ${userData.apellido} correctamente`, severity: 'success' });
            if (onDataChange) onDataChange();
        } catch (error) {
            setSnackbar({ open: true, message: 'Error al agregar participante', severity: 'error' });
        } finally {
            setOpenConsultarCuil(false);
        }
    };

    const columns = [
        { field: 'cuil', headerName: 'CUIL', width: 130 },
        { field: 'nombre', headerName: 'Nombres', width: 150 },
        { field: 'apellido', headerName: 'Apellido', width: 150 },
        { field: 'correo', headerName: 'Correo Electrónico', width: 220 },
        { field: 'reparticion', headerName: 'Repartición', width: 150 },
        { field: 'nota', headerName: 'Nota', width: 100, align: 'center', headerAlign: 'center', valueFormatter: params => params.value !== null ? params.value : 'N/A' },
        { field: 'estado_asistencia', headerName: 'Asistencia', width: 100, align: 'center', headerAlign: 'center', valueFormatter: params => params.value === 1 ? 'Presente' : 'Ausente' },
        {
            field: 'acciones', headerName: 'Acciones', width: 100, align: 'center', sortable: false, renderCell: (params) => (
                <Tooltip title="Ver detalle">
                    <IconButton size="small" color="primary" onClick={() => handleOpenNotaModal(params.row)}>
                        <PreviewIcon />
                    </IconButton>
                </Tooltip>
            )
        }
    ];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth PaperProps={{ sx: { height: '80vh' } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h5" color="primary">Inscriptos</Typography>
                    <Typography variant="subtitle1" color="text.secondary">{nombreCurso} - Evento #{idEvento}</Typography>
                </Box>
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </DialogTitle>

            <Box sx={{ px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2 }}>
                <TextField
                    label="Filtrar por CUIL, nombre o apellido"
                    variant="outlined"
                    size="small"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    sx={{ minWidth: 300 }}
                />
                <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => setOpenConsultarCuil(true)}>
                    Agregar Participante
                </Button>
            </Box>

            <DialogContent dividers sx={{ p: 0 }}>
                <DataGrid
                    rows={filteredRows}
                    columns={columns}
                    localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                    disableSelectionOnClick
                />
            </DialogContent>

            {/* Modals */}
            {openNotaModal && selectedParticipant && (
                <ModalCcAsistenciasYNota
                    open={openNotaModal}
                    onClose={() => setOpenNotaModal(false)}
                    participante={selectedParticipant}
                    idEvento={idEvento}
                    nombreCurso={nombreCurso}
                    onDataChange={onDataChange}
                />
            )}

            {openConsultarCuil && (
                <ModalConsultarCcCuil
                    open={openConsultarCuil}
                    onClose={() => setOpenConsultarCuil(false)}
                    idEvento={idEvento}
                    nombreCurso={nombreCurso}
                    onConfirmAttendance={handleConfirmNewParticipant}
                />
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
            </Snackbar>

        </Dialog>
    );
}
