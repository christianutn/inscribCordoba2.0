import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';
import { postAviso } from "../services/avisos.service.js";

import {
  TextField,
  Button,
  MenuItem,
  Select,
  Typography,
  Card,
  Box,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  AlertTitle,
  Stack,
  useTheme,
} from '@mui/material';

const modules = {
  toolbar: [
    [{ 'font': [] }, { 'size': [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'header': '1' }, { 'header': '2' }, 'blockquote', 'code-block'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    ['clean']
  ]
};

const formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'script',
  'blockquote', 'code-block',
  'list', 'bullet', 'indent',
];

const CrearAviso = () => {
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [icono, setIcono] = useState('📌');
  const [mensaje, setMensaje] = useState({ text: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const theme = useTheme();

  const handleGuardar = async () => {
    setMensaje({ text: '', type: '' });

    if (!titulo.trim() || !contenido.trim() || contenido === '<p><br></p>') {
      setMensaje({ text: 'El título y el contenido son obligatorios.', type: 'error' });
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    setMensaje({ text: 'Publicando aviso...', type: 'info' });

    const sanitizedContent = DOMPurify.sanitize(contenido);

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitizedContent;
    if (!tempDiv.textContent?.trim() && !tempDiv.querySelector('img')) {
      setMensaje({ text: 'El contenido parece estar vacío o fue eliminado por seguridad.', type: 'error' });
      setIsSubmitting(false);
      return;
    }

    const avisoNuevo = {
      titulo: titulo.trim(),
      contenido: sanitizedContent,
      icono,
      visible: true,
    };

    try {
      await postAviso(avisoNuevo);
      setMensaje({ text: '¡Aviso publicado correctamente!', type: 'success' });
      setTitulo('');
      setContenido('');
      setIcono('📌');
    } catch (error) {
      console.error("Error al guardar aviso:", error);
      const errorMessage = error?.response?.data?.message || error.message || 'Ocurrió un error desconocido';
      setMensaje({ text: `Error al publicar: ${errorMessage}`, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAlertSeverity = () => {
    switch (mensaje.type) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'info': return 'info';
      default: return undefined;
    }
  };

  return (
    <Box sx={{ py: 4, px: 2, maxWidth: '960px', margin: 'auto' }}>
      <Card sx={{
        p: { xs: 2, sm: 3, md: 4 },
        borderRadius: 3,
        boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
        overflow: 'visible'
      }}>
        <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 600, textAlign: 'center' }}>
          Crear Nuevo Aviso
        </Typography>

        <TextField
          fullWidth
          label="Título del Aviso"
          variant="outlined"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          sx={{ mb: 3 }}
          required
          disabled={isSubmitting}
        />

        <Box sx={{
          mb: 3,
          '& .ql-toolbar': {
            bgcolor: '#f8f9fa',
            borderTopLeftRadius: theme.shape.borderRadius,
            borderTopRightRadius: theme.shape.borderRadius,
            borderColor: theme.palette.divider,
            borderBottom: 'none',
          },
          '& .ql-container': {
            borderBottomLeftRadius: theme.shape.borderRadius,
            borderBottomRightRadius: theme.shape.borderRadius,
            borderColor: theme.palette.divider,
            minHeight: '250px',
            fontSize: '1rem',
            bgcolor: isSubmitting ? '#f0f0f0' : '#fff'
          },
          '& .ql-editor': {
            minHeight: '250px',
            padding: theme.spacing(2),
            '&.ql-blank::before': {
              color: theme.palette.text.secondary,
              fontStyle: 'italic',
              opacity: 0.8,
            }
          },
          pointerEvents: isSubmitting ? 'none' : 'auto',
          opacity: isSubmitting ? 0.7 : 1,
        }}>
          <ReactQuill
            theme="snow"
            value={contenido}
            onChange={setContenido}
            modules={modules}
            formats={formats}
            placeholder="Escribe aquí el contenido detallado del aviso..."
            readOnly={isSubmitting}
          />
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems="center"
          sx={{ mt: 3 }}
        >
          <FormControl sx={{ minWidth: { xs: '100%', sm: 220 } }} disabled={isSubmitting}>
            <InputLabel id="icono-select-label">Icono Asociado</InputLabel>
            <Select
              labelId="icono-select-label"
              id="icono-select"
              value={icono}
              label="Icono Asociado"
              onChange={(e) => setIcono(e.target.value)}
            >
              <MenuItem value="📌">📌 Importante</MenuItem>
              <MenuItem value="⚠️">⚠️ Advertencia</MenuItem>
              <MenuItem value="ℹ️">ℹ️ Información</MenuItem>
              <MenuItem value="✅">✅ Éxito / Logro</MenuItem>
              <MenuItem value="📢">📢 Anuncio General</MenuItem>
              <MenuItem value="🎉">🎉 Celebración / Evento</MenuItem>
              <MenuItem value="📅">📅 Recordatorio Fecha</MenuItem>
              <MenuItem value="💡">💡 Tip / Sugerencia</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGuardar}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 600,
                width: { xs: '100%', sm: 'auto' },
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: isSubmitting ? 'none' : 'translateY(-2px)',
                  boxShadow: isSubmitting ? 'none' : theme.shadows[4]
                }
              }}
            >
              {isSubmitting ? 'Publicando...' : 'Publicar Aviso'}
            </Button>
          </Box>
        </Stack>

        {mensaje.text && getAlertSeverity() && (
          <Alert
            severity={getAlertSeverity()}
            sx={{ mt: 4, '& .MuiAlert-message': { flexGrow: 1 } }}
          >
            {mensaje.text}
          </Alert>
        )}
      </Card>
    </Box>
  );
};

export default CrearAviso;