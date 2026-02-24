import React, { useState, useRef, useEffect } from 'react';
import {
  Button,
  Tooltip,
  CircularProgress,
  Alert,
  Box,
  Typography,
  IconButton,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import { subirNotaDeAutorizacion } from '../../services/notasDeAutorizacion.service';

const SUGGESTED_MAX_SIZE_MB = 2;
const INSTITUTIONAL_CYAN = '#009EE3';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const SubaNotaDeAutorizacion = ({ setOpcionSeleccionada }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [isDragOver, setIsDragOver] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [lastUploadTime, setLastUploadTime] = useState(() => {
    const saved = localStorage.getItem('lastNotaUploadTime');
    return saved ? parseInt(saved, 10) : null;
  });
  const fileInputRef = useRef(null);

  const checkFileSize = (selectedFile) => {
    const sizeInMB = selectedFile.size / (1024 * 1024);
    if (sizeInMB > SUGGESTED_MAX_SIZE_MB) {
      setAlert({
        open: true,
        message: (
          <span>
            El archivo es demasiado pesado (máximo {SUGGESTED_MAX_SIZE_MB}MB). Por favor, comprimilo en{' '}
            <Link
              href="https://www.ilovepdf.com/es/comprimir_pdf"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'inherit', fontWeight: 'bold' }}
            >
              iLovePDF
            </Link>{' '}
            para poder subirlo.
          </span>
        ),
        severity: 'error'
      });
      return false;
    }
    return true;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setAlert({ open: false, message: '', severity: 'success' });
        checkFileSize(selectedFile);
      } else {
        setAlert({ open: true, message: 'Por favor, seleccione un archivo PDF.', severity: 'error' });
      }
    }
  };

  const executeUpload = async () => {
    setConfirmDialogOpen(false);
    setLoading(true);
    setAlert({ open: false, message: '', severity: 'success' });

    try {
      await subirNotaDeAutorizacion(file);
      const now = Date.now();
      setLastUploadTime(now);
      localStorage.setItem('lastNotaUploadTime', now.toString());

      setAlert({ open: true, message: 'Nota de autorización subida correctamente.', severity: 'success' });
      handleResetFile(false);
    } catch (error) {
      console.error('Upload error:', error);
      const isLargeFile = error.response?.status === 413 ||
        error.message?.includes('413') ||
        error.response?.data?.message?.toLowerCase().includes('large');

      if (isLargeFile) {
        setAlert({
          open: true,
          message: (
            <span>
              El servidor rechazó el archivo por su peso. Por favor, comprimilo en{' '}
              <Link
                href="https://www.ilovepdf.com/es/comprimir_pdf"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'inherit', fontWeight: 'bold' }}
              >
                iLovePDF
              </Link>{' '}
              e intentá nuevamente.
            </span>
          ),
          severity: 'error'
        });
      } else {
        const errorMessage = error.response?.data?.message || 'Error al subir la nota de autorización.';
        setAlert({ open: true, message: errorMessage, severity: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    if (!file) {
      setAlert({ open: true, message: 'Por favor, seleccione un archivo para subir.', severity: 'warning' });
      return;
    }

    if (file.size / (1024 * 1024) > SUGGESTED_MAX_SIZE_MB) {
      setAlert({ open: true, message: `El archivo supera el límite de ${SUGGESTED_MAX_SIZE_MB}MB.`, severity: 'error' });
      return;
    }

    // Volvemos a consultar localStorage por si hubo cambios en otra pestaña o por seguridad
    const savedTime = localStorage.getItem('lastNotaUploadTime');
    const effectiveLastTime = savedTime ? Number(savedTime) : lastUploadTime;

    const now = Date.now();
    const threeMinutesInMs = 3 * 60 * 1000;

    if (effectiveLastTime && (now - effectiveLastTime) < threeMinutesInMs) {
      setConfirmDialogOpen(true);
    } else {
      executeUpload();
    }
  };

  const handleResetFile = (clearAlert = true) => {
    setFile(null);
    if (clearAlert) {
      setAlert({ open: false, message: '', severity: 'success' });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setAlert({ open: false, message: '', severity: 'success' });
        checkFileSize(droppedFile);
      } else {
        setAlert({ open: true, message: 'Por favor, seleccione un archivo PDF.', severity: 'error' });
      }
    }
  };

  const handleGoToMisNotas = (e) => {
    e.preventDefault();
    if (setOpcionSeleccionada) {
      setOpcionSeleccionada('MisNotasAutorizacionIdentifier');
    }
  };

  const isTooLarge = file && (file.size / (1024 * 1024) > SUGGESTED_MAX_SIZE_MB);
  const hasError = alert.open && (alert.severity === 'error' || alert.severity === 'warning');
  const isInfo = alert.open && alert.severity === 'info';

  return (
    <Box sx={{ padding: '20px', maxWidth: '960px', margin: 'auto' }}>

      <Alert severity="info" sx={{ mb: 3 }}>
        ¿Ya cargaste una nota hoy? Podés consultar tus envíos recientes en{' '}
        <Link
          href="#"
          onClick={handleGoToMisNotas}
          sx={{ cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
        >
          Mis Notas
        </Link>.
      </Alert>

      {alert.open && (
        <Alert
          severity={alert.severity}
          sx={{ width: '100%', mb: 2 }}
          onClose={() => setAlert({ ...alert, open: false })}
        >
          {alert.message}
        </Alert>
      )}

      <Box sx={{ marginBottom: '20px' }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>Cargar Nota de Autorización</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          Adjuntá la nota de autorización para habilitar los cursos.
        </Typography>
      </Box>

      <Box
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          border: isDragOver
            ? `2px dashed ${INSTITUTIONAL_CYAN}`
            : hasError
              ? '2px dashed #d32f2f'
              : isInfo ? `2px dashed #0288d1` : '2px dashed #dae1e7',
          borderRadius: '8px',
          padding: '56px 24px',
          textAlign: 'center',
          marginBottom: '24px',
          cursor: !file ? 'pointer' : 'default',
          backgroundColor: isDragOver ? 'rgba(0, 158, 227, 0.04)' : 'transparent',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: hasError ? '#d32f2f' : isInfo ? '#0288d1' : INSTITUTIONAL_CYAN,
            backgroundColor: !file ? 'rgba(0, 158, 227, 0.02)' : 'transparent'
          }
        }}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: 'none' }}
          id="pdf-upload-input"
        />

        {!file ? (
          <label htmlFor="pdf-upload-input" style={{ cursor: 'pointer', display: 'block', width: '100%' }}>
            <CloudUploadIcon sx={{ fontSize: '64px', color: isDragOver ? INSTITUTIONAL_CYAN : '#9e9e9e', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'text.primary', mb: 1 }}>
              Arrastrá tu archivo acá
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              o seleccioná un archivo desde tu computadora
            </Typography>

            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUploadIcon />}
              sx={{
                backgroundColor: INSTITUTIONAL_CYAN,
                '&:hover': { backgroundColor: '#0088c4' }
              }}
            >
              Seleccionar Archivo PDF
            </Button>
          </label>
        ) : (
          <Box sx={{ py: 1 }}>
            <Typography variant="h6" sx={{ color: INSTITUTIONAL_CYAN, mb: 2, fontWeight: 600 }}>
              ¡Archivo cargado!
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 158, 227, 0.1)',
                borderRadius: '12px',
                px: 3,
                py: 2,
                width: 'fit-content',
                mx: 'auto',
                border: `1px solid ${INSTITUTIONAL_CYAN}`
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', mr: 2 }}>
                {file.name}
              </Typography>
              <IconButton size="small" color="error" onClick={handleResetFile} title="Eliminar archivo">
                <CloseIcon />
              </IconButton>
            </Box>
            <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
              Hacé clic en el botón de abajo para finalizar el envío.
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', paddingTop: '16px' }}>
        <Tooltip title={!file ? "Seleccione un archivo primero" : isTooLarge ? "El archivo es demasiado pesado" : "Subir la nota de autorización seleccionada"}>
          <span>
            <Button
              variant="contained"
              onClick={handleUploadClick}
              disabled={!file || loading || isTooLarge}
              sx={{
                minWidth: '240px',
                height: '48px',
                backgroundColor: INSTITUTIONAL_CYAN,
                '&:hover': { backgroundColor: '#0088c4' },
                '&.Mui-disabled': { backgroundColor: 'rgba(0, 0, 0, 0.12)' }
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'SUBIR NOTA DE AUTORIZACIÓN'
              )}
            </Button>
          </span>
        </Tooltip>
      </Box>

      {/* Dialogo de confirmación para duplicados */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>¿Deseas subir una nueva nota?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Detectamos un envío reciente. ¿Estás seguro de que deseas subir una nueva nota ahora?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmDialogOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={executeUpload}
            variant="contained"
            sx={{ backgroundColor: INSTITUTIONAL_CYAN, '&:hover': { backgroundColor: '#0088c4' } }}
            autoFocus
          >
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubaNotaDeAutorizacion;