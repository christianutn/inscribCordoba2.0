import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    IconButton,
    Typography,
    TextField
} from '@mui/material';
import {
    Close as CloseIcon,
    Edit as EditIcon,
    Preview as PreviewIcon,
    PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import ModalAsistenciasYNota from './ModalAsistenciasYNota.jsx';
import ModalConsultarCuil from './ModalConsultarCuil.jsx';
import { getAsistenciaPorEvento, postConfirmarAsistencia } from '../../services/asistencias.service.js';
import { DataGrid } from '@mui/x-data-grid';
import { Snackbar, Alert } from '@mui/material';

const ModalListaParticipantesPorEvento = ({ open, onClose, participantes, nombreCurso, idEvento, onDataChange }) => {
    const columns = [
        { field: 'cuil', headerName: 'CUIL', width: 130, headerAlign: 'center', align: 'center' },
        { field: 'nombres', headerName: 'Nombres', width: 180, headerAlign: 'center' },
        { field: 'apellido', headerName: 'Apellido', width: 180, headerAlign: 'center' },
        { field: 'correo_electronico', headerName: 'Correo Electrónico', width: 220, headerAlign: 'center' },
        { field: 'reparticion', headerName: 'Repartición', width: 150, headerAlign: 'center' },
        {
            field: 'es_empleado',
            headerName: 'Empleado',
            width: 100,
            headerAlign: 'center',
            align: 'center',
            valueGetter: (value, row) => {
                if (!row) return 'N/A';
                return row.es_empleado ? 'Sí' : 'No';
            }
        },
        {
            field: 'nota',
            headerName: 'Nota',
            width: 100,
            headerAlign: 'center',
            align: 'center',
            valueFormatter: (params) => {
                if (!params || params.value === null || params.value === undefined) {
                    return 'N/A';
                }
                return params.value;
            }
        },
        {
            field: 'acciones',
            headerName: 'Acciones',
            width: 100,
            headerAlign: 'center',
            align: 'center',
            sortable: false,
            renderCell: (params) => (
                <IconButton
                    size="small"
                    onClick={() => handleClickOpenModalAsistenciasYNota(params.row)}
                    sx={{ color: 'primary.main', '&:hover': { backgroundColor: 'rgba(0, 123, 255, 0.04)' } }}
                >
                    <PreviewIcon />
                </IconButton>
            )
        }
    ];

    // Build rows with unique id
    const rows = participantes.map((p, index) => ({ id: p.cuil || index, ...p }));

    // Filter state
    const [filterText, setFilterText] = useState('');

    // Filtered rows
    const filteredRows = rows.filter((row) => {
        const lower = filterText.toLowerCase();
        return (
            (row.cuil && row.cuil.toString().includes(filterText)) ||
            (row.nombres && row.nombres.toLowerCase().includes(lower)) ||
            (row.apellido && row.apellido.toLowerCase().includes(lower))
        );
    });

    // Attendance modal state
    const [openAsistenciasModal, setOpenAsistenciasModal] = useState(false);
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [asistenciaData, setAsistenciaData] = useState(null);

    const handleClickOpenModalAsistenciasYNota = async (row) => {
        try {
            const data = await getAsistenciaPorEvento(idEvento, row.cuil);
            setAsistenciaData(data);
            setSelectedParticipant(row);
            setOpenAsistenciasModal(true);
        } catch (error) {
            console.error('Error fetching asistencia por evento:', error);
            alert('No se pudo obtener la asistencia del participante.');
        }
    };

    const handleCloseAsistenciasModal = () => {
        setOpenAsistenciasModal(false);
        setSelectedParticipant(null);
        setAsistenciaData(null);
    };

    // State for Consultar CUIL Modal (Add Participant)
    const [openConsultarCuilModal, setOpenConsultarCuilModal] = useState(false);

    // Feedback states
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const handleOpenConsultarCuilModal = () => {
        setOpenConsultarCuilModal(true);
    };

    const handleCloseConsultarCuilModal = () => {
        setOpenConsultarCuilModal(false);
    };

    const handleConfirmNewParticipant = async (userData) => {
        try {
            // Llamada API para confirmar asistencia / inscribir
            await postConfirmarAsistencia(userData.cuil, idEvento);

            setSnackbarMessage(`Se agregó correctamente a ${userData.nombre} ${userData.apellido}`);
            setSnackbarSeverity('success');
            setSnackbarOpen(true);

            // Refresh the list after successfully adding a participant
            if (onDataChange) {
                onDataChange();
            }
        } catch (error) {
            console.error('Error al agregar participante:', error);
            setSnackbarMessage(`Error al agregar participante: ${error.message}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            handleCloseConsultarCuilModal();
        }
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbarOpen(false);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2, minHeight: '70vh' } }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Box>
                    <Typography variant="h5" component="div" fontWeight="bold" color="primary">
                        Lista de Participantes
                    </Typography>
                    {nombreCurso && (
                        <Typography variant="subtitle1" color="text.secondary">
                            {nombreCurso} - Evento #{idEvento}
                        </Typography>
                    )}
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Box sx={{ px: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={handleOpenConsultarCuilModal}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                    Agregar Participante
                </Button>
            </Box>

            <DialogContent sx={{ pt: 2 }}>
                {/* Filter input */}
                <Box sx={{ mb: 2, mt: 2 }}>
                    <TextField
                        label="Filtrar por CUIL, nombre o apellido"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                    />
                </Box>
                <Box sx={{ height: 500, width: '100%' }}>
                    <DataGrid
                        rows={filteredRows}
                        columns={columns}
                        pageSize={10}
                        rowsPerPageOptions={[10, 25, 50]}
                        disableSelectionOnClick
                        sx={{
                            '& .MuiDataGrid-cell': { borderBottom: '1px solid #f0f0f0' },
                            '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f8f9fa', fontWeight: 'bold' }
                        }}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} variant="outlined" color="primary">
                    Cerrar
                </Button>
            </DialogActions>

            {/* Modal de Asistencias y Nota */}
            {openAsistenciasModal && selectedParticipant && (
                <ModalAsistenciasYNota
                    open={openAsistenciasModal}
                    onClose={handleCloseAsistenciasModal}
                    participante={selectedParticipant}
                    asistencia={asistenciaData}
                    nombreCurso={nombreCurso}
                    idEvento={idEvento}
                    onDataChange={onDataChange}
                />
            )}
            {/* Modal Consultar CUIL (Agregar Participante) */}
            {openConsultarCuilModal && (
                <ModalConsultarCuil
                    open={openConsultarCuilModal}
                    onClose={handleCloseConsultarCuilModal}
                    idEvento={idEvento}
                    nombreCurso={nombreCurso}
                    onConfirmAttendance={handleConfirmNewParticipant}
                />
            )}

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Dialog>
    );
};

export default ModalListaParticipantesPorEvento;
