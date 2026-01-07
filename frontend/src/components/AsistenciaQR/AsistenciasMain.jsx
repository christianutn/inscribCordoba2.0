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
  SimCardDownload as SimCardDownloadIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import QRCode from 'qrcode';
import { postSubaMasiva, getlistadoEventos, getListadosDeParticipantes, getDetalleEventoConAsistencia } from '../../services/asistencias.service.js'
import ExcelJS from 'exceljs';
import ModalListaParticipantesPorEvento from './ModalListaParticipantesPorEvento.jsx';
import ModalCrearEventoManual from './ModalCrearEventoManual.jsx';
import { validateAttendanceExcel } from '../../utils/excelValidator.js';

export default function AsistenciasMain() {
  const [statusMessage, setStatusMessage] = useState('Sistema listo para generar códigos QR de asistencia');
  const [qrCode, setQrCode] = useState('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

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

  // Estado para modal de crear evento manual
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Estado para filtro de eventos
  const [filterText, setFilterText] = useState('');

  const fetchEventos = async () => {
    try {
      const response = await getlistadoEventos();
      setEventos(response);

    } catch (error) {
      console.error('Error al cargar eventos:', error);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  const handleRefreshData = async () => {
    await fetchEventos();
    // Also refresh participants list if a course is selected
    if (selectedCourseDetail) {
      handleViewParticipantsList(selectedCourseDetail);
    }
  };





  const generateQR = async (courseInput) => {
    // Determine the course to use
    // Check if courseInput is a valid course object (has .id) to avoid using the Click Event object
    let course = (courseInput && courseInput.id)
      ? courseInput
      : selectedCourseDetail;

    if (!course) {
      setStatusMessage('Por favor, selecciona un curso para generar el QR');
      return;
    }

    setIsGeneratingQR(true);
    setQrCode(''); // Clear previous QR
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
      // 1. Validar el formato del archivo en el frontend primero
      await validateAttendanceExcel(selectedFile);

      // 2. Si es válido, proceder con la subida
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
      // Mensaje específico para errores de validación
      console.error("Error validación/subida:", error);
      setUploadMessage(`❌ ${error.message || 'Error al procesar carga de archivo'}`);
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
    generateQR(course);
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
    const course = selectedCourseDetail;
    if (course) {
      link.download = `QR_${(course.curso?.nombre || 'curso').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.png`;
      link.click();
    }
  };

  const printQR = () => {
    if (!qrCode) return;

    const printWindow = window.open('', '_blank');
    const course = selectedCourseDetail;

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


  const handleDownloadExcel = async (row) => {
    try {
      const data = await getDetalleEventoConAsistencia(row.id);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Asistencia');

      // Obtener todas las fechas únicas de asistencias y ordenarlas
      const allDates = new Set();
      data.participantes.forEach(p => {
        p.asistencias.forEach(a => allDates.add(a.fecha));
      });
      const sortedDates = Array.from(allDates).sort();

      // Definir columnas estáticas
      const columns = [
        { header: 'Nro de Evento', key: 'nro_evento', width: 15 },
        { header: 'Curso', key: 'curso', width: 30 },
        { header: 'Cuil', key: 'cuil', width: 20 },
        { header: 'Nombre', key: 'nombre', width: 20 },
        { header: 'Apellido', key: 'apellido', width: 20 },
        { header: 'Correo Electrónico', key: 'email', width: 30 },
        { header: 'Reparticion', key: 'reparticion', width: 20 },
        { header: 'Empleado', key: 'empleado', width: 15 },
        { header: 'Nota', key: 'nota', width: 10 },
      ];

      // Agregar columnas de fechas dinámicas
      sortedDates.forEach(date => {
        // Formatear fecha a mm/dd/aaaa
        const [year, month, day] = date.split('-');
        const formattedDate = `${month}/${day}/${year}`;
        columns.push({ header: formattedDate, key: date, width: 15 });
      });

      worksheet.columns = columns;

      // Agregar filas
      data.participantes.forEach(participante => {
        const rowData = {
          nro_evento: data.id_evento,
          cuil: participante.cuil,
          curso: data.nombre_evento,
          nombre: participante.nombre,
          apellido: participante.apellido,
          email: participante.correo_electronico,
          reparticion: participante.reparticion,
          empleado: participante.empleado === 1 ? 'SI' : 'NO',
          nota: participante.nota || '',
        };

        // Llenar datos de asistencia
        sortedDates.forEach(date => {
          const asistencia = participante.asistencias.find(a => a.fecha === date);
          // 1 para presente, 0 para ausente (asumimos 0 = "Ausente" aunque el usuario dijo "Asetente")
          if (asistencia) {
            rowData[date] = asistencia.estado_asistencia === 1 ? 'Presente' : 'Ausente';
          } else {
            rowData[date] = '-'; // O vacío si no hay registro para esa fecha
          }
        });

        worksheet.addRow(rowData);
      });

      // Estilar encabezados
      worksheet.getRow(1).font = { bold: true };

      // Generar y descargar archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${data.id_evento}.${data.nombre_evento.replace(/\s+/g, '_')}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error al descargar Excel:', error);
      alert('Error al descargar el archivo Excel');
    }
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

        <Box sx={{ flexGrow: 1, mx: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Filtrar por ID de evento o Nombre de curso..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
            }}
            sx={{ backgroundColor: 'white' }}
          />
        </Box>

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
            onClick={() => setShowCreateModal(true)}
          >
            Crear Manualmente
          </Button>
        </Box>
      </Box>

      {/* Tabla de cursos */}
      <Paper sx={{ width: '100%', height: 600 }}>
        <DataGrid
          rows={eventos.filter(evento => {
            if (!filterText) return true;
            const searchLower = filterText.toLowerCase();
            return (
              evento.id?.toString().includes(searchLower) ||
              evento.curso?.nombre?.toLowerCase().includes(searchLower)
            );
          })}
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
            { field: 'cantidad_asistidos', headerName: 'Asistencia', flex: 1, type: 'number', align: 'left', headerAlign: 'left' },
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
                  <Tooltip
                    title="Descargar Listado de participantes (Excel)"
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
                    <IconButton size="small" onClick={() => handleDownloadExcel(params.row)}>
                      <SimCardDownloadIcon />
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



  return (
    <Box sx={{ width: '100%' }}>
      {/* Contenido principal */}
      {rendereventos()}

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

      {/* Modal Crear Evento Manual */}
      {showCreateModal && (
        <ModalCrearEventoManual
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onConfirm={handleRefreshData}
        />
      )}



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
            Detalle del Curso
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