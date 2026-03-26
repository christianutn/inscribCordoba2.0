import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, IconButton, Typography, Button, TextField, Tooltip, Snackbar, Alert, useTheme, useMediaQuery } from '@mui/material';
import { Close as CloseIcon, Preview as PreviewIcon, PersonAdd as PersonAddIcon, Download as DownloadIcon } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import ModalCcAsistenciasYNota from './ModalCcAsistenciasYNota.jsx';
import ModalConsultarCcCuil from './ModalConsultarCcCuil.jsx';
import { confirmarCcAsistencia } from '../../services/cc_asistencia.service.js';

export default function ModalListaCcParticipantes({ open, onClose, inscriptos, nombreCurso, fechaEvento, idEvento, onDataChange }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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

    const handleDownloadExcel = async () => {
        try {
            const ExcelJS = (await import('exceljs')).default;
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Asistencia');

            worksheet.columns = [
                { header: 'CUIL', key: 'cuil', width: 20 },
                { header: 'Nombres', key: 'nombre', width: 30 },
                { header: 'Apellido', key: 'apellido', width: 30 },
                { header: 'Correo Electrónico', key: 'correo', width: 35 },
                { header: 'Nota', key: 'nota', width: 10 },
                { header: 'Estado Asistencia', key: 'estado_asistencia', width: 20 },
            ];

            (inscriptos || []).forEach(p => {
                worksheet.addRow({
                    cuil: p.cuil,
                    nombre: p.nombre,
                    apellido: p.apellido,
                    correo: p.correo || 'N/A',
                    nota: p.nota,
                    estado_asistencia: Number(p.estado_asistencia) === 1 ? 'Presente' : 'Ausente'
                });
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const safeCursoName = nombreCurso?.replace(/[^a-z0-9]/gi, '_') || 'Curso';
            link.download = `Asistentes_${safeCursoName}_${fechaEvento}.xlsx`;
            link.click();
        } catch (err) {
            console.error('Error Excel download:', err);
        }
    };

    const columns = [
        { field: 'cuil', headerName: 'CUIL', minWidth: 130, flex: 0.7 },
        { field: 'nombre', headerName: 'Nombres', minWidth: 160, flex: 1 },
        { field: 'apellido', headerName: 'Apellido', minWidth: 160, flex: 1 },
        { field: 'correo', headerName: 'Correo Electrónico', minWidth: 250, flex: 1.5 },
        { field: 'nota', headerName: 'Nota', width: 90, align: 'center', headerAlign: 'center', valueFormatter: value => value != null ? value : '-' },
        { field: 'estado_asistencia', headerName: 'Asistencia', width: 110, align: 'center', headerAlign: 'center', valueFormatter: value => Number(value) === 1 ? 'Presente' : 'Ausente' },
        {
            field: 'acciones', headerName: 'Acciones', width: 90, align: 'center', sortable: false, renderCell: (params) => (
                <Tooltip title="Ver detalle" slotProps={{ tooltip: { sx: { fontFamily: 'Poppins' } } }}>
                    <IconButton aria-label="Ver detalle asistente" size="medium" color="primary" onClick={() => handleOpenNotaModal(params.row)}>
                        <PreviewIcon />
                    </IconButton>
                </Tooltip>
            )
        }
    ];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xl"
            fullWidth
            PaperProps={{
                sx: {
                    maxHeight: '90vh',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', p: 3, pb: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontFamily: 'Geogrotesque Sharp', fontWeight: 'bold', color: '#1A1A1A' }}>
                        Inscriptos
                    </Typography>
                    <Typography variant="body" sx={{ color: '#5C6F82', fontFamily: 'Poppins', mt: 0.5 }}>
                        {nombreCurso} {fechaEvento ? ` | ${fechaEvento.split('-').reverse().join('-')}` : ''}
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    sx={{ color: '#9E9E9E', '&:hover': { color: '#1A1A1A', bgcolor: 'rgba(0,0,0,0.04)' } }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Box sx={{ px: 3, display: 'flex', flexDirection: { xs: 'column-reverse', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, mb: 3, gap: 2 }}>
                <TextField
                    placeholder="Filtrar por CUIL, nombre o apellido..."
                    variant="outlined"
                    size="small"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    InputProps={{
                        sx: {
                            fontFamily: 'Poppins',
                            borderRadius: '8px',
                            bgcolor: '#fff',
                            fontSize: '0.95rem'
                        }
                    }}
                    sx={{ width: { xs: '100%', md: 400 } }}
                />
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadExcel}
                        sx={{
                            fontFamily: 'Geogrotesque Sharp',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            py: 1,
                            px: 2,
                            fontWeight: 'bold'
                        }}
                    >
                        DESCARGAR LISTA
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<PersonAddIcon />}
                        onClick={() => setOpenConsultarCuil(true)}
                        sx={{
                            fontFamily: 'Geogrotesque Sharp',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            py: 1,
                            px: 2,
                            fontWeight: 'bold',
                            boxShadow: '0 4px 12px rgba(0,123,255,0.1)'
                        }}
                    >
                        AGREGAR PARTICIPANTE
                    </Button>
                </Box>
            </Box>

            <DialogContent dividers sx={{ p: 0, px: 3, pb: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flexGrow: 1, width: '100%', height: 600 }}>
                    <DataGrid
                        rows={filteredRows}
                        columns={columns}
                        rowHeight={70}
                        localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                        disableSelectionOnClick
                        sx={{
                            border: 'none',
                            fontFamily: 'Poppins',
                            fontSize: '0.95rem',
                            '& .MuiDataGrid-columnHeaders': {
                                bgcolor: '#F8FAFC',
                                color: '#64748B',
                                fontWeight: 600,
                                borderBottom: '1px solid #E2E8F0'
                            },
                            '& .MuiDataGrid-cell': {
                                borderBottom: '1px solid #F1F5F9',
                                display: 'flex',
                                alignItems: 'center'
                            },
                            '& .MuiDataGrid-row:hover': {
                                bgcolor: '#F8FAFC'
                            },
                            '& .MuiDataGrid-footerContainer': {
                                borderTop: 'none'
                            }
                        }}
                    />
                </Box>
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
                <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: '12px' }}>{snackbar.message}</Alert>
            </Snackbar>

        </Dialog>
    );
}
