import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Skeleton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useTheme
} from '@mui/material';
import {
  CheckCircleOutline as CheckCircleOutlineIcon,
  InfoOutlined as InfoOutlinedIcon,
  EventAvailable as EventAvailableIcon,
  Article as ArticleIcon,
  ContactMail as ContactMailIcon,
  ArrowForward as ArrowForwardIcon,
  NotificationsActive as NotificationsActiveIcon,
  CalendarToday as CalendarTodayIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import { getAvisos, deleteAviso } from '../services/avisos.service';
import DOMPurify from 'dompurify';
import LinkInteres from './LinkDeInteres.jsx';

import Capacitacion4 from './imagenes/capacitacion_4pasos.png';
import PortalCC from './imagenes/portal_cc.png';
import Victorius from './imagenes/victorius.png';
import CampusCba from './imagenes/campus_cordoba.png';
import LogoFooter from './imagenes/logo_footer.png';

import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Alerta from '@mui/material/Alert';

import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';

const paperStyles = {
  p: 3,
  borderRadius: '16px',
  boxShadow: 2,
  height: '100%',
};

const Home = ({ nombre, rol, setOpcionSeleccionada }) => {
  const theme = useTheme();
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [loadingDelete, setLoadingDelete] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [avisoToDelete, setAvisoToDelete] = useState(null);

  useEffect(() => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const fetchAvisos = async () => {
      try {
        const data = await getAvisos();
        setAvisos(
          data
            .filter(a => a.visible)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        );
      } catch (error) {
        console.error("Error fetching avisos:", error);
        setErrorMessage("Error al cargar la lista de avisos.");
      } finally {
        setLoading(false);
      }
    };
    fetchAvisos();
  }, []);

  const formatearFecha = fecha => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  const linksInteresData = [
    { img: Capacitacion4, title: 'Capacitación 2 Pasos', url: 'https://drive.google.com/drive/folders/12HPXuMo59WUBNS26h-KahNQi8ivRDfDV' },
    { img: Victorius, title: 'Gestión Victorius', url: 'https://campuscordoba.cba.gov.ar/gestordeplataforma/public/' },
    { img: PortalCC, title: 'Portal Campus Córdoba', url: 'https://campuscordoba.cba.gov.ar/#page-event-list' },
    { img: CampusCba, title: 'Plataforma Campus Córdoba', url: 'https://campuscordoba.cba.gov.ar/plataforma/my/' },
  ];

  const handleDeleteAvisoClick = (aviso) => {
    setAvisoToDelete(aviso);
    setOpenConfirmDialog(true);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleCloseConfirmDialog = () => {
    if (loadingDelete) return;
    setOpenConfirmDialog(false);
    setAvisoToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!avisoToDelete || !avisoToDelete.id) return;

    setLoadingDelete(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await deleteAviso(avisoToDelete.id);
      setAvisos(prevAvisos => prevAvisos.filter(aviso => aviso.id !== avisoToDelete.id));
      setSuccessMessage('Aviso eliminado correctamente.');
      setOpenConfirmDialog(false);
      setAvisoToDelete(null);
    } catch (error) {
      console.error("Error al eliminar aviso:", error);
      setSuccessMessage(null);
      setErrorMessage(error.message || 'Ocurrió un error al eliminar el aviso.');
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleCloseAlert = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return (
    <>
      {loading && (
        <Backdrop
          sx={{ color: 'primary.main', zIndex: (theme) => theme.zIndex.drawer + 2 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      )}

      {openConfirmDialog && avisoToDelete && (
        <Dialog
          open={openConfirmDialog}
          onClose={handleCloseConfirmDialog}
          aria-labelledby="confirm-delete-dialog-title"
          aria-describedby="confirm-delete-dialog-description"
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ backgroundColor: 'error.main', color: 'white' }} id="confirm-delete-dialog-title">
            Confirmar Eliminación
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ pt: 2 }} id="confirm-delete-dialog-description">
              ¿Está seguro de que desea eliminar el aviso: <strong>{avisoToDelete.titulo}</strong>?
              <br />Esta acción no se puede deshacer.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: '16px 24px' }}>
            <Button onClick={handleCloseConfirmDialog} color="secondary" disabled={loadingDelete}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              variant="contained"
              color="error"
              startIcon={loadingDelete ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
              disabled={loadingDelete}
            >
              {loadingDelete ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Box sx={{ backgroundColor: '#FFFFFF', minHeight: '100vh', pt: 8, pb: 8 }}>
        <Container maxWidth="lg" sx={{ position: 'relative', px: { xs: 2, md: 4 } }}>
          {/* Silueta sutil institucional (El Panal) */}
          <Box
            sx={{
              position: 'absolute',
              top: '-40px',
              right: 0,
              width: { xs: '200px', sm: '300px', md: '400px' },
              height: { xs: '200px', sm: '300px', md: '400px' },
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              opacity: 0.02, // Extremadamente sutil, NASA-style
              pointerEvents: 'none',
              zIndex: 0,
              filter: 'grayscale(100%)'
            }}
          />

          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: {
                xs: 'clamp(1.75rem, 6vw, 2.22rem)',
                md: 'clamp(2.22rem, 4vw, 2.8rem)'
              },
              mb: { xs: 3, md: 4 },
              color: 'primary.main',
              textAlign: 'left',
              letterSpacing: '-1.5px',
              position: 'relative',
              zIndex: 1,
              transform: 'translateY(-10px)',
            }}
          >
            {nombre ? `¡Hola ${nombre}!` : '¡Hola Valentina De Los Angeles!'}
          </Typography>

          <Grid container spacing={5} alignItems="flex-start">
            {/* Últimos Avisos (65%) */}
            <Grid item xs={12} md={8}>
              <Box>
                <Box display="flex" alignItems="center" mb={1.5} px={0.5}>
                  <Typography
                    variant="h6"
                    component="h2"
                    sx={{
                      fontWeight: 700,
                      color: '#4A5568',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      fontSize: { xs: '1rem', sm: '1.1rem', md: '1.3rem' },
                      mb: 0,
                      pl: 1
                    }}
                  >
                    Avisos
                  </Typography>
                  {successMessage && (
                    <Alerta
                      severity="success"
                      sx={{
                        ml: 2,
                        flexShrink: 0,
                        fontSize: '0.8rem',
                        fontFamily: 'Roboto, sans-serif',
                        fontWeight: 500,
                        py: 0.5, px: 1,
                        borderRadius: '16px',
                      }}
                      onClose={handleCloseAlert}
                    >
                      {successMessage}
                    </Alerta>
                  )}
                  {errorMessage && (
                    <Alerta
                      severity="error"
                      sx={{
                        ml: successMessage ? 1 : 2,
                        flexShrink: 0,
                        fontSize: '0.8rem',
                        fontFamily: 'Roboto, sans-serif',
                        fontWeight: 500,
                        py: 0.5, px: 1,
                        borderRadius: '16px',
                      }}
                      onClose={handleCloseAlert}
                    >
                      {errorMessage}
                    </Alerta>
                  )}
                </Box>

                {/* Feed de Avisos sin contenedor limitante */}
                <Box>
                  {loading ? (
                    Array.from(new Array(3)).map((_, index) => (
                      <Box key={index} sx={{ mb: 3, p: 3, backgroundColor: 'white', borderRadius: '16px', boxShadow: 1 }}>
                        <Skeleton variant="text" width="80%" sx={{ mb: 0.5 }} />
                        <Skeleton variant="text" width="40%" sx={{ fontSize: '0.8rem', mb: 1 }} />
                        <Skeleton variant="rectangular" height={60} sx={{ borderRadius: '16px' }} />
                      </Box>
                    ))
                  ) : avisos.length === 0 ? (
                    <Box textAlign="center" p={6} sx={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                      <InfoOutlinedIcon sx={{ fontSize: 48, color: '#CBD5E0', mb: 2 }} />
                      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                        No hay noticias destacadas hoy.
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {avisos.map((aviso) => (
                        <AvisoCard
                          key={aviso.id}
                          aviso={aviso}
                          rol={rol}
                          formatearFecha={formatearFecha}
                          handleDeleteAvisoClick={handleDeleteAvisoClick}
                          loadingDelete={loadingDelete}
                          avisoToDelete={avisoToDelete}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>

            {/* Bloque Información de Interés (35%) */}
            <Grid item xs={12} md={4}>
              <Box sx={{ position: 'sticky', top: '20px' }}>
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{
                    fontWeight: 700,
                    color: '#4A5568',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.15rem' },
                    mb: 3,
                    lineHeight: { xs: 1.2, sm: 1.5 }
                  }}
                >
                  ¿Qué podés hacer aquí?
                </Typography>

                <List disablePadding>
                  {[
                    {
                      icon: <EventAvailableIcon sx={{ fontSize: '1.8rem' }} />,
                      title: 'Planificación Anual',
                      desc: 'Organizá las fechas de tus capacitaciones de forma eficiente.'
                    },
                    {
                      icon: <ArticleIcon sx={{ fontSize: '1.8rem' }} />,
                      title: 'Cursos Registrados',
                      desc: 'Consultá en tiempo real el estado de todas tus capacitaciones.'
                    },
                    {
                      icon: <NotificationsActiveIcon sx={{ fontSize: '1.8rem' }} />,
                      title: 'Avisos Importantes',
                      desc: 'Visualizá avisos críticos y novedades al momento.'
                    },
                    {
                      icon: <AutoAwesomeIcon sx={{ fontSize: '1.8rem' }} />,
                      title: 'Gestión 100% Digital',
                      desc: 'Para una administración ágil y sostenible.'
                    }
                  ].map((item, idx) => (
                    <Box key={idx} sx={{ mb: 5, display: 'flex', alignItems: 'flex-start' }}>
                      <Box
                        sx={{
                          color: '#005A87', // Azul accesible (WCAG 4.5:1)
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '24px',
                          mr: 2
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            color: '#1A1A1A',
                            fontSize: '1.1rem', // Aumentado
                            lineHeight: '26px'
                          }}
                        >
                          {item.title}
                        </Typography>
                        <Typography
                          variant="body1" // Aumentado
                          sx={{
                            mt: 0.5,
                            fontSize: '1rem', // 16px
                            color: 'text.secondary',
                            lineHeight: 1.5
                          }}
                        >
                          {item.desc}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </List>
              </Box>
            </Grid>
          </Grid>
        </Container>

        {/* Sección Flujo de Gestión */}
        <Box
          sx={{
            position: 'relative',
            mt: 8,
            mb: 0,
            py: 8,
            backgroundColor: '#F8F9FA', // Mantenemos el gris muy sutil para diferenciar secciones
            borderTop: '1px solid #E9EFF2',
            borderBottom: '1px solid #E9EFF2'
          }}
        >
          <Container maxWidth="lg" sx={{ px: { xs: 2, md: 4 } }}>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 700,
                mb: 6,
                color: '#1A1A1A',
                textAlign: 'center',
                letterSpacing: '-1px'
              }}
            >
              Flujo de Gestión
            </Typography>

            <Grid container spacing={3} justifyContent="center">
              {[
                { step: 'Paso 1', title: 'Cargar Nota', color: '#E2464C', desc: 'Iniciá el proceso cargando la nota de autorización correspondiente.', option: 'SubaNotaDeAutorizacion' },
                { step: 'Paso 2', title: 'Crear Evento', color: '#009EE3', desc: 'Completá el formulario del evento de tu capacitación.', option: 'Eventos' },
                { step: 'Paso 3', title: 'Crear Cohorte', color: '#004582', desc: 'Completá el formulario de cohorte para agendar las fechas de tu capacitación.', option: 'Formulario' },
                { step: 'Paso 4', title: 'Ver Calendario', color: '#5D717E', desc: 'Consultá las cohortes que cargaste en el calendario.', option: 'Calendario' }
              ].map((item, idx) => (
                <Grid item xs={12} sm={6} md={3} key={idx}>
                  <Paper
                    elevation={0}
                    onClick={() => setOpcionSeleccionada(item.option)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setOpcionSeleccionada(item.option);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    sx={{
                      p: { xs: 3, sm: 4 },
                      pl: { xs: 4, sm: 5 }, // Ajuste para el borde grueso
                      borderRadius: '16px',
                      backgroundColor: '#ffffff',
                      borderLeft: `8px solid ${item.color}`,
                      borderTop: '1px solid #F0F0F0',
                      borderRight: '1px solid #F0F0F0',
                      borderBottom: '1px solid #F0F0F0',
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        borderLeftWidth: '14px',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
                      },
                      '&:focus-visible': {
                        outline: `3px solid ${item.color}`,
                        outlineOffset: '2px'
                      }
                    }}
                  >
                    <Typography
                      variant="overline"
                      sx={{
                        color: item.color,
                        fontWeight: 800,
                        letterSpacing: '1px',
                        fontSize: '0.9rem', // Aumentado
                        opacity: 0.9
                      }}
                    >
                      {item.step}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#1A1A1A',
                        mt: 1,
                        mb: 1.5,
                        fontSize: '1.25rem', // Aumentado
                        lineHeight: 1.3
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#555', lineHeight: 1.5, fontSize: '1rem' }}>
                      {item.desc}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        <Box sx={{ backgroundColor: 'transparent', py: 8, mt: 0 }}>
          <Container maxWidth="lg" sx={{ px: { xs: 2, md: 4 } }}>
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 700,
                textAlign: 'center',
                mb: 6,
                fontSize: { xs: '1.8rem', md: '2.3rem' },
                color: '#1A1A1A'
              }}
            >
              Accesos Rápidos
            </Typography>
            <Grid container spacing={3} justifyContent="center" alignItems="stretch">
              {linksInteresData.map((link, i) => (
                <Grid item xs={12} sm={6} md={3} key={i} sx={{ display: 'flex' }}>
                  <LinkInteres
                    imagenSrc={link.img}
                    titulo={link.title}
                    onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                  />
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      </Box >
    </>
  );
};

// --- Componente Auxiliar para Tarjetas de Aviso ---
const AvisoCard = ({ aviso, rol, formatearFecha, handleDeleteAvisoClick, loadingDelete, avisoToDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const contentRef = useRef(null);

  useLayoutEffect(() => {
    const checkTruncation = () => {
      if (contentRef.current && !isExpanded) {
        // Detectar si el contenido es mayor que el espacio de 3 lineas (aprox 72-80px)
        // o simplemente comparar scrollHeight vs clientHeight mientras está en line-clamp
        setIsTruncated(contentRef.current.scrollHeight > contentRef.current.clientHeight);
      }
    };

    // Pequeño timeout para asegurar que el DOM se haya pintado si hay HTML complejo
    const timer = setTimeout(checkTruncation, 50);
    window.addEventListener('resize', checkTruncation);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkTruncation);
    };
  }, [aviso.contenido, isExpanded]);

  return (
    <Box sx={{
      p: { xs: 3, sm: 4 },
      pb: isExpanded ? 6 : { xs: 3, sm: 4 },
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      border: '1px solid #F0F0F0',
      '&:hover': {
        boxShadow: '0 6px 16px rgba(0,0,0,0.06)'
      }
    }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 2,
          gap: { xs: 1.5, sm: 0 }
        }}
      >
        <Box display="flex" alignItems="center" sx={{ flexGrow: 1, pr: { xs: 0, sm: 2 }, width: { xs: '100%', sm: 'auto' } }}>
          <Typography variant="h6" sx={{ fontSize: '1.15rem', fontWeight: 700, color: '#000000', lineHeight: 1.3, display: 'flex', alignItems: 'center' }}>
            {aviso.icono || <InfoOutlinedIcon sx={{ fontSize: '1.2rem', mr: 0.8, color: 'primary.main' }} />}
            <span style={{ flex: 1 }}>{aviso.titulo}</span>
          </Typography>
        </Box>

        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          width: { xs: '100%', sm: 'auto' },
          justifyContent: { xs: 'space-between', sm: 'flex-end' },
          borderTop: { xs: '1px solid rgba(0,0,0,0.05)', sm: 'none' },
          pt: { xs: 1.5, sm: 0 }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: '#757575', opacity: 0.7 }}>
            <CalendarTodayIcon sx={{ fontSize: '0.85rem', mr: 0.8 }} />
            <Typography variant="caption" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
              {formatearFecha(aviso.created_at)}
            </Typography>
          </Box>
          {rol === 'ADM' && (
            <IconButton
              aria-label={`eliminar aviso ${aviso.titulo}`}
              onClick={() => handleDeleteAvisoClick(aviso)}
              size="small"
              sx={{
                color: '#899dac',
                transition: 'all 0.2s ease',
                '&:hover': { color: 'error.main', backgroundColor: 'rgba(211, 47, 47, 0.04)' }
              }}
              disabled={loadingDelete && avisoToDelete?.id === aviso.id}
            >
              {(loadingDelete && avisoToDelete?.id === aviso.id) ? <CircularProgress size={18} color="inherit" /> : <DeleteForeverIcon fontSize="small" />}
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Area del contenido expandible */}
      <Box sx={{ overflow: 'hidden' }}>
        <Box
          ref={contentRef}
          sx={{
            mt: 1,
            fontSize: '1.05rem', // Aumentado para legibilidad (16.8px)
            color: '#333',
            display: isExpanded ? 'block' : '-webkit-box',
            WebkitLineClamp: isExpanded ? 'none' : 5,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.6,
            '& p': { marginBlockStart: '0.8em', marginBlockEnd: '0.8em' },
            '& a': { color: '#004582', fontWeight: 500, textDecoration: 'none' },
            '& ul, & ol': { pl: 2 }
          }}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(aviso.contenido)
          }}
        />
      </Box>

      {(isTruncated || isExpanded) && (
        <Button
          variant="text"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          sx={{
            mt: 2,
            px: 1,
            minHeight: '44px', // Área táctil mínima accesible
            fontSize: '0.9rem',
            textTransform: 'none',
            fontWeight: 700,
            color: '#005A87', // Azul accesible
            minWidth: 'auto',
            '&:hover': { background: 'rgba(0, 90, 135, 0.04)', color: '#004582', textDecoration: 'none' }
          }}
        >
          {isExpanded ? 'Ver menos' : 'Leer aviso completo'}
        </Button>
      )}
    </Box>
  );
};

export default Home;