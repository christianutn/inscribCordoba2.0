import React, { useState, useRef } from 'react';
import { Button, Tooltip, Backdrop, CircularProgress, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import {subirNotaDeAutorizacion} from '../../services/notasDeAutorizacion.service';

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

const SubaNotaDeAutorizacion = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      setAlert({ open: true, message: 'Por favor, seleccione un archivo PDF.', severity: 'error' });
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setAlert({ open: true, message: 'Por favor, seleccione un archivo para subir.', severity: 'warning' });
      return;
    }

    setLoading(true);
    try {
      await subirNotaDeAutorizacion(file);
      setAlert({ open: true, message: 'Nota de autorización subida correctamente.', severity: 'success' });
      setFile(null); 
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al subir la nota de autorización.';
      setAlert({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
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
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
    } else {
      setAlert({ open: true, message: 'Por favor, seleccione un archivo PDF.', severity: 'error' });
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '960px', margin: 'auto' }}>
      {alert.open && (
        <Alert 
          severity={alert.severity} 
          sx={{ width: '100%', mb: 2 }}
          onClose={() => setAlert({ ...alert, open: false })}
        >
          {alert.message}
        </Alert>
      )}
      <div style={{ marginBottom: '20px' }}>
        <h2>Suba su Nota de Autorización</h2>
        <p style={{ fontSize: '14px', color: '#666666' }}>Subí la nota de autorización para continuar. Solo se aceptan archivos PDF.</p>
      </div>

      <div 
        style={{ 
          border: isDragOver ? '2px dashed #3f51b5' : '2px dashed #dae1e7', 
          borderRadius: '8px', 
          padding: '56px 24px', 
          textAlign: 'center', 
          marginBottom: '24px',
          cursor: 'pointer',
          backgroundColor: isDragOver ? '#f0f4ff' : 'transparent'
        }}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <VisuallyHiddenInput type="file" accept=".pdf" onChange={handleFileChange} ref={fileInputRef} />
        <CloudUploadIcon style={{ fontSize: '50px', color: '#9e9e9e' }} />
        <p style={{ fontSize: '18px', color: '#333333' }}>Arrastrá y soltá tu PDF acá</p>
        <p style={{ fontSize: '14px', color: '#666666' }}>o seleccioná un archivo desde tu computadora</p>
        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          startIcon={<CloudUploadIcon />}
          
        >
          Seleccionar Archivo
          <VisuallyHiddenInput type="file" accept=".pdf" onChange={handleFileChange} ref={fileInputRef} />
        </Button>
        {file && <p style={{ marginTop: '16px' }}>Archivo seleccionado: {file.name}</p>}
        <p style={{ fontSize: '12px', color: '#666666', paddingTop: '8px' }}>Solo se aceptan archivos PDF.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '16px' }}>
        <Tooltip title="Subir la nota de autorización seleccionada">
          <span>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleUpload} 
              disabled={!file || loading}
              
            >
              Subir Nota
            </Button>
          </span>
        </Tooltip>
      </div>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
};

export default SubaNotaDeAutorizacion;