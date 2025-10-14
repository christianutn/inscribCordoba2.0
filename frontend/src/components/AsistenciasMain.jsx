import React, { useState } from 'react';
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
  Stack
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import QRCode from 'qrcode';

export default function AsistenciasMain() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [statusMessage, setStatusMessage] = useState('Sistema listo para generar códigos QR de asistencia');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  // Datos de ejemplo - estos vendrían del backend
  const courses = [
    { id: 1, name: 'Curso de React Avanzado', date: '2025-01-15', inscriptos: 25, estado: 'Activo' },
    { id: 2, name: 'Introducción a JavaScript', date: '2025-01-20', inscriptos: 30, estado: 'Activo' },
    { id: 3, name: 'Python para Principiantes', date: '2025-02-01', inscriptos: 20, estado: 'Programado' },
  ];

  const generateQR = async () => {
    if (!selectedCourse) {
      setStatusMessage('Por favor, selecciona un curso para generar el QR');
      return;
    }

    setIsGeneratingQR(true);
    setStatusMessage('Generando código QR...');

    try {
      const course = courses.find(c => c.id === parseInt(selectedCourse));
      const qrData = {
        courseId: course.id,
        courseName: course.name,
        date: course.date,
        timestamp: new Date().toISOString(),
        action: 'mark_attendance'
      };

      const qrString = JSON.stringify(qrData);
      
      const qrDataURL = await QRCode.toDataURL(qrString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCode(qrDataURL);
      setStatusMessage(`QR generado para: ${course.name}`);
    } catch (error) {
      console.error('Error generando QR:', error);
      setStatusMessage('Error al generar el código QR');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const downloadQR = () => {
    if (!qrCode) return;

    const link = document.createElement('a');
    link.href = qrCode;
    const course = courses.find(c => c.id === parseInt(selectedCourse));
    link.download = `QR_${course.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.png`;
    link.click();
  };

  const printQR = () => {
    if (!qrCode) return;

    const printWindow = window.open('', '_blank');
    const course = courses.find(c => c.id === parseInt(selectedCourse));
    
    printWindow.document.write(`
      <html>
        <head>
          <title>QR - ${course.name}</title>
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
            <strong>${course.name}</strong><br>
            Fecha: ${course.date}
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

  const renderCourses = () => (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Gestión de Cursos
        </Typography>
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Nombre del Curso</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Fecha de Inicio</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Inscriptos</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px' }}>{course.name}</td>
                  <td style={{ padding: '12px' }}>{course.date}</td>
                  <td style={{ padding: '12px' }}>{course.inscriptos}</td>
                  <td style={{ padding: '12px' }}>
                    <Box 
                      sx={{ 
                        px: 2, 
                        py: 0.5, 
                        borderRadius: 1, 
                        bgcolor: course.estado === 'Activo' ? 'success.light' : 'warning.light',
                        color: course.estado === 'Activo' ? 'success.dark' : 'warning.dark',
                        display: 'inline-block',
                        fontSize: '0.875rem'
                      }}
                    >
                      {course.estado}
                    </Box>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </CardContent>
    </Card>
  );

  const renderAttendance = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Generar QR de Asistencia
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              {statusMessage}
            </Alert>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Seleccionar Curso</InputLabel>
              <Select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                label="Seleccionar Curso"
              >
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.name} - {course.date}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={generateQR}
                disabled={isGeneratingQR || !selectedCourse}
                startIcon={<QrCodeIcon />}
                fullWidth
              >
                {isGeneratingQR ? 'Generando...' : 'Generar QR'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        {qrCode && (
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Código QR Generado
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <img 
                  src={qrCode} 
                  alt="Código QR" 
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </Box>

              <Stack direction="row" spacing={2} justifyContent="center">
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
            </CardContent>
          </Card>
        )}
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* Pestañas */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Stack direction="row" spacing={0}>
          {[
            { id: 'dashboard', label: 'Inicio', icon: '🏠' },
            { id: 'courses', label: 'Cursos', icon: '📊' },
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
      {activeTab === 'courses' && renderCourses()}
      {activeTab === 'attendance' && renderAttendance()}
    </Box>
  );
}