import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Button, TextField, Grid, Paper, IconButton, Stack, Chip, Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress, Tooltip, Alert } from '@mui/material';
import { QrCode as QrCodeIcon, Download as DownloadIcon, Print as PrintIcon, ListAlt as ListAltIcon, Add as AddIcon, Edit as EditIcon, SimCardDownload as SimCardDownloadIcon } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import QRCode from 'qrcode';
import ExcelJS from 'exceljs';

import { getCcAsistenciaEventos, cargarInscriptosMasivos } from '../../services/cc_asistencia.service.js';
import ModalCrearCcEvento from './ModalCrearCcEvento.jsx';
import ModalListaCcParticipantes from './ModalListaCcParticipantes.jsx';

export default function CcAsistenciasMain() {
  const [eventos, setEventos] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [loadingEventos, setLoadingEventos] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEventoToEdit, setSelectedEventoToEdit] = useState(null);

  const [showParticipantsList, setShowParticipantsList] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [inscriptosLista, setInscriptosLista] = useState([]);

  // QR
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [statusMessage, setStatusMessage] = useState('Sistema listo');

  // Import
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  const fetchEventos = async () => {
    setLoadingEventos(true);
    try {
      const data = await getCcAsistenciaEventos();
      setEventos(data);
    } catch(err) {
      console.error(err);
    } finally {
      setLoadingEventos(false);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  const handleCreateOrEdit = (evento = null) => {
    setSelectedEventoToEdit(evento);
    setShowCreateModal(true);
  };

  const generateQR = async (evento) => {
    setSelectedEvento(evento);
    setShowQRModal(true);
    setQrCode('');
    setStatusMessage('Generando código QR...');
    try {
      const origin = window.location.origin;
      const qrString = `${origin}/cc-asistencias/registrar/${evento.id}`;
      const qrDataURL = await QRCode.toDataURL(qrString, { width: 300, margin: 2, color: { dark: '#000000', light: '#FFFFFF' }});
      setQrCode(qrDataURL);
      setStatusMessage(`QR generado para evento #${evento.id}`);
    } catch (error) {
      setStatusMessage('Error al generar el código QR');
    }
  };

  const handleViewParticipants = async (evento) => {
      setSelectedEvento(evento);
      // Wait for it to open, ModalListaCcParticipantes will handle fetching or we fetch here...
      // The instructions say use strategies from ModalListaParticipantesPorEvento...
      // Wait, we need to fetch them inside or outside? Our new endpoint `getInscriptosByEvento` is ready.
      // We pass the empty array and let the inner modal fetch it, wait no, we pass it as a prop?
      // Actually, passing `inscriptos` as prop is not necessary if we can fetch within, but since the component uses `inscriptos` var, let's fetch it here.
      try {
          const { getInscriptosByEvento } = await import('../../services/cc_asistencia.service.js');
          const data = await getInscriptosByEvento(evento.id);
          setInscriptosLista(data);
          setShowParticipantsList(true);
      } catch(err) {
          console.error("Error", err);
      }
  };

  const onDataChange = () => {
      if(selectedEvento) handleViewParticipants(selectedEvento);
      fetchEventos(); // Refresh list to update counts
  };

  // EXCEL EXPORT
  const handleDownloadExcel = async (evento) => {
      try {
          const { getInscriptosByEvento } = await import('../../services/cc_asistencia.service.js');
          const particips = await getInscriptosByEvento(evento.id);

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

          particips.forEach(p => {
              worksheet.addRow({
                  cuil: p.cuil,
                  nombre: p.nombre,
                  apellido: p.apellido,
                  correo: p.correo || 'N/A',
                  nota: p.nota,
                  estado_asistencia: p.estado_asistencia === 1 ? 'Presente' : 'Ausente'
              });
          });

          const buffer = await workbook.xlsx.writeBuffer();
          const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Asistentes_Evento_${evento.id}.xlsx`;
          link.click();
      } catch (err) {
          console.error('Error Excel download:', err);
      }
  };

  // EXCEL IMPORT - TEMPLATE
  const downloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Plantilla Carga Masiva');
    worksheet.columns = [
        { header: 'CUIL (Sin Guiones)', key: 'cuil', width: 25 },
        { header: 'ID Evento', key: 'evento_id', width: 15 },
        { header: 'Estado Asistencia (0=Ausente, 1=Presente)', key: 'estado_asistencia', width: 40 },
    ];
    // Example
    worksheet.addRow({ cuil: '20123456789', evento_id: '1', estado_asistencia: '0' });
    
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Plantilla_Carga_Masiva_CC.xlsx`;
    link.click();
  };

  const handleUploadFile = async () => {
      if(!selectedFile) {
          setUploadMessage("Seleccione un archivo");
          return;
      }
      setIsUploading(true);
      setUploadMessage('Procesando archivo...');
      
      const inscriptosParseados = [];
      const participantsToUpsert = [];
      
      try {
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(selectedFile);
          const worksheet = workbook.worksheets[0];
          
          worksheet.eachRow((row, index) => {
              if (index > 1) { // Skip header
                  const cuilRaw = row.getCell(1).value;
                  const cuilStr = cuilRaw ? String(cuilRaw).trim() : null;
                  const evento_id = row.getCell(2).value;
                  const estado_asistencia = row.getCell(3).value || 0;
                  
                  if(cuilStr && cuilStr.length === 11 && evento_id) {
                      inscriptosParseados.push({
                          cuil: cuilStr,
                          evento_id: parseInt(evento_id),
                          estado_asistencia: parseInt(estado_asistencia)
                      });
                      participantsToUpsert.push({
                         cuil: cuilStr,
                         nombre: 'Generico',
                         apellido: 'Generico',
                         correo: '',
                         es_empleado: 0,
                         reparticion: 'Ciudadano'
                      });
                  }
              }
          });
          
          if(inscriptosParseados.length === 0) throw new Error("Archivo inválido o sin inscriptos válidos.");
          
          const { upsertParticipantesMasivos, cargarInscriptosMasivos } = await import('../../services/cc_asistencia.service.js');
          await upsertParticipantesMasivos({ participantes: participantsToUpsert });
          await cargarInscriptosMasivos({ inscriptos: inscriptosParseados });
          
          setUploadMessage('✅ Archivo procesado exitosamente.');
          await fetchEventos();
          setTimeout(() => {
              setShowImportModal(false);
              setSelectedFile(null);
              setUploadMessage('');
          }, 1500);
          
      } catch(err) {
         setUploadMessage(`❌ Error: ${err.message}`);
      } finally {
         setIsUploading(false);
      }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'curso', headerName: 'Curso', width: 250, valueGetter: (val, row) => row.curso ? `[${row.curso_cod}] ${row.curso.nombre}` : row.curso_cod },
    { field: 'fecha', headerName: 'Fecha', width: 120 },
    { field: 'horario', headerName: 'Horario', width: 150 },
    { field: 'docente', headerName: 'Docente', width: 200 },
    { field: 'cupo', headerName: 'Cupo', width: 100 },
    { field: 'cantidad_inscriptos', headerName: 'Inscriptos', width: 100 },
    { field: 'cantidad_asistidos', headerName: 'Asistidos', width: 100 },
    { field: 'acciones', headerName: 'Acciones', width: 350, sortable: false, renderCell: (params) => (
      <Stack direction="row" spacing={1}>
        <Tooltip title="Generar QR">
          <IconButton onClick={() => generateQR(params.row)} color="secondary" size="small"><QrCodeIcon /></IconButton>
        </Tooltip>
        <Tooltip title="Ver Participantes">
          <IconButton onClick={() => handleViewParticipants(params.row)} color="info" size="small"><ListAltIcon /></IconButton>
        </Tooltip>
        <Tooltip title="Editar Evento">
          <IconButton onClick={() => handleCreateOrEdit(params.row)} color="warning" size="small"><EditIcon /></IconButton>
        </Tooltip>
        <Tooltip title="Descargar Lista">
          <IconButton onClick={() => handleDownloadExcel(params.row)} color="success" size="small"><DownloadIcon /></IconButton>
        </Tooltip>
      </Stack>
    )}
  ];

  const filteredEventos = eventos.filter(e => {
        const lower = filterText.toLowerCase();
        return (
            (e.curso && e.curso.nombre.toLowerCase().includes(lower)) ||
            (e.curso_cod && e.curso_cod.toLowerCase().includes(lower)) ||
            (e.docente && e.docente.toLowerCase().includes(lower))
        );
  });

  return (
    <Box sx={{ p: 0 }}>
      {/* HEADER SECTION */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" color="primary.main" gutterBottom>
             Asistencia Eventos (CC)
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Gestión y asistencia a eventos de la tabla CC_Asistencia_Eventos
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" color="primary" startIcon={<SimCardDownloadIcon />} onClick={() => setShowImportModal(true)}>
            Importar Carga Masiva
          </Button>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleCreateOrEdit(null)}>
            Crear Evento
          </Button>
        </Stack>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4, overflow: 'visible' }}>
        <CardContent sx={{ p: 4 }}>
             <Box sx={{ mb: 3 }}>
                <TextField
                    label="Filtrar por curso, cod o docente"
                    variant="outlined"
                    size="small"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    sx={{ minWidth: 350 }}
                />
            </Box>
            <Box sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={filteredEventos}
                    columns={columns}
                    localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                    loading={loadingEventos}
                    disableSelectionOnClick
                />
            </Box>
        </CardContent>
      </Card>

      {/* IMPORT EXCEL MODAL */}
      <Dialog open={showImportModal} onClose={() => !isUploading && setShowImportModal(false)}>
        <DialogTitle>Suba Masiva de Inscriptos CC</DialogTitle>
        <DialogContent dividers>
            <Typography variant="body2" color="text.secondary" paragraph>
                1. Descargue la plantilla de inscriptos.<br/>
                2. Complete con los CUIL, IDs de evento, y Estado (0 o 1).<br/>
                3. Suba el archivo aquí para procesarlo.
            </Typography>
            <Button variant="text" onClick={downloadTemplate} startIcon={<DownloadIcon />} sx={{ mb: 2 }}>Descargar Plantilla Excel</Button>
            <TextField
                type="file"
                fullWidth
                InputLabelProps={{ shrink: true }}
                onChange={(e) => {
                    if (e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                        setUploadMessage('');
                    }
                }}
                disabled={isUploading}
            />
            {isUploading && <LinearProgress sx={{ mt: 2 }} />}
            {uploadMessage && <Alert severity={uploadMessage.includes('❌') ? 'error' : 'info'} sx={{ mt: 2 }}>{uploadMessage}</Alert>}
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setShowImportModal(false)} disabled={isUploading}>Cancelar</Button>
            <Button onClick={handleUploadFile} variant="contained" disabled={isUploading || !selectedFile}>Subir Archivo</Button>
        </DialogActions>
      </Dialog>
      
      {/* QR MODAL */}
      <Dialog open={showQRModal} onClose={() => setShowQRModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle>QR de Asistencia</DialogTitle>
          <DialogContent dividers sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle1" fontWeight="bold">{selectedEvento?.curso?.nombre} (ID: {selectedEvento?.id})</Typography>
              {qrCode ? (
                  <Box mt={2}>
                      <img src={qrCode} alt="QR Code" style={{ maxWidth: 300 }} />
                  </Box>
              ) : (
                  <Typography color="text.secondary" mt={2}>{statusMessage}</Typography>
              )}
          </DialogContent>
          <DialogActions>
              <Button onClick={() => setShowQRModal(false)}>Cerrar</Button>
          </DialogActions>
      </Dialog>
      
      {/* OTHER MODALS */}
      {showCreateModal && (
          <ModalCrearCcEvento 
              open={showCreateModal} 
              onClose={() => setShowCreateModal(false)} 
              initialData={selectedEventoToEdit}
              onSuccess={(msg) => {
                  fetchEventos(); 
                  // You could have a snackbar here...
              }}
          />
      )}

      {showParticipantsList && selectedEvento && (
        <ModalListaCcParticipantes 
            open={showParticipantsList}
            onClose={() => setShowParticipantsList(false)}
            inscriptos={inscriptosLista}
            nombreCurso={selectedEvento.curso?.nombre}
            idEvento={selectedEvento.id}
            onDataChange={onDataChange}
        />
      )}

    </Box>
  );
}
