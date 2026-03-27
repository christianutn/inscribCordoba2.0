import React, { useEffect, useState } from 'react';
import { Container, Box, Card, CardContent, Typography, Button, TextField, Grid, Paper, IconButton, Stack, Chip, Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress, CircularProgress, Tooltip, Alert, MenuItem, useTheme, useMediaQuery, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import {
  QrCode as QrCodeIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  ListAlt as ListAltIcon,
  Add as AddIcon,
  Edit as EditIcon,
  SimCardDownload as SimCardDownloadIcon,
  Search as SearchIcon,
  HelpOutline as HelpOutlineIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  FileDownload as FileDownloadIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import QRCode from 'qrcode';
import ExcelJS from 'exceljs';

import { useAuth } from '../../context/AuthContext';
import { getCcAsistenciaEventos, cargarInscriptosMasivos } from '../../services/cc_asistencia.service.js';
import ModalCrearCcEvento from './ModalCrearCcEvento.jsx';
import ModalListaCcParticipantes from './ModalListaCcParticipantes.jsx';

export default function CcAsistenciasMain() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const currentYear = new Date().getFullYear().toString();
  const [yearFilter, setYearFilter] = useState(currentYear);
  const [monthFilter, setMonthFilter] = useState('all');

  const normalizeText = (t) => t ? t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';

  const handleClearFilters = () => {
    setFilterText('');
    setFechaDesde('');
    setFechaHasta('');
    setYearFilter(currentYear);
    setMonthFilter('all');
  };
  const [loadingEventos, setLoadingEventos] = useState(true);

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const partes = fecha.split('-');
    if (partes.length === 3) return `${partes[2]}-${partes[1]}-${partes[0]}`;
    return fecha;
  };

  const formatearHorario = (texto) => {
    if (!texto) return '';
    let procesado = texto.toLowerCase();
    procesado = procesado.replace(/\bhs?\.?\b/g, '').trim();
    procesado = procesado.replace(/\b(\d{1,2})(?::(\d{2}))?\b/g, (match, hora, min) => {
      const h = hora.padStart(2, '0');
      const m = min || '00';
      return `${h}:${m}`;
    });
    procesado = procesado.replace(/\s+/g, ' ').trim();
    return procesado ? `${procesado}` : '';
  };

  const availableYears = [...new Set(eventos.map(e => parseInt(e.fecha?.split('-')[0])).filter(y => !isNaN(y)))].sort((a, b) => a - b);
  const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

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

  // Help
  const [showHelpModal, setShowHelpModal] = useState(false);

  const fetchEventos = async () => {
    setLoadingEventos(true);
    try {
      const data = await getCcAsistenciaEventos();
      setEventos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEventos(false);
    }
  };

  useEffect(() => {
    fetchEventos();
    const interval = setInterval(() => {
      getCcAsistenciaEventos().then(data => {
        setEventos(data);
      }).catch(err => console.error(err));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateOrEdit = (evento = null) => {
    setSelectedEventoToEdit(evento);
    setShowCreateModal(true);
  };

  const generateQR = async (evento) => {
    setSelectedEvento(evento);
    setShowQRModal(true);
    setQrCode('');
    try {
      const origin = window.location.origin;
      const qrString = `${origin}/cc-asistencias/registrar/${evento.id}`;
      const qrDataURL = await QRCode.toDataURL(qrString, { width: 300, margin: 2, color: { dark: '#000000', light: '#FFFFFF' } });
      setQrCode(qrDataURL);
    } catch (error) {
      setStatusMessage('Error al generar el código QR');
    }
  };

  const handleViewParticipants = async (evento) => {
    setSelectedEvento(evento);
    try {
      const { getInscriptosByEvento } = await import('../../services/cc_asistencia.service.js');
      const data = await getInscriptosByEvento(evento.id);
      setInscriptosLista(data);
      setShowParticipantsList(true);
    } catch (err) {
      console.error("Error", err);
    }
  };

  const onDataChange = () => {
    if (selectedEvento) handleViewParticipants(selectedEvento);
    fetchEventos(); // Refresh list to update counts
  };

  const handlePrintQR = () => {
    if (!qrCode || !selectedEvento) return;

    const printWindow = window.open('', '_blank');
    const cursoNombre = selectedEvento.curso?.nombre || 'Curso';
    const fecha = formatearFecha(selectedEvento.fecha);
    const horario = formatearHorario(selectedEvento.horario);

    const htmlContent = `
      <html>
        <head>
          <title>Imprimir QR - ${cursoNombre}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
            body { 
              font-family: 'Poppins', sans-serif; 
              text-align: center; 
              margin: 0;
              padding: 0;
              height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              background-color: white;
            }
            .container {
              width: 80%;
              max-width: 800px;
            }
            h1 {
              font-size: 42px;
              font-weight: 700;
              margin-bottom: 10px;
              color: #1A1A1A;
            }
            .info {
              font-size: 24px;
              font-weight: 600;
              color: #636465;
              margin-bottom: 40px;
            }
            .qr-box {
              margin: 20px 0;
            }
            .qr-box img {
              width: 450px;
              height: auto;
            }
            .instruction {
              font-size: 18px;
              color: #64748B;
              margin-top: 40px;
              font-weight: 500;
            }
            @media print {
              body { height: 100%; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${cursoNombre}</h1>
            <div class="info">
              📅 ${fecha} — 🕒 ${horario}
            </div>
            <div class="qr-box">
              <img src="${qrCode}" alt="Código QR" />
            </div>
            <div class="instruction">
              Escaneá este código con tu celular para registrar tu asistencia.
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Import
  const handleDownloadTableExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Eventos CC');

      worksheet.columns = [
        { header: 'Curso', key: 'curso', width: 40 },
        { header: 'Fecha', key: 'fecha', width: 15 },
        { header: 'Horario', key: 'horario', width: 15 },
        { header: 'Docente', key: 'docente', width: 25 },
        { header: 'Inscriptos', key: 'inscriptos', width: 12 },
        { header: 'Presentes', key: 'asistidos', width: 12 }
      ];

      filteredEventos.forEach(e => {
        worksheet.addRow({
          curso: e.curso?.nombre || e.curso_nombre,
          fecha: formatearFecha(e.fecha),
          horario: formatearHorario(e.horario),
          docente: e.docente,
          inscriptos: e.cantidad_inscriptos,
          asistidos: e.cantidad_asistidos
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Eventos_Asistencia.xlsx`;
      link.click();
    } catch (err) {
      console.error(err);
    }
  };

  // EXCEL IMPORT - TEMPLATE
  const downloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Plantilla Carga Masiva');
    worksheet.columns = [
      { header: 'CUIL (Sin Guiones)', key: 'cuil', width: 25 }
    ];


    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Plantilla_Carga_Masiva.xlsx`;
    link.click();
  };

  const handleUploadFile = async () => {
    if (!selectedFile) {
      setUploadMessage("Seleccione un archivo");
      return;
    }
    if (!selectedEvento) {
      setUploadMessage("No hay un evento seleccionado");
      return;
    }
    setIsUploading(true);
    setUploadMessage('Procesando archivo...');

    const inscriptosParseados = [];

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(selectedFile);
      const worksheet = workbook.worksheets[0];

      worksheet.eachRow((row, index) => {
        if (index > 1) { // Skip header
          const cuilRaw = row.getCell(1).value;
          const cuilStr = cuilRaw ? String(cuilRaw).trim() : null;

          if (cuilStr && cuilStr.length === 11) {
            inscriptosParseados.push({
              cuil: cuilStr,
              evento_id: parseInt(selectedEvento.id),
              estado_asistencia: 0 // Asistencia por defecto Ausente (0)
            });
          }
        }
      });

      if (inscriptosParseados.length === 0) throw new Error("Archivo inválido o sin inscriptos válidos. Verifique que estén los CUIL(11 dígitos).");

      const { cargarInscriptosMasivos } = await import('../../services/cc_asistencia.service.js');
      await cargarInscriptosMasivos({ inscriptos: inscriptosParseados });

      setUploadMessage('✅ Archivo procesado exitosamente.');
      await fetchEventos();
      setTimeout(() => {
        setShowImportModal(false);
        setSelectedFile(null);
        setUploadMessage('');
      }, 1500);

    } catch (err) {
      setUploadMessage(`❌ Error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const columns = [
    { field: 'curso', headerName: 'Curso', flex: 1.5, minWidth: 250, valueGetter: (val, row) => row.curso ? `${row.curso.nombre}` : row.curso_nombre },
    { field: 'fecha', headerName: 'Fecha', flex: 0.8, minWidth: 120, valueFormatter: (value) => formatearFecha(value) },
    { field: 'horario', headerName: 'Horario', flex: 1, minWidth: 150, valueFormatter: (value) => formatearHorario(value) },
    { field: 'docente', headerName: 'Docente', flex: 1.2, minWidth: 200 },
    { field: 'cantidad_inscriptos', headerName: 'Inscriptos', flex: 0.6, minWidth: 100 },
    { field: 'cantidad_asistidos', headerName: 'Presentes', flex: 0.6, minWidth: 100 },
    {
      field: 'acciones', headerName: 'Acciones', flex: 1.5, minWidth: 320, sortable: false, renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Generar QR" slotProps={{ tooltip: { sx: { fontFamily: 'Poppins' } } }}>
            <IconButton aria-label="Generar QR" onClick={() => generateQR(params.row)} sx={{ color: 'primary.main' }} size="small"><QrCodeIcon /></IconButton>
          </Tooltip>
          <Tooltip title="Ver Participantes" slotProps={{ tooltip: { sx: { fontFamily: 'Poppins' } } }}>
            <IconButton aria-label="Ver Participantes" onClick={() => handleViewParticipants(params.row)} sx={{ color: 'primary.main' }} size="small"><ListAltIcon /></IconButton>
          </Tooltip>
          <Tooltip title="Importar Inscriptos" slotProps={{ tooltip: { sx: { fontFamily: 'Poppins' } } }}>
            <IconButton aria-label="Importar Inscriptos" onClick={() => { setSelectedEvento(params.row); setShowImportModal(true); }} sx={{ color: 'primary.main' }} size="small"><SimCardDownloadIcon /></IconButton>
          </Tooltip>
          <Tooltip title="Editar Evento" slotProps={{ tooltip: { sx: { fontFamily: 'Poppins' } } }}>
            <IconButton aria-label="Editar Evento" onClick={() => handleCreateOrEdit(params.row)} sx={{ color: 'primary.main' }} size="small"><EditIcon /></IconButton>
          </Tooltip>

        </Stack>
      )
    }
  ];

  const filteredEventos = eventos.filter(e => {
    const lower = normalizeText(filterText);
    const matchesText = (
      (e.curso && normalizeText(e.curso.nombre).includes(lower)) ||
      (e.curso_cod && normalizeText(e.curso_cod).includes(lower)) ||
      (e.docente && normalizeText(e.docente).includes(lower))
    );

    const matchesDesde = fechaDesde ? e.fecha >= fechaDesde : true;
    const matchesHasta = fechaHasta ? e.fecha <= fechaHasta : true;

    const [eYear, eMonth] = e.fecha ? e.fecha.split('-') : [];
    const matchesYear = yearFilter !== 'all' ? eYear === yearFilter : true;
    const matchesMonth = monthFilter !== 'all' ? eMonth === monthFilter : true;

    const matchesRole = (user?.rol === 'REF' && user?.area) ? (e.curso?.area === user.area) : true;

    return matchesText && matchesDesde && matchesHasta && matchesYear && matchesMonth && matchesRole;
  });

  return (
    <Container maxWidth={false} sx={{ py: 4, fontFamily: 'Poppins' }}>
      {/* HEADER SECTION */}
      <Box sx={{
        mb: 4,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', md: 'center' },
        gap: 3
      }}>
        <Box sx={{ flex: '1 1 300px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant={isMobile ? "h5" : "h4"} component="h1" sx={{ fontFamily: 'Geogrotesque Sharp', fontWeight: 'bold', color: '#1A1A1A', mb: 1 }}>
              Registro de Asistencia
            </Typography>
            <Tooltip title="Guía de uso">
              <IconButton onClick={() => setShowHelpModal(true)} sx={{ color: 'primary.main' }} size="small">
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Typography variant={isMobile ? "body2" : "subtitle1"} sx={{ color: '#5C6F82', fontFamily: 'Poppins' }}>
            Administre sus cursos presenciales, genere códigos QR y controle el presentismo de forma centralizada.
          </Typography>
        </Box>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            flexWrap: 'wrap',
            gap: 0,
            ml: { xs: 0, sm: 'auto' },
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'flex-start', sm: 'flex-end' }
          }}
        >
          <Button
            variant="outlined"
            color="primary"
            onClick={handleDownloadTableExcel}
            startIcon={<DownloadIcon />}
            sx={{
              fontFamily: 'Geogrotesque Sharp',
              borderRadius: '8px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              px: { xs: 1.5, md: 2 }
            }}
          >
            {isMobile ? 'EXPORTAR' : 'EXPORTAR LISTA DE CURSOS'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleCreateOrEdit()}
            startIcon={<AddIcon />}
            sx={{
              fontFamily: 'Geogrotesque Sharp',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,123,255,0.2)',
              px: { xs: 1.5, md: 2 }
            }}
          >
            {isMobile ? 'CREAR' : 'CREAR NUEVO EVENTO'}
          </Button>
        </Stack>
      </Box>

      {/* FILTERS CARD */}
      <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '16px', mb: 3, overflow: 'visible' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder="Buscar por curso o docente..."
              size="small"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              sx={{ flexGrow: 1, minWidth: 250, bgcolor: '#fff', borderRadius: 1 }}
              InputProps={{ startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} /> }}
            />
            <TextField select label="Año" size="small" value={yearFilter} onChange={e => setYearFilter(e.target.value)} sx={{ bgcolor: '#fff', minWidth: 100, borderRadius: 1 }}>
              <MenuItem value="all"><em>Todos</em></MenuItem>
              {availableYears.map(y => <MenuItem key={y} value={y.toString()}>{y}</MenuItem>)}
            </TextField>
            <TextField select label="Mes" size="small" value={monthFilter} onChange={e => setMonthFilter(e.target.value)} sx={{ bgcolor: '#fff', minWidth: 130, borderRadius: 1 }}>
              <MenuItem value="all"><em>Todos</em></MenuItem>
              {MONTH_NAMES.map((m, i) => <MenuItem key={i} value={(i + 1).toString().padStart(2, '0')}>{m}</MenuItem>)}
            </TextField>
            <TextField
              label="Fecha Desde"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              size="small"
              sx={{ bgcolor: '#fff', borderRadius: 1 }}
            />
            <TextField
              label="Fecha Hasta"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              size="small"
              sx={{ bgcolor: '#fff', borderRadius: 1 }}
            />
            <Button
              variant="text"
              onClick={handleClearFilters}
              disabled={
                !filterText &&
                !fechaDesde &&
                !fechaHasta &&
                yearFilter === currentYear &&
                monthFilter === 'all'
              }
              sx={{ fontFamily: 'Poppins', color: 'text.secondary', fontWeight: 'bold' }}
            >
              Limpiar
            </Button>
          </Box>
          <Divider sx={{ my: 3, opacity: 0.6 }} />
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <Box sx={{ height: 600, minWidth: 800 }}>
              <DataGrid
                rows={filteredEventos}
                columns={columns}
                localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                initialState={{ sorting: { sortModel: [{ field: 'fecha', sort: 'asc' }] } }}
                loading={loadingEventos}
                disableSelectionOnClick
                sx={{
                  fontFamily: 'Poppins',
                  fontSize: { xs: '0.85rem', md: '1rem' },
                  '& .MuiDataGrid-columnHeaders': { bgcolor: '#F8F9FA', color: '#3A4756', fontWeight: 600, fontFamily: 'Geogrotesque Sharp', fontSize: { xs: '0.9rem', md: '1.05rem' } },
                  '& .MuiDataGrid-cell': { py: 1.5, display: 'flex', alignItems: 'center', fontFamily: 'Poppins' },
                  '& .MuiDataGrid-row': { transition: 'background-color 0.2s', '&:hover': { bgcolor: 'rgba(0,123,255,0.04)' } }
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* IMPORT EXCEL MODAL */}
      <Dialog
        open={showImportModal}
        onClose={() => !isUploading && setShowImportModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', boxShadow: '0 12px 48px rgba(0,0,0,0.12)' } }}
      >
        <DialogTitle sx={{ fontFamily: 'Geogrotesque Sharp', fontWeight: 'bold', fontSize: '1.5rem', py: 3 }}>
          Suba Masiva de Inscriptos
        </DialogTitle>
        <DialogContent dividers sx={{ py: 3 }}>
          {selectedEvento && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(0,123,255,0.05)', borderRadius: '12px', border: '1px solid rgba(0,123,255,0.1)' }}>
              <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', color: 'primary.main', fontWeight: 600, mb: 0.5, letterSpacing: 0.5 }}>
                CURSO SELECCIONADO:
              </Typography>
              <Typography variant="h6" sx={{ fontFamily: 'Geogrotesque Sharp', fontWeight: 'bold', color: '#1A1A1A' }}>
                {selectedEvento.curso?.nombre}
              </Typography>
            </Box>
          )}

          <Typography variant="body1" sx={{ fontFamily: 'Poppins', color: '#334155', fontWeight: 500, mb: 2 }}>
            Siga estos pasos para realizar la carga:
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ fontFamily: 'Poppins', color: '#475569', mb: 1.5, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <span style={{ color: '#007BFF', fontWeight: 'bold' }}>1.</span>
              <span>Descargue la <strong>plantilla oficial</strong> de inscriptos.</span>
            </Typography>
            <Button
              variant="outlined"
              onClick={downloadTemplate}
              startIcon={<DownloadIcon />}
              sx={{
                fontFamily: 'Geogrotesque Sharp',
                borderRadius: '10px',
                mb: 3,
                fontWeight: 'bold',
                textTransform: 'none',
                px: 3
              }}
            >
              Descargar Plantilla Excel
            </Button>

            <Typography variant="body1" sx={{ fontFamily: 'Poppins', color: '#475569', mb: 1.5, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <span style={{ color: '#007BFF', fontWeight: 'bold' }}>2.</span>
              <span>Complete la columna <strong>CUIL</strong> (11 dígitos, sin guiones).</span>
            </Typography>

            <Typography variant="body1" sx={{ fontFamily: 'Poppins', color: '#475569', mb: 3, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <span style={{ color: '#007BFF', fontWeight: 'bold' }}>3.</span>
              <span>Suba el archivo aquí para registrar la asistencia.</span>
            </Typography>
          </Box>

          <Box sx={{ border: '2px dashed #E2E8F0', p: 3, borderRadius: '16px', bgcolor: '#F8FAFC', textAlign: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', color: '#64748B', mb: 2, fontWeight: 600 }}>
              SELECCIONE EL ARCHIVO EXCEL (.xlsx)
            </Typography>
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
              sx={{
                bgcolor: '#fff',
                borderRadius: '10px',
                '& .MuiOutlinedInput-root': { borderRadius: '10px' }
              }}
            />
          </Box>

          {isUploading && <LinearProgress sx={{ mt: 3, borderRadius: '5px', height: '6px' }} />}
          {uploadMessage && <Alert severity={uploadMessage.includes('❌') ? 'error' : 'success'} sx={{ mt: 3, borderRadius: '12px', fontFamily: 'Poppins', fontWeight: 500 }}>{uploadMessage}</Alert>}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={() => setShowImportModal(false)}
            disabled={isUploading}
            sx={{ fontFamily: 'Geogrotesque Sharp', fontWeight: 'bold', color: '#64748B', px: 3 }}
          >
            CANCELAR
          </Button>
          <Button
            onClick={handleUploadFile}
            variant="contained"
            disabled={isUploading || !selectedFile}
            sx={{
              fontFamily: 'Geogrotesque Sharp',
              fontWeight: 'bold',
              borderRadius: '10px',
              px: 4,
              boxShadow: '0 4px 12px rgba(0,123,255,0.2)'
            }}
          >
            {isUploading ? 'SUBIENDO...' : 'SUBIR ARCHIVO'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR MODAL */}
      <Dialog
        open={showQRModal}
        onClose={() => setShowQRModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            '@media print': {
              position: 'absolute !important',
              left: '0 !important',
              top: '0 !important',
              margin: '0 !important',
              width: '100% !important',
              height: '100% !important',
              boxShadow: 'none !important',
              border: 'none !important',
              display: 'flex !important',
              alignItems: 'center !important',
              justifyContent: 'center !important',
              visibility: 'visible !important',
              zIndex: 9999
            }
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Geogrotesque Sharp', fontWeight: 'bold', '@media print': { display: 'none' } }}>
          Código QR de Asistencia
        </DialogTitle>
        <DialogContent dividers sx={{
          '@media print': {
            border: 'none !important',
            p: '0 !important',
            m: '0 !important',
            display: 'flex !important',
            flexDirection: 'column !important',
            alignItems: 'center !important',
            justifyContent: 'center !important',
            height: 'auto !important',
            width: '100% !important'
          }
        }}>
          <Box sx={{
            textAlign: 'center',
            py: 2,
            '@media print': {
              width: '100% !important',
              display: 'flex !important',
              flexDirection: 'column !important',
              alignItems: 'center !important',
              justifyContent: 'center !important'
            }
          }}>
            <Typography variant="h4" sx={{ mb: 1, fontFamily: 'Geogrotesque Sharp', fontWeight: 'bold', color: '#1A1A1A', '@media print': { fontSize: '2.5rem !important' } }}>
              {selectedEvento?.curso?.nombre}
            </Typography>

            {/* Fecha y Horario solicitados */}
            <Typography variant="h6" sx={{ mb: 3, fontFamily: 'Poppins', color: '#636465', fontWeight: 600, '@media print': { fontSize: '1.5rem !important', color: '#000 !important' } }}>
              📅 {formatearFecha(selectedEvento?.fecha)} — 🕒 {formatearHorario(selectedEvento?.horario)}
            </Typography>

            <Box sx={{
              border: '1px solid #E2E8F0',
              p: 3,
              display: 'inline-block',
              borderRadius: '16px',
              bgcolor: '#fff',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              '@media print': { border: 'none !important', boxShadow: 'none !important', p: '0 !important', mt: '20px !important' }
            }}>
              {qrCode ? (
                <img
                  src={qrCode}
                  alt="QR Attendance"
                  style={{ width: '100%', maxWidth: '450px' }}
                />
              ) : (
                <CircularProgress />
              )}
            </Box>

            <Typography variant="body1" sx={{ mt: 3, color: '#64748B', fontFamily: 'Poppins', maxWidth: '300px', mx: 'auto' }}>
              Escaneá este código con tu celular para registrar tu asistencia.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowQRModal(false)} sx={{ fontFamily: 'Geogrotesque Sharp', fontWeight: 'bold' }}>CERRAR</Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrintQR}
            sx={{ fontFamily: 'Geogrotesque Sharp', fontWeight: 'bold', borderRadius: '8px' }}
          >
            IMPRIMIR QR
          </Button>
        </DialogActions>
      </Dialog>

      {/* HELP MODAL / CENTRO DE AYUDA */}
      <Dialog
        open={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', boxShadow: '0 12px 48px rgba(0,0,0,0.15)' } }}
      >
        <DialogTitle sx={{ m: 0, p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#F8FAFC' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <HelpOutlineIcon color="primary" sx={{ fontSize: '2rem' }} />
            <Typography variant="h5" sx={{ fontFamily: 'Geogrotesque Sharp', fontWeight: 'bold', color: '#1A1A1A' }}>
              Guía rápida de Registro de Asistencia
            </Typography>
          </Box>
          <IconButton onClick={() => setShowHelpModal(false)} sx={{ color: '#94A3B8' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <Box sx={{ p: 4 }}>
            <Typography variant="body1" sx={{ fontFamily: 'Poppins', color: '#334155', mb: 4, fontSize: '1.1rem' }}>
              Bienvenido al Centro de Ayuda. Aquí encontrará los pasos clave para gestionar el presentismo de sus cursos de forma eficiente.
            </Typography>

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontFamily: 'Geogrotesque Sharp', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <AddIcon color="primary" /> 1. Crear un Nuevo Evento
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#64748B', ml: 4 }}>
                      Haga clic en <strong>"CREAR NUEVO EVENTO"</strong> arriba a la derecha. Complete el curso, la fecha, el horario y el docente. Esto habilitará el registro para ese día.
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle1" sx={{ fontFamily: 'Geogrotesque Sharp', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <QrCodeIcon color="primary" /> 2. Control vía Código QR
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#64748B', ml: 4 }}>
                      En la columna "Acciones", use el primer ícono para generar el QR. Los alumnos podrán escanearlo con sus celulares para registrar su asistencia en tiempo real.
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle1" sx={{ fontFamily: 'Geogrotesque Sharp', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <ListAltIcon color="primary" /> 3. Gestión de Participantes
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#64748B', ml: 4 }}>
                      Use el segundo ícono para ver la lista de alumnos. Desde allí puede editar notas, cambiar el estado de asistencia manualmente o agregar alumnos por CUIL.
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontFamily: 'Geogrotesque Sharp', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <SimCardDownloadIcon color="primary" /> 4. Carga Masiva (Importar)
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#64748B', ml: 4 }}>
                      Si tiene una lista de alumnos, descargue la plantilla Excel, pegue los CUILs y suba el archivo. El sistema traerá automáticamente los datos de CIDI.
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle1" sx={{ fontFamily: 'Geogrotesque Sharp', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <FileDownloadIcon color="primary" /> 5. Exportación
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Poppins', color: '#64748B', ml: 4 }}>
                      Puede exportar la tabla completa o las listas individuales de cada curso usando los botones de "EXPORTAR" distribuidos en el sistema.
                    </Typography>
                  </Box>

                  <Box sx={{ bgcolor: 'rgba(0,123,255,0.04)', p: 2, borderRadius: '12px', border: '1px solid rgba(0,123,255,0.1)' }}>
                    <Typography variant="subtitle2" sx={{ fontFamily: 'Poppins', color: 'primary.main', fontWeight: 'bold', mb: 0.5 }}>
                      TIP PRO:
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: 'Poppins', color: '#5C6F82' }}>
                      La lista se actualiza automáticamente cada 5 segundos. Verá los presentes en la columna "Presentes" a medida que los alumnos escaneen el código.
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#F8FAFC' }}>
          <Button
            onClick={() => setShowHelpModal(false)}
            variant="contained"
            fullWidth
            sx={{ fontFamily: 'Geogrotesque Sharp', fontWeight: 'bold', py: 1.5, borderRadius: '12px' }}
          >
            ENTENDIDO, ¡GRACIAS!
          </Button>
        </DialogActions>
      </Dialog>

      {showCreateModal && (
        <ModalCrearCcEvento
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          initialData={selectedEventoToEdit}
          onSuccess={(msg) => {
            fetchEventos();
          }}
        />
      )}

      {showParticipantsList && selectedEvento && (
        <ModalListaCcParticipantes
          open={showParticipantsList}
          onClose={() => setShowParticipantsList(false)}
          inscriptos={inscriptosLista}
          nombreCurso={selectedEvento.curso?.nombre}
          fechaEvento={selectedEvento.fecha}
          idEvento={selectedEvento.id}
          onDataChange={onDataChange}
        />
      )}

    </Container>
  );
}
