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
  LinearProgress
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import QRCode from 'qrcode';
import { postSubaMasiva, getlistadoEventos, getConsultarAsistencia, postConfirmarAsistencia } from '../services/asistencias.service.js'
import ModalDatosParticipante from './ModalDatosParticipante.jsx';

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
  const [showSalaModal, setShowSalaModal] = useState(false);
  const [selectedSala, setSelectedSala] = useState('');

  // Estados para detalle del curso
  const [showCourseDetail, setShowCourseDetail] = useState(false);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState(null);
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await getlistadoEventos();
        setEventos(response);
      } catch (error) {
        console.error('Error al cargar eventos:', error);
      }
    };
    fetchEventos();
  }, []);


  // Opciones de salas
  const salas = [
    { codigo: 'SG', nombre: 'Sala de gestión (ingrese SG)' },
    { codigo: 'SI1', nombre: 'Sala de informática 1 (ingrese SI1)' },
    { codigo: 'SI2', nombre: 'Sala de informática 2 (ingrese SI2)' },
    { codigo: 'SE', nombre: 'Sala externa (ingrese SE(Nombre sala))' }
  ];

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

      setAttendanceMessage(`✅ Asistencia registrada exitosamente para ${userData.nombre} ${userData.apellido} en ${nombreCurso}`);
      setCuilAsistente(''); // Limpiar campo
      setParticipanteData(null);

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

      // Cerrar modal de importación y mostrar modal de sala
      setTimeout(() => {
        setShowImportModal(false);
        setShowSalaModal(true);
        setSelectedFile(null);
        setUploadMessage('');
      }, 1500);

    } catch (error) {
      console.error('Error procesando archivo:', error);
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

  // Funciones para modal de sala
  const handleSalaSubmit = () => {
    if (!selectedSala.trim()) {
      alert('Por favor, ingresa la sala donde se dictará el curso');
      return;
    }

    // Cerrar modal y limpiar
    setShowSalaModal(false);
    setSelectedSala('');

    // Mostrar mensaje de éxito
    alert('Curso creado exitosamente con la sala: ' + selectedSala);
  };

  const handleCloseSalaModal = () => {
    setShowSalaModal(false);
    setSelectedSala('');
  };

  // Funciones para detalle del curso
  const handleViewCourse = (course) => {
    setSelectedCourseDetail(course);
    setShowCourseDetail(true);
  };

  const handleCloseCourseDetail = () => {
    setShowCourseDetail(false);
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

    printWindow.document.write(`
      <html>
        <head>
          <title>QR - ${course.curso?.nombre}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 20px; 
            }
            .qr-container { 
              margin: 20px 0; 
            }
            .course-info { 
              margin: 20px 0; 
              font-size: 18px; 
            }
            .instructions { 
              margin-top: 30px; 
              font-size: 14px; 
              color: #666; 
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
            <img src="${qrCode}" alt="Código QR" />
          </div>
          <div class="instructions">
            <p>Escaneá este código QR para registrar tu asistencia</p>
            <p>Generado el: ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const renderDashboard = () => (
    <Card>
      <CardContent>
        <Typography variant="h4" gutterBottom color="primary">
          ¡Bienvenido al Sistema de Asistencias!
        </Typography>
        <Typography variant="body1" paragraph>
          Usa las pestañas para navegar entre las diferentes funciones:
        </Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <SchoolIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">Gestión de Cursos</Typography>
              <Typography variant="body2" color="text.secondary">
                Visualiza y administra todos los cursos disponibles
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <QrCodeIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">Registro de Asistencia</Typography>
              <Typography variant="body2" color="text.secondary">
                Genera códigos QR para el registro de asistencias
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

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
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#1976d2' }}>
          Gestión de Cursos
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleImportClick}
            sx={{
              borderColor: '#6c757d',
              color: '#6c757d',
              '&:hover': {
                borderColor: '#495057',
                backgroundColor: 'rgba(108, 117, 125, 0.04)'
              }
            }}
          >
            📊 Importar Planilla
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#007bff',
              '&:hover': {
                backgroundColor: '#0056b3'
              }
            }}
          >
            ➕ Crear Manualmente
          </Button>
        </Box>
      </Box>

      {/* Tabla de cursos */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: 0
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid #dee2e6'
              }}>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#6c757d',
                  borderBottom: '2px solid #dee2e6'
                }}>
                  Nombre del Curso
                </th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#6c757d',
                  borderBottom: '2px solid #dee2e6'
                }}>
                  Fecha de Inicio
                </th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#6c757d',
                  borderBottom: '2px solid #dee2e6'
                }}>
                  Inscriptos
                </th>
                <th style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#6c757d',
                  borderBottom: '2px solid #dee2e6'
                }}>
                  Asistidos
                </th>
                <th style={{
                  padding: '16px',
                  textAlign: 'center',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#6c757d',
                  borderBottom: '2px solid #dee2e6'
                }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {eventos.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: '#6c757d',
                    fontSize: '16px'
                  }}>
                    No hay cursos disponibles
                  </td>
                </tr>
              ) : (
                eventos.map((course, index) => (
                  <tr
                    key={course.id}
                    style={{
                      borderBottom: '1px solid #f1f3f5',
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc',
                      '&:hover': {
                        backgroundColor: '#f8f9fa'
                      }
                    }}
                  >
                    <td style={{
                      padding: '16px',
                      fontSize: '14px',
                      color: '#212529'
                    }}>
                      {course.curso.nombre}
                    </td>
                    <td style={{
                      padding: '16px',
                      fontSize: '14px',
                      color: '#6c757d'
                    }}>
                      {course.fecha_desde}
                    </td>
                    <td style={{
                      padding: '16px',
                      fontSize: '14px',
                      color: '#6c757d'
                    }}>
                      {course.cantidad_inscriptos}
                    </td>
                    <td style={{
                      padding: '16px',
                      fontSize: '14px',
                      color: '#6c757d'
                    }}>
                      {course.cantidad_asistidos}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewCourse(course)}
                          sx={{
                            color: '#007bff',
                            '&:hover': { backgroundColor: 'rgba(0, 123, 255, 0.04)' }
                          }}
                        >
                          👁️
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{
                            color: '#6c757d',
                            '&:hover': { backgroundColor: 'rgba(108, 117, 125, 0.04)' }
                          }}
                        >
                          ✏️
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{
                            color: '#dc3545',
                            '&:hover': { backgroundColor: 'rgba(220, 53, 69, 0.04)' }
                          }}
                        >
                          🗑️
                        </IconButton>
                      </Box>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Box>
      </Paper>
    </Box>
  );

  const renderAttendance = () => (
    <Box sx={{ width: '100%', maxWidth: '800px', mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1976d2', mb: 2, textAlign: 'center' }}>
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
              <InputLabel>-- Por favor, elija un curso --</InputLabel>
              <Select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                label="-- Por favor, elija un curso --"
                displayEmpty
              >
                <MenuItem value="" disabled>
                  <em>-- Por favor, elija un curso --</em>
                </MenuItem>
                {eventos.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.curso?.nombre} - {course.fecha_desde}
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
              startIcon={isMarkingAttendance ? <RefreshIcon /> : null}
              fullWidth
              sx={{
                py: 1.5,
                backgroundColor: '#007bff',
                '&:hover': { backgroundColor: '#0056b3' },
                fontSize: '1rem',
                fontWeight: 1200
              }}
            >
              {isMarkingAttendance ? 'Buscando Asistente...' : '🔍 Buscar Asistente'}
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
            { id: 'dashboard', label: 'Inicio', icon: '🏠' },
            { id: 'eventos', label: 'Cursos', icon: '📊' },
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
      {activeTab === 'dashboard' && renderDashboard()}
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

      {/* Modal de Selección de Sala */}
      <Dialog
        open={showSalaModal}
        onClose={handleCloseSalaModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem', textAlign: 'center' }}>
          Ingrese la sala donde se dictará el curso
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            {salas.map((sala) => (
              <Typography key={sala.codigo} variant="body2" sx={{ mb: 1, color: '#6c757d' }}>
                {sala.nombre}
              </Typography>
            ))}
          </Box>

          <TextField
            fullWidth
            placeholder="SG o SE(Auditorio Principal)"
            value={selectedSala}
            onChange={(e) => setSelectedSala(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={handleCloseSalaModal}
            sx={{ color: '#6c757d' }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSalaSubmit}
            sx={{
              backgroundColor: '#007bff',
              '&:hover': { backgroundColor: '#0056b3' }
            }}
          >
            Enviar
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
                  <Button variant="text" sx={{ color: '#6c757d' }}>
                    Asistentes
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
                    <Typography variant="body1">DRAGOTTO, JUAN MANUEL</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'black' }}>Sala:</Typography>
                    <Typography variant="body1">Falta implementar</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'black' }}>Cantidad de inscriptos:</Typography>
                    <Typography variant="body1">{selectedCourseDetail.cantidad_inscriptos}</Typography>
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
                sx={{
                  backgroundColor: '#007bff',
                  '&:hover': { backgroundColor: '#0056b3' },
                  mb: 3
                }}
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