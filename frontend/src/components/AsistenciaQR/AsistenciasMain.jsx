import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Grid,
  Paper,
  Divider,
  IconButton,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  School as SchoolIcon,
  ListAlt,
  EventNoteIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import QRCode from 'qrcode';
import { postSubaMasiva, getlistadoEventos, getConsultarAsistencia, postConfirmarAsistencia, getListadosDeParticipantes } from '../../services/asistencias.service.js'
import ModalDatosParticipante from './ModalDatosParticipante.jsx';
import ModalListaParticipantesPorEvento from './ModalListaParticipantesPorEvento.jsx';

export default function AsistenciasMain() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [statusMessage, setStatusMessage] = useState('Sistema listo para generar códigos QR de asistencia');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  // Estados para registro manual de asistencia
  const [cuilAsistente, setCuilAsistente] = useState('');
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  const [attendanceMessage, setAttendanceMessage] = useState('');

  // Estado para modal de confirmación de asistencia
  const [participanteData, setParticipanteData] = useState(null);
  const [showModalDatos, setShowModalDatos] = useState(false);

  // Estados para importar planilla
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');


  // Estados para detalle del curso
  const [showCourseDetail, setShowCourseDetail] = useState(false);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState(null);
  const [eventos, setEventos] = useState([]);

  // Estados para lista de participantes
  const [showParticipantsList, setShowParticipantsList] = useState(false);
  const [participantesList, setParticipantesList] = useState([]);

  const fetchEventos = async () => {
    try {
      const response = await getlistadoEventos();
      setEventos(response);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
    }
  };

  useEffect(() => {
    fetchEventos().then(() => setActiveTab('eventos'));
  }, []);

  const handleRefreshData = async () => {
    await fetchEventos();
    // Also refresh participants list if a course is selected
    if (selectedCourseDetail) {
      handleViewParticipantsList(selectedCourseDetail);
    }
  };





  const generateQR = async () => {
    // Usamos el curso del detalle si está abierto, o el seleccionado en el dropdown
    const course = selectedCourseDetail || eventos.find(c => c.id === parseInt(selectedCourse));

    if (!course) {
      setStatusMessage('Por favor, selecciona un curso para generar el QR');
      return;
    }

    setIsGeneratingQR(true);
    setStatusMessage('Generando código QR...');

    try {
      // Generamos una URL directa al sistema de registro
      const origin = window.location.origin;
      const qrString = `${origin}/asistencia/registrar/${course.id}`;
      // const qrString = JSON.stringify(qrData); // Anterior implementation

      const qrDataURL = await QRCode.toDataURL(qrString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCode(qrDataURL);
      setStatusMessage(`QR generado para: ${course.curso?.nombre}`);
    } catch (error) {
      console.error('Error generando QR:', error);
      setStatusMessage('Error al generar el código QR');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const markAttendanceByCUIL = async () => {
    if (!selectedCourse) {
      setAttendanceMessage('Por favor, selecciona un curso primero');
      return;
    }

    if (!cuilAsistente || cuilAsistente.trim().length < 10) {
      setAttendanceMessage('Por favor, ingresa un CUIL válido (mínimo 10 dígitos)');
      return;
    }

    setIsMarkingAttendance(true);
    setAttendanceMessage('Consultando datos del asistente...'); // Feedback inicial

    try {
      // 1. Consultar datos del participante
      const data = await getConsultarAsistencia(cuilAsistente, selectedCourse);

      // 2. Si tiene éxito, guardar datos y abrir modal
      setParticipanteData(data);
      setShowModalDatos(true);
      setAttendanceMessage(''); // Limpiar mensaje si fue exitoso el fetch inicial

    } catch (error) {
      console.error('Error consultando asistente:', error);
      setAttendanceMessage(`❌ Error: ${error.message || 'No se pudo consultar el asistente.'}`);
    } finally {
      setIsMarkingAttendance(false);
    }
  };

  const handleConfirmAttendance = async (userData) => {
    setIsMarkingAttendance(true);
    setAttendanceMessage('Registrando asistencia...');
    setShowModalDatos(false); // Cerrar modal mientras se procesa la confirmación

    try {
      const response = await postConfirmarAsistencia(userData.cuil, selectedCourse);

      // Buscar el nombre del curso para el mensaje
      const course = eventos.find(c => c.id === parseInt(selectedCourse));
      const nombreCurso = course?.curso?.nombre || 'el curso';

      setAttendanceMessage(`Asistencia registrada exitosamente para ${userData.nombre} ${userData.apellido} en ${nombreCurso}`);
      setCuilAsistente(''); // Limpiar campo
      setParticipanteData(null);

      // Refresh data to show new enrolled participant or updated stats
      await handleRefreshData();

    } catch (error) {
      console.error('Error confirmando asistencia:', error);
      setAttendanceMessage(`❌ Error al registrar asistencia: ${error.message}`);
      // Opcional: Reabrir modal si falla? Por ahora dejamos el mensaje de error.
    } finally {
      setIsMarkingAttendance(false);
    }
  };

  const handleCloseModalDatos = () => {
    setShowModalDatos(false);
    setParticipanteData(null);
  };

  // Funciones para importar planilla
  const handleImportClick = () => {
    setShowImportModal(true)

    setSelectedFile(null);
    setUploadMessage('');

  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];

    if (file) {
      // Validar que sea un archivo Excel
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];

      if (validTypes.includes(file.type)) {
        setSelectedFile(file);
        setUploadMessage('');
      } else {
        setUploadMessage('Por favor, selecciona un archivo Excel válido (.xlsx o .xls)');
        setSelectedFile(null);
      }
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile) {
      setUploadMessage('Por favor, selecciona un archivo primero');
      return;
    }

    setIsUploading(true);
    setUploadMessage('Procesando archivo...');


    try {
      // Aquí iría la lógica para procesar el archivo Excel
      // Por ahora simulamos el proceso
      await postSubaMasiva(selectedFile)

      setUploadMessage('✅ Archivo procesado exitosamente.');
      await handleRefreshData();

      // Cerrar modal de importación
      setTimeout(() => {
        setShowImportModal(false);
        setSelectedFile(null);
        setUploadMessage('');
      }, 1500);

    } catch (error) {
      setUploadMessage('❌ Error al procesar el archivo. Verifica el formato e intenta nuevamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseModal = () => {
    if (!isUploading) {
      setShowImportModal(false);
      setSelectedFile(null);
      setUploadMessage('');
    }
  };




  // Funciones para detalle del curso
  const handleViewCourse = (course) => {
    setSelectedCourseDetail(course);
    setShowCourseDetail(true);
  };

  const handleViewParticipantsList = async (course) => {
    try {
      setSelectedCourseDetail(course);
      const participantes = await getListadosDeParticipantes(course.id);
      setParticipantesList(participantes);
      setShowParticipantsList(true);
    } catch (error) {
      console.error('Error al obtener participantes:', error);
      alert('Error al obtener la lista de participantes: ' + error.message);
    }
  };

  const handleCloseCourseDetail = () => {
    setShowCourseDetail(false);
    setSelectedCourseDetail(null);
  };

  const handleCloseParticipantsList = () => {
    setShowParticipantsList(false);
    setParticipantesList([]);
    setSelectedCourseDetail(null);
  };

  const downloadQR = () => {
    if (!qrCode) return;

    const link = document.createElement('a');
    link.href = qrCode;
    const course = selectedCourseDetail || eventos.find(c => c.id === parseInt(selectedCourse));
    if (course) {
      link.download = `QR_${(course.curso?.nombre || 'curso').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.png`;
      link.click();
    }
  };

  const printQR = () => {
    if (!qrCode) return;

    const printWindow = window.open('', '_blank');
    const course = selectedCourseDetail || eventos.find(c => c.id === parseInt(selectedCourse));

    if (!course) return;

    const htmlContent = `
      <html>
        <head>
          <title>QR - ${course.curso?.nombre}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 0;
              margin: 0;
              height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }
            .qr-container { 
              margin: 20px 0; 
              display: flex;
              justify-content: center;
            }
            .course-info { 
              margin: 20px 0; 
              font-size: 24px; 
            }
            .instructions { 
              margin-top: 30px; 
              font-size: 16px; 
              color: #666; 
            }
            h1 {
              font-size: 32px;
              margin-bottom: 20px;
            }
            @media print {
              body {
                height: 100%;
                justify-content: center;
              }
            }
          </style>
        </head>
        <body>
          <h1>Código QR de Asistencia</h1>
          <div class="course-info">
            <strong>${course.curso?.nombre}</strong><br>
            Fecha: ${course.fecha_desde}
          </div>
          <div class="qr-container">
            <img src="${qrCode}" alt="Código QR" style="max-width: 300px;" />
          </div>
          <div class="instructions">
            <p>Escaneá este código QR para registrar tu asistencia</p>
            <p>Generado el: ${new Date().toLocaleString()}</p>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
  };


  const rendereventos = () => (
    <Box sx={{ width: '100%' }}>
      {/* Header con título y botones */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
        backgroundColor: '#f8f9fa',
        p: 2,
        borderRadius: 1
      }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
          Gestión de Cursos
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleImportClick}

          >
            Importar Planilla
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
          >
            Crear Manualmente
          </Button>
        </Box>
      </Box>

      {/* Tabla de cursos */}
      <Paper sx={{ width: '100%', height: 600 }}>
        <DataGrid
          rows={eventos}
          columns={[
            {
              field: 'id_evento',
              headerName: 'ID del evento',
              flex: 0.5,
              align: 'left',
              headerAlign: 'left',
              valueGetter: (value, row) => row?.id
            },
            {
              field: 'nombre',
              headerName: 'Nombre del Curso',
              flex: 2,
              valueGetter: (value, row) => row?.curso?.nombre
            },
            { field: 'fecha_desde', headerName: 'Fecha de Inicio', flex: 1 },
            { field: 'cantidad_inscriptos', headerName: 'Inscriptos', flex: 1, type: 'number', align: 'left', headerAlign: 'left' },
            { field: 'cantidad_asistidos', headerName: 'Asistidos', flex: 1, type: 'number', align: 'left', headerAlign: 'left' },
            {
              field: 'acciones',
              headerName: 'Acciones',
              width: 150,
              sortable: false,
              align: 'center',
              headerAlign: 'center',
              renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', width: '100%' }}>
                  <Tooltip
                    title="Generar Qr"
                    arrow
                    componentsProps={{
                      tooltip: {
                        sx: {
                          fontSize: '0.9rem',
                          padding: '8px 12px'
                        }
                      }
                    }}
                  >
                    <IconButton size="small" onClick={() => handleViewCourse(params.row)}>
                      <QrCodeIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip
                    title="Ver lista de inscriptos"
                    arrow
                    componentsProps={{
                      tooltip: {
                        sx: {
                          fontSize: '0.9rem',
                          padding: '8px 12px'
                        }
                      }
                    }}
                  >
                    <IconButton size="small" onClick={() => handleViewParticipantsList(params.row)}>
                      <ListAlt />
                    </IconButton>
                  </Tooltip>
                </Box>
              )
            }
          ]}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': { borderBottom: '1px solid #f0f0f0' },
            '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f8f9fa', fontWeight: 'bold' }
          }}
        />
      </Paper>
    </Box>
  );

  const renderAttendance = () => (
    <Box sx={{ width: '100%', maxWidth: '800px', mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 2, textAlign: 'center' }}>
        Registro de Asistencia
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: '#6c757d', textAlign: 'center' }}>
        Busca al asistente por CUIL para marcar su presencia.
      </Typography>

      <Card>
        <CardContent sx={{ p: 4 }}>
          {/* Seleccionar curso */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Selecciona el curso
            </Typography>
            <FormControl fullWidth>
              <InputLabel id="curso-label">
                Por favor, elija un curso
              </InputLabel>

              <Select
                labelId="curso-label"
                value={selectedCourse}
                label="Por favor, elija un curso"
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                {eventos.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.curso?.nombre} — {course.fecha_desde}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Ingresar CUIL */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Ingresá el CUIL del asistente
            </Typography>

            <TextField
              fullWidth
              label="Número de CUIL sin guiones"
              value={cuilAsistente}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setCuilAsistente(value);
              }}
              placeholder="20123456789"
              sx={{ mb: 3 }}
              disabled={!selectedCourse}
              inputProps={{ maxLength: 11 }}
            />

            {attendanceMessage && (
              <Alert
                severity={attendanceMessage.includes('✅') ? 'success' : attendanceMessage.includes('❌') ? 'error' : 'info'}
                sx={{ mb: 3 }}
              >
                {attendanceMessage}
              </Alert>
            )}
          </Box>

          {/* Botones */}
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={markAttendanceByCUIL}
              disabled={isMarkingAttendance || !selectedCourse || !cuilAsistente}
              startIcon={isMarkingAttendance ? <RefreshIcon /> : <SearchIcon />}
              fullWidth
              sx={{
                py: 1.5,
                '&:hover': { backgroundColor: '#0056b3' },
                fontSize: '1rem',
                fontWeight: 1200
              }}
            >
              {isMarkingAttendance ? 'Buscando Asistente...' : 'Buscar Asistente'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* Pestañas */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Stack direction="row" spacing={0}>
          {[
            { id: 'eventos', label: 'Eventos', icon: '📊' },
            { id: 'attendance', label: 'Asistencia', icon: '✓' },
          ].map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              variant={activeTab === tab.id ? 'contained' : 'text'}
              sx={{
                mr: 1,
                textTransform: 'none',
                color: activeTab === tab.id ? 'white' : 'primary.main'
              }}
            >
              {tab.icon} {tab.label}
            </Button>
          ))}
        </Stack>
      </Box>

      {/* Contenido */}

      {activeTab === 'eventos' && rendereventos()}
      {activeTab === 'attendance' && renderAttendance()}

      {/* Modal de Importar Planilla */}
      {showModalDatos && (
        <ModalDatosParticipante
          open={showModalDatos}
          onClose={handleCloseModalDatos}
          onConfirm={handleConfirmAttendance}
          userData={participanteData}
          idEvento={selectedCourse}
          nombreCurso={eventos.find(c => c.id === parseInt(selectedCourse))?.curso?.nombre}
        />
      )}

      {/* Modal de Lista de Participantes */}
      {showParticipantsList && (
        <ModalListaParticipantesPorEvento
          open={showParticipantsList}
          onClose={handleCloseParticipantsList}
          participantes={participantesList}
          nombreCurso={selectedCourseDetail?.curso?.nombre}
          idEvento={selectedCourseDetail?.id}
          onDataChange={handleRefreshData}
        />
      )}

      <Dialog
        open={showImportModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
          Importar Planilla
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Selecciona el archivo Excel (.xlsx)
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: '#6c757d' }}>
            Asegúrate de que la planilla tenga el formato oficial correcto.
          </Typography>

          <Box sx={{
            border: '2px dashed #dee2e6',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            mb: 3,
            backgroundColor: selectedFile ? '#f8f9fa' : 'transparent'
          }}>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="file-upload"
              disabled={isUploading}
            />
            <label htmlFor="file-upload">
              <Button
                variant="outlined"
                component="span"
                disabled={isUploading}
                sx={{
                  borderColor: '#6c757d',
                  color: '#6c757d',
                  '&:hover': {
                    borderColor: '#495057',
                    backgroundColor: 'rgba(108, 117, 125, 0.04)'
                  }
                }}
              >
                📄 Seleccionar Archivo
              </Button>
            </label>

            {selectedFile && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Archivo seleccionado:
                </Typography>
                <Typography variant="body2" sx={{ color: '#007bff' }}>
                  {selectedFile.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6c757d' }}>
                  Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Box>
            )}
          </Box>

          {uploadMessage && (
            <Alert
              severity={
                uploadMessage.includes('✅') ? 'success' :
                  uploadMessage.includes('❌') ? 'error' : 'info'
              }
              sx={{ mb: 2 }}
            >
              {uploadMessage}
            </Alert>
          )}

          {isUploading && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress />
              <Typography variant="caption" sx={{ color: '#6c757d', mt: 1, display: 'block' }}>
                Procesando archivo, por favor espera...
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={handleCloseModal}
            disabled={isUploading}
            sx={{ color: '#6c757d' }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleUploadFile}
            disabled={!selectedFile || isUploading}
            sx={{
              backgroundColor: '#007bff',
              '&:hover': { backgroundColor: '#0056b3' }
            }}
          >
            {isUploading ? 'Procesando...' : 'Siguiente'}
          </Button>
        </DialogActions>
      </Dialog>



      {/* Modal de Detalle del Curso */}
      <Dialog
        open={showCourseDetail}
        onClose={handleCloseCourseDetail}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={handleCloseCourseDetail} sx={{ color: '#6c757d' }}>
              ←
            </IconButton>
            Cursos
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedCourseDetail && (
            <Box>
              {/* Tabs del detalle */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Stack direction="row" spacing={4}>
                  <Button
                    variant="text"
                    sx={{
                      color: '#007bff',
                      borderBottom: '2px solid #007bff',
                      borderRadius: 0,
                      fontWeight: 600
                    }}
                  >
                    Detalles y QR
                  </Button>
                </Stack>
              </Box>

              {/* Información del curso */}
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                {selectedCourseDetail.curso?.nombre}
              </Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'black' }}>N° de Evento:</Typography>
                    <Typography variant="body1">{selectedCourseDetail?.id || "Error sin Id"}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'black' }}>Docente/s:</Typography>
                    <Typography variant="body1"> {selectedCourseDetail?.nombre_apellido_docente || "Error sin Docente"} </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'black' }}>Cantidad de inscriptos:</Typography>
                    <Typography variant="body1">{selectedCourseDetail?.cantidad_inscriptos || "Error sin Cantidad"}</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Sección QR */}
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Registro de Asistencia por QR
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: '#6c757d' }}>
                Muestra este QR en la entrada del evento para tomar asistencia.
              </Typography>

              <Button
                variant="contained"
                startIcon={<QrCodeIcon />}
                onClick={generateQR}
                disabled={isGeneratingQR}

              >
                {isGeneratingQR ? 'Generando...' : 'Generar QR de Asistencia'}
              </Button>

              {qrCode && (
                <Box sx={{ textAlign: 'center', mt: 3, p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                  <img
                    src={qrCode}
                    alt="Código QR"
                    style={{ maxWidth: '250px', height: 'auto' }}
                  />
                  <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={downloadQR}
                      startIcon={<DownloadIcon />}
                    >
                      Descargar
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={printQR}
                      startIcon={<PrintIcon />}
                    >
                      Imprimir
                    </Button>
                  </Stack>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}