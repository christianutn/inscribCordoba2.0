import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Estilo base de Quill
import DOMPurify from 'dompurify';
import { postAviso } from "../services/avisos.service.js"; // Asegúrate que la ruta sea correcta

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
  Alert, // <-- Importar Alert
  AlertTitle, // <-- Opcional: para un título en el Alert
  Stack, // <-- Importar Stack para layout
  useTheme, // <-- Hook para acceder al tema
} from '@mui/material';

// Toolbar y Formatos (sin cambios)
const modules = {
  toolbar: [
    [{ 'font': [] }, { 'size': [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'header': '1' }, { 'header': '2' }, 'blockquote', 'code-block'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    // ['link', 'image', 'video'], // Descomenta si necesitas estos
    ['clean'] // Botón para limpiar formato
  ]
};

const formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'script',
  'blockquote', 'code-block',
  'list', 'bullet', 'indent',
  // 'link', 'image', 'video' // Descomenta si necesitas estos
];

const CrearAviso = () => {
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [icono, setIcono] = useState('📌');
  const [mensaje, setMensaje] = useState({ text: '', type: '' }); // { text: '...', type: 'success' | 'error' | 'info' }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const theme = useTheme(); // Acceder al tema para estilos consistentes

  const handleGuardar = async () => {
    setMensaje({ text: '', type: '' }); // Limpiar mensaje previo

    if (!titulo.trim() || !contenido.trim() || contenido === '<p><br></p>') {
      setMensaje({ text: 'El título y el contenido son obligatorios.', type: 'error' });
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    setMensaje({ text: 'Publicando aviso...', type: 'info' });

    const sanitizedContent = DOMPurify.sanitize(contenido);

    // Validación extra: Asegurarse que después de sanitizar aún hay contenido visible
    // (DOMPurify podría eliminar todo si solo eran scripts maliciosos, etc.)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitizedContent;
    if (!tempDiv.textContent?.trim() && !tempDiv.querySelector('img') /* u otros elementos visibles */) {
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
      // Opcional: Limpiar mensaje de éxito después de un tiempo
      // setTimeout(() => setMensaje({ text: '', type: '' }), 5000);

    } catch (error) {
      console.error("Error al guardar aviso:", error);
      const errorMessage = error?.response?.data?.message || error.message || 'Ocurrió un error desconocido';
      setMensaje({ text: `Error al publicar: ${errorMessage}`, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determinar la severidad del Alert basado en mensaje.type
  const getAlertSeverity = () => {
    switch (mensaje.type) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'info': return 'info';
      default: return undefined; // No mostrar Alert si no hay tipo
    }
  };

  return (
    // Contenedor principal con padding y maxWidth
    <Box sx={{ py: 4, px: 2, maxWidth: '960px', margin: 'auto' }}>
      <Card sx={{
        p: { xs: 2, sm: 3, md: 4 }, // Padding responsive
        borderRadius: 3, // Esquinas más redondeadas
        boxShadow: '0 8px 24px rgba(0,0,0,0.05)', // Sombra más suave y difusa
        overflow: 'visible' // Asegurar que no corte sombras o elementos flotantes
      }}>
        <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 600, textAlign: 'center' }}>
          Crear Nuevo Aviso
        </Typography>

        {/* Campo de Título */}
        <TextField
          fullWidth
          label="Título del Aviso"
          variant="outlined"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          sx={{ mb: 3 }}
          required
          disabled={isSubmitting} // Deshabilitar en carga
        />

        {/* Editor de Texto Enriquecido */}
        <Box sx={{
          mb: 3, // Margen inferior antes de los controles
          '& .ql-toolbar': {
            bgcolor: '#f8f9fa', // Fondo ligero para la toolbar
            borderTopLeftRadius: theme.shape.borderRadius, // Redondeo consistente
            borderTopRightRadius: theme.shape.borderRadius,
            borderColor: theme.palette.divider, // Color de borde del tema
            borderBottom: 'none', // Quitar borde inferior de toolbar
          },
          '& .ql-container': {
            borderBottomLeftRadius: theme.shape.borderRadius,
            borderBottomRightRadius: theme.shape.borderRadius,
            borderColor: theme.palette.divider,
            minHeight: '250px', // Altura mínima
            fontSize: '1rem', // Asegurar tamaño de fuente base
             bgcolor: isSubmitting ? '#f0f0f0' : '#fff' // Fondo grisáceo si está deshabilitado
          },
          '& .ql-editor': {
            minHeight: '250px',
            padding: theme.spacing(2), // Padding interno consistente
            '&.ql-blank::before': { // Estilo del placeholder
                color: theme.palette.text.secondary,
                fontStyle: 'italic',
                opacity: 0.8,
            }
          },
          // Deshabilitar Quill visualmente (no tiene prop 'disabled' directa)
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
            readOnly={isSubmitting} // Hacerlo readOnly durante la carga
          />
        </Box>

        {/* Controles: Icono y Botón */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }} // Columna en móvil, fila en pantallas más grandes
          spacing={2} // Espacio entre elementos
          alignItems="center" // Centrar verticalmente en modo fila
          sx={{ mt: 3 }} // Margen superior
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
              {/* Mismos emojis pero con texto descriptivo */}
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

          {/* Botón de acción con estado de carga */}
          {/* Usar un Box para evitar que el botón ocupe todo el ancho en Stack column */}
          <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGuardar}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{
                px: 4, // Padding horizontal
                py: 1.5, // Padding vertical
                fontWeight: 600,
                width: { xs: '100%', sm: 'auto' }, // Ancho completo en móvil
                 transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: isSubmitting ? 'none' : 'translateY(-2px)', // Ligera elevación en hover (si no está cargando)
                    boxShadow: isSubmitting ? 'none' : theme.shadows[4]
                  }
              }}
            >
              {isSubmitting ? 'Publicando...' : 'Publicar Aviso'}
            </Button>
          </Box>
        </Stack>

        {/* Mensaje de feedback usando Alert */}
        {mensaje.text && getAlertSeverity() && (
          <Alert
            severity={getAlertSeverity()}
            sx={{ mt: 4, '& .MuiAlert-message': { flexGrow: 1 } }} // Margen superior y asegurar que el mensaje ocupe espacio
            // onClose={() => setMensaje({ text: '', type: '' })} // Opcional: botón para cerrar el alert
          >
            {/* <AlertTitle>
              {mensaje.type === 'success' ? 'Éxito' : mensaje.type === 'error' ? 'Error' : 'Información'}
            </AlertTitle> */}
            {mensaje.text}
          </Alert>
        )}
      </Card>
    </Box>
  );
};

export default CrearAviso;