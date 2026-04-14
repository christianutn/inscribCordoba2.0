import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
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
  Divider,
  Skeleton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ButtonBase,
} from '@mui/material';
import {
  InfoOutlined as InfoOutlinedIcon,
  ArrowForward as ArrowForwardIcon,
  PushPinOutlined as PushPinIcon,
  Delete as DeleteIcon,
  NotificationsNone as NotificationsNoneIcon,
  EventNote as EventNoteIcon,
  Assignment as AssignmentIcon,
  CalendarMonth as CalendarMonthIcon,
  NoteAdd as NoteAddIcon,
  WarningAmberOutlined as WarningIcon,
  CheckCircleOutline as SuccessIcon,
  CampaignOutlined as CampaignIcon,
  CelebrationOutlined as CelebrationIcon,
  EventAvailableOutlined as EventIcon,
  LightbulbOutlined as LightbulbIcon
} from '@mui/icons-material';
import { getAvisos, deleteAviso } from '../services/avisos.service';
import DOMPurify from 'dompurify';
import LinkInteres from './LinkDeInteres.jsx';

import Capacitacion4 from './imagenes/capacitacion_4pasos.png';
import PortalCC from './imagenes/portal_cc.png';
import Victorius from './imagenes/victorius.png';
import CampusCba from './imagenes/campus_cordoba.png';
import LogoFooter from './imagenes/logo_footer.png';

import IconButton from '@mui/material/IconButton';
import Alerta from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';

const Home = ({ nombre, rol, setOpcionSeleccionada, sidebarOpen }) => {
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [loadingDelete, setLoadingDelete] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [avisoToDelete, setAvisoToDelete] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
    return () => clearTimeout(timer);
  }, [sidebarOpen]);

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
    { img: Capacitacion4, title: 'Documentación para cursos nuevos', url: 'https://drive.google.com/drive/folders/12HPXuMo59WUBNS26h-KahNQi8ivRDfDV' },
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

      <Box
        sx={{
          width: '100%',
          flexGrow: 1,
          background: 'radial-gradient(circle at top left, #FFFFFF, #F1F5F9)',
          transition: 'width 0.3s ease-in-out',
          minHeight: '100vh',
          pb: 8
        }}
      >
        <Box sx={{ py: { xs: 4, md: 6 } }}>
          <Container maxWidth={false} sx={{ px: { xs: 2, md: 5 } }}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 700,
                fontFamily: "'Geogrotesque Sharp', sans-serif",
                fontSize: {
                  xs: 'clamp(1.6rem, 5vw, 2rem)',
                  sm: 'clamp(2rem, 4vw, 2.4rem)',
                  md: 'clamp(2.2rem, 3.5vw, 2.8rem)',
                  lg: 'clamp(2.6rem, 3vw, 3.5rem)',
                },
                mb: { xs: 4, md: 6 },
                color: '#003d7a',
                textAlign: 'left',
                letterSpacing: '-1.5px',
              }}
            >
              {nombre ? `¡Hola ${nombre}!` : '¡Hola Valentina De Los Angeles!'}
            </Typography>

            <Grid container spacing={5} alignItems="flex-start">
              {/* COLUMNA IZQUIERDA: Mi Ruta de Gestión (60%) */}
              <Grid item xs={12} md={7}>
                <Box>
                  <Box display="flex" alignItems="center" height="40px" mb={4}>
                    <Typography
                      variant="h5"
                      component="h2"
                      sx={{
                        fontWeight: 700,
                        fontFamily: "'Geogrotesque Sharp', sans-serif",
                        color: '#334155',
                        fontSize: '1.5rem',
                        letterSpacing: '-0.5px'
                      }}
                    >
                      Pasos para crear un nuevo curso
                    </Typography>
                    {successMessage && (
                      <Alerta severity="success" sx={{ ml: 2, py: 0, borderRadius: '12px' }} onClose={handleCloseAlert}>
                        {successMessage}
                      </Alerta>
                    )}
                    {errorMessage && (
                      <Alerta severity="error" sx={{ ml: 2, py: 0, borderRadius: '12px' }} onClose={handleCloseAlert}>
                        {errorMessage}
                      </Alerta>
                    )}
                  </Box>

                  <Grid container spacing={3}>
                    {[
                      { step: 'Paso 1', title: 'Cargar Nota', color: '#009EE3', icon: <NoteAddIcon />, desc: 'Iniciá el proceso cargando la nota de autorización correspondiente.', option: rol === 'ADM' ? 'Autorizaciones' : 'MisNotasAutorizacionIdentifier' },
                      { step: 'Paso 2', title: 'Crear Evento', color: '#009EE3', icon: <AssignmentIcon />, desc: 'Una vez autorizada la nota, completá el formulario del evento de tu capacitación.', option: 'Eventos' },
                      { step: 'Paso 3', title: 'Crear Cohorte', color: '#009EE3', icon: <EventNoteIcon />, desc: 'Completá el formulario de cohorte para agendar las fechas de tu capacitación.', option: 'Formulario' },
                      { step: 'Paso 4', title: 'Ver Calendario', color: '#009EE3', icon: <CalendarMonthIcon />, desc: 'Consultá las cohortes que cargaste en el calendario.', option: 'Calendario' }
                    ].map((item, idx) => (
                      <Grid item xs={12} key={idx}>
                        <ButtonBase
                          component="div"
                          onClick={() => setOpcionSeleccionada(item.option)}
                          sx={{
                            width: '100%',
                            textAlign: 'left',
                            display: 'block',
                            borderRadius: '20px',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              transform: 'translateX(8px) translateY(-2px)',
                            }
                          }}
                        >
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              borderRadius: '20px',
                              backgroundColor: 'rgba(255, 255, 255, 0.8)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255, 255, 255, 0.4)',
                              position: 'relative',
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.02), 0 10px 20px rgba(0,0,0,0.04), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
                              '&:hover': {
                                transform: 'translateY(-6px)',
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                boxShadow: '0 20px 40px rgba(0, 158, 227, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
                                '& .arrow-wrap': { transform: 'translateX(6px)', opacity: 1 },
                                '& .icon-box': { transform: 'scale(1.1)', filter: 'brightness(1.1)' }
                              }
                            }}
                          >
                            <Box
                              className="icon-box"
                              sx={{
                                width: 52,
                                height: 52,
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: `${item.color}15`,
                                color: item.color,
                                mr: 3,
                                flexShrink: 0,
                                transition: 'all 0.3s ease'
                              }}
                            >
                              {item.icon}
                            </Box>
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                              <Typography
                                variant="overline"
                                sx={{
                                  color: '#475569',
                                  fontWeight: 800,
                                  fontFamily: "'Geogrotesque Sharp', sans-serif",
                                  letterSpacing: '1.5px',
                                  fontSize: '0.9rem',
                                  display: 'block',
                                  lineHeight: 1.2,
                                  mb: 0.5
                                }}
                              >
                                {item.step}
                              </Typography>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 700,
                                  fontFamily: 'Poppins, sans-serif',
                                  color: '#0F172A',
                                  lineHeight: 1.2,
                                  fontSize: '1.25rem',
                                  letterSpacing: '-0.3px',
                                  mb: 0.8
                                }}
                              >
                                {item.title}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#334155', fontFamily: 'Poppins, sans-serif', fontSize: '1rem', lineHeight: 1.5 }}>
                                {item.desc}
                              </Typography>
                            </Box>
                            <Box className="arrow-wrap" sx={{ transition: 'transform 0.3s', ml: 2, color: '#CBD5E1' }}>
                              <ArrowForwardIcon fontSize="small" />
                            </Box>
                          </Paper>
                        </ButtonBase>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Grid>

              {/* COLUMNA DERECHA: Panel de Avisos (40%) */}
              <Grid item xs={12} md={5}>
                <Box sx={{ height: '100%', pl: { md: 2 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" height="40px" mb={4}>
                    <Typography
                      variant="h6"
                      component="h2"
                      sx={{
                        fontWeight: 700,
                        fontFamily: "'Geogrotesque Sharp', sans-serif",
                        color: '#334155',
                        letterSpacing: '-0.5px',
                        fontSize: '1.5rem'
                      }}
                    >
                      Avisos y Novedades
                    </Typography>
                  </Box>

                  {loading ? (
                    Array.from(new Array(3)).map((_, index) => (
                      <Box key={index} sx={{ mb: 4, pl: 2, borderLeft: '2px solid #E2E8F0' }}>
                        <Skeleton variant="text" width="60%" height={30} />
                        <Skeleton variant="text" width="90%" />
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ position: 'relative' }}>
                      {/* Línea de tiempo sutil con gradiente */}
                      <Box sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '1px',
                        background: 'linear-gradient(to bottom, #CBD5E1, transparent)',
                        zIndex: 0
                      }} />

                      {avisos.map((aviso) => (
                        <AvisoCompacto
                          key={aviso.id}
                          aviso={aviso}
                          rol={rol}
                          formatearFecha={formatearFecha}
                          handleDeleteAvisoClick={handleDeleteAvisoClick}
                          // Lógica UX: Hasta 3 avisos mostramos casi todo (12 líneas). 
                          // A partir del 4to aviso, compactamos a 3 líneas para cuidar el scroll.
                          lineLimit={avisos.length <= 3 ? 12 : 3}
                        />
                      ))}
                      {avisos.length === 0 && (
                        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: '20px', backgroundColor: 'rgba(255, 255, 255, 0.4)', border: '1px dashed #CBD5E1' }}>
                          <NotificationsNoneIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 2 }} />
                          <Typography variant="body2" color="#64748B" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                            Mantente al tanto de las novedades próximamente.
                          </Typography>
                        </Paper>
                      )}
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* SECCIÓN INFERIOR: Accesos Rápidos */}
              <Grid item xs={12}>
                <Box sx={{ mt: 5, pt: 4, borderTop: '1px solid rgba(0,0,0,0.03)' }}>
                  <Typography
                    variant="h3"
                    component="h2"
                    sx={{
                      fontWeight: 700,
                      fontFamily: "'Geogrotesque Sharp', sans-serif",
                      textAlign: 'center',
                      mb: 6,
                      mt: 1,
                      color: '#0F172A',
                      letterSpacing: '-0.5px',
                      fontSize: { xs: '1.4rem', md: '1.8rem' }
                    }}
                  >
                    Recursos de Interés
                  </Typography>
                  <Grid container spacing={4}>
                    {linksInteresData.map((link, i) => (
                      <Grid item xs={12} sm={6} md={3} key={i}>
                        <LinkInteres
                          imagenSrc={link.img}
                          titulo={link.title}
                          url={link.url}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

      </Box>
    </>
  );
};

const AvisoCompacto = ({ aviso, rol, formatearFecha, handleDeleteAvisoClick, lineLimit = 3 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const textRef = useRef(null);

  useLayoutEffect(() => {
    const checkOverflow = () => {
      if (textRef.current && !isExpanded) {
        // Tolerancia de 5px para evitar falsos positivos
        const isTruncated = textRef.current.scrollHeight > (textRef.current.clientHeight + 5);
        setCanExpand(isTruncated);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [aviso.contenido, isExpanded, lineLimit]);

  const getAvisoIcon = (iconoRaw) => {
    const iconStyle = { fontSize: '1.4rem' };
    const icono = iconoRaw ? iconoRaw.trim().toLowerCase() : '';

    // Mapeo por palabras clave (Nueva DB) o por contenido de emoji (Vieja DB)
    if (icono === 'pin' || icono.includes('📌')) return <PushPinIcon sx={iconStyle} />;
    if (icono === 'warning' || icono.includes('⚠️')) return <WarningIcon sx={iconStyle} />;
    if (icono === 'info' || icono.includes('ℹ️')) return <InfoOutlinedIcon sx={iconStyle} />;
    if (icono === 'success' || icono.includes('✅')) return <SuccessIcon sx={iconStyle} />;
    if (icono === 'announcement' || icono.includes('📢')) return <CampaignIcon sx={iconStyle} />;
    if (icono === 'celebration' || icono.includes('🎉')) return <CelebrationIcon sx={iconStyle} />;
    if (icono === 'calendar' || icono.includes('📅')) return <EventIcon sx={iconStyle} />;
    if (icono === 'tip' || icono.includes('💡')) return <LightbulbIcon sx={iconStyle} />;

    // Fallback por defecto si no hay coincidencia
    return <InfoOutlinedIcon sx={iconStyle} />;
  };

  return (
    <Box
      sx={{
        pl: 3,
        pb: 6,
        position: 'relative',
        '&:last-child': { pb: 0 },
        '&::before': {
          content: '""',
          position: 'absolute',
          left: '-4px',
          top: '22px', // Centrado con el contenedor de 52px
          width: '9px',
          height: '9px',
          borderRadius: '50%',
          backgroundColor: '#009EE3',
          border: '2px solid #FFF',
          zIndex: 2,
          boxShadow: '0 0 0 4px rgba(0, 158, 227, 0.1)'
        }
      }}
    >
      <Box sx={{ display: 'flex', width: '100%', mb: 1.5, alignItems: 'flex-start' }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 158, 227, 0.12)',
            color: '#007bb1',
            mr: 3,
            flexShrink: 0,
            transition: 'all 0.3s ease'
          }}
        >
          {getAvisoIcon(aviso.icono)}
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            variant="caption"
            sx={{
              color: '#64748B',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'block',
              mb: 0.3,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {formatearFecha(aviso.created_at)}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              fontFamily: "'Geogrotesque Sharp', sans-serif",
              color: '#0F172A',
              lineHeight: 1.2,
              fontSize: '1.25rem',
              wordBreak: 'break-word',
              letterSpacing: '-0.3px'
            }}
          >
            {aviso.titulo}
          </Typography>
        </Box>
        {rol === 'ADM' && (
          <IconButton
            className="delete-btn"
            aria-label="eliminar"
            onClick={() => handleDeleteAvisoClick(aviso)}
            size="small"
            sx={{ color: '#E2E8F0', '&:hover': { color: 'error.light' }, ml: 1 }}
          >
            <DeleteIcon fontSize="small" style={{ fontSize: '1rem' }} />
          </IconButton>
        )}
      </Box>
      <Box sx={{ pl: 9.5, width: '100%' }}>
        <Typography
          ref={textRef}
          variant="body2"
          sx={{
            color: '#1E293B',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '1rem',
            lineHeight: 1.6,
            display: isExpanded ? 'block' : '-webkit-box',
            WebkitLineClamp: isExpanded ? 'none' : lineLimit,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            wordBreak: 'break-word',
            fontWeight: 400
          }}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(aviso.contenido)
          }}
        />
        {canExpand && (
          <Button
            size="small"
            variant="text"
            onClick={() => setIsExpanded(!isExpanded)}
            sx={{
              mt: 1.5,
              textTransform: 'none',
              p: 0,
              px: 2,
              py: 0.5,
              minWidth: 'auto',
              fontWeight: 700,
              color: '#009EE3',
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '0.95rem',
              borderRadius: '50px',
              border: '1px solid rgba(0, 158, 227, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(0, 158, 227, 0.05)',
                borderColor: '#009EE3',
                '& .btn-arrow': { transform: 'translateX(4px)', opacity: 1, width: 'auto', ml: 0.5 }
              }
            }}
          >
            {isExpanded ? 'Leer menos' : 'Seguir leyendo...'}
            {!isExpanded && (
              <Box component="span" className="btn-arrow" sx={{ opacity: 0, width: 0, transition: 'all 0.2s ease', display: 'inline-block' }}>
                →
              </Box>
            )}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default Home;