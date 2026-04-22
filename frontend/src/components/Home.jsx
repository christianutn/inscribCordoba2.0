import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
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
  ArrowForward as ArrowForwardIcon,
  PushPinOutlined as PushPinIcon,
  Delete as DeleteIcon,
  NotificationsNone as NotificationsNoneIcon,
  EventNote as EventNoteIcon,
  Assignment as AssignmentIcon,
  CalendarMonth as CalendarMonthIcon,
  NoteAdd as NoteAddIcon,
  WarningAmber as WarningAmberIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Campaign as CampaignIcon,
  Celebration as CelebrationIcon,
  LightbulbCircle as LightbulbIcon,
  InfoOutlined as InfoOutlinedIcon
} from '@mui/icons-material';
import { getAvisos, deleteAviso } from '../services/avisos.service';
import DOMPurify from 'dompurify';
import LinkInteres from './LinkDeInteres.jsx';

import Capacitacion4 from './imagenes/capacitacion_4pasos.png';
import PortalCC from './imagenes/portal_cc.png';
import Victorius from './imagenes/victorius.png';
import CampusCba from './imagenes/campus_cordoba.png';

import IconButton from '@mui/material/IconButton';
import Alerta from '@mui/material/Alert';
import Backdrop from '@mui/material/Backdrop';
import BurbujasLoader from './UIElements/BurbujasLoader';

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
              startIcon={loadingDelete ? <BurbujasLoader small /> : <DeleteIcon />}
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
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh',
            width: '100%'
          }}>
            <BurbujasLoader />
          </Box>
        ) : (
          <>
        {/* CABECERA: Saludo */}
        <Box sx={{
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.01)',
          mb: { xs: 4, md: 8 },
          py: { xs: 4, md: 6 },
          position: 'relative',
          zIndex: 1
        }}>
          <Container maxWidth={false} sx={{ px: { xs: 3, md: 7 } }}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 600,
                fontFamily: "'Geogrotesque Sharp', sans-serif",
                fontSize: {
                  xs: 'clamp(1.6rem, 5vw, 2rem)',
                  sm: 'clamp(2rem, 4vw, 2.4rem)',
                  md: 'clamp(2.5rem, 3.5vw, 3rem)',
                  lg: 'clamp(3rem, 3vw, 3.8rem)',
                },
                color: '#1e1e1e',
                textAlign: 'left',
                letterSpacing: '-1.5px',
                m: 0
              }}
            >
              {nombre ? `¡Hola ${nombre}!` : '¡Hola Usuario!'}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 400,
                fontSize: '19px',
                color: '#64748B',
                mt: 1,
                textAlign: 'left'
              }}
            >
              Te damos la bienvenida al panel de gestión de InscribCórdoba.
            </Typography>
          </Container>
        </Box>

        <Box sx={{ mt: 1 }}>
          <Container maxWidth={false} sx={{ px: { xs: 3, md: 7 } }}>
            {/* Sección de Pasos */}
            <Box sx={{ mb: 6 }}>
              <Box display="flex" alignItems="center" mb={4}>
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{
                    fontWeight: 600,
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
                  { step: 'PASO 1', title: 'Cargar Nota', color: '#009EE3', icon: <NoteAddIcon />, desc: 'Iniciá el proceso cargando la nota de autorización correspondiente.', option: rol === 'ADM' ? 'Autorizaciones' : 'MisNotasAutorizacionIdentifier' },
                  { step: 'PASO 2', title: 'Crear Evento', color: '#009EE3', icon: <AssignmentIcon />, desc: 'Una vez autorizada la nota, completá el formulario del evento de tu capacitación.', option: 'Eventos' },
                  { step: 'PASO 3', title: 'Crear Cohorte', color: '#009EE3', icon: <EventNoteIcon />, desc: 'Completá el formulario de cohorte para agendar las fechas de tu capacitación.', option: 'Formulario' },
                  { step: 'PASO 4', title: 'Ver Calendario', color: '#009EE3', icon: <CalendarMonthIcon />, desc: 'Consultá las cohortes que cargaste en el calendario.', option: 'Calendario' }
                ].map((item, idx) => (
                  <Grid item xs={12} md={6} key={idx} sx={{ display: 'flex' }}>
                    <ButtonBase
                      component="div"
                      onClick={() => setOpcionSeleccionada(item.option)}
                      sx={{
                        width: '100%',
                        height: '100%',
                        textAlign: 'left',
                        display: 'flex',
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
                          p: '20px 24px',
                          width: '100%',
                          height: '100%',
                          borderRadius: '20px',
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid rgba(0, 158, 227, 0.1)',
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
                            width: 58,
                            height: 58,
                            borderRadius: '30px',
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

            {/* Sección de Avisos y Novedades */}
            <Box sx={{ mb: 6, mt: 8 }}>
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  fontWeight: 600,
                  fontFamily: "'Geogrotesque Sharp', sans-serif",
                  color: '#334155',
                  letterSpacing: '-0.5px',
                  fontSize: '1.5rem',
                  mb: 4
                }}
              >
                Avisos y Novedades
              </Typography>

              {loading ? (
                <Grid container spacing={3}>
                  {[1, 2, 3].map((n) => (
                    <Grid item xs={12} sm={6} md={4} key={n}>
                      <Skeleton variant="rectangular" height={160} sx={{ borderRadius: '16px' }} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Grid container spacing={3}>
                  {avisos.map((aviso) => (
                    <Grid
                      item
                      key={aviso.id}
                      xs={12}
                      sm={6}
                      md={avisos.length === 1 ? 6 : (avisos.length === 2 ? 6 : 4)}
                    >
                      <AvisoCompacto
                        aviso={aviso}
                        rol={rol}
                        formatearFecha={formatearFecha}
                        handleDeleteAvisoClick={handleDeleteAvisoClick}
                        lineLimit={3}
                      />
                    </Grid>
                  ))}
                  {avisos.length === 0 && (
                    <Grid item xs={12}>
                      <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: '16px', backgroundColor: '#FFFFFF', border: '1px dashed #E2E8F0' }}>
                        <NotificationsNoneIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 2 }} />
                        <Typography variant="body1" color="#64748B" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                          No hay avisos recientes para mostrar.
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              )}
            </Box>

            {/* Recursos de Interés */}
            <Box sx={{ mt: 10, pb: 6 }}>
              <Typography
                variant="h3"
                component="h2"
                sx={{
                  fontWeight: 600,
                  fontFamily: "'Geogrotesque Sharp', sans-serif",
                  textAlign: 'center',
                  mb: 6,
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
          </Container>
        </Box>
        </>
        )}
      </Box>
    </>
  );
};

// Componente de Aviso Estilo Timeline
const AvisoCompacto = ({ aviso, rol, formatearFecha, handleDeleteAvisoClick, lineLimit = 3 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const textRef = useRef(null);

  useLayoutEffect(() => {
    const checkOverflow = () => {
      if (textRef.current && !isExpanded) {
        const isTruncated = textRef.current.scrollHeight > (textRef.current.clientHeight + 5);
        setCanExpand(isTruncated);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [aviso.contenido, isExpanded, lineLimit]);

  const getColorByIcon = (iconoRaw) => {
    const icono = iconoRaw ? iconoRaw.trim() : 'Información';
    if (icono === 'Importante' || icono === '📌') return '#E2464C'; // Rojo
    if (icono === 'Advertencia' || icono === '⚠️') return '#F59E0B'; // Naranja
    if (icono === 'Información' || icono === 'ℹ️') return '#009EE3'; // Cian
    if (icono === 'Éxito / Logro' || icono === '✅') return '#10B981'; // Verde
    if (icono === 'Anuncio General' || icono === '📢') return '#1E3A8A'; // Azul oscuro
    if (icono === 'Celebración / Evento' || icono === '🎉') return '#D946EF'; // Rosa/Violeta
    if (icono === 'Recordatorio Fecha' || icono === '📅') return '#64748B'; // Gris azulado
    if (icono === 'Tip / Sugerencia' || icono === '💡') return '#EAB308'; // Amarillo
    return '#009EE3';
  };

  const accentColor = getColorByIcon(aviso.icono);

  const getAvisoIcon = (iconoRaw) => {
    const iconStyle = { fontSize: '1.4rem' };
    const icono = iconoRaw ? iconoRaw.trim() : 'Información';

    if (icono === 'Importante' || icono === '📌') return <PushPinIcon sx={iconStyle} />;
    if (icono === 'Advertencia' || icono === '⚠️') return <WarningAmberIcon sx={iconStyle} />;
    if (icono === 'Información' || icono === 'ℹ️') return <InfoOutlinedIcon sx={iconStyle} />;
    if (icono === 'Éxito / Logro' || icono === '✅') return <CheckCircleOutlineIcon sx={iconStyle} />;
    if (icono === 'Anuncio General' || icono === '📢') return <CampaignIcon sx={iconStyle} />;
    if (icono === 'Celebración / Evento' || icono === '🎉') return <CelebrationIcon sx={iconStyle} />;
    if (icono === 'Recordatorio Fecha' || icono === '📅') return <CalendarMonthIcon sx={iconStyle} />;
    if (icono === 'Tip / Sugerencia' || icono === '💡') return <LightbulbIcon sx={iconStyle} />;

    return <InfoOutlinedIcon sx={iconStyle} />;
  };

  return (
    <Box
      sx={{
        width: '100%',
        p: '20px 24px',
        borderRadius: '16px',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          backgroundColor: 'rgba(0, 158, 227, 0.03)',
          '& .timeline-node': {
            backgroundColor: '#009EE3',
            color: '#FFFFFF',
            borderColor: '#009EE3',
            transform: 'scale(1.1)'
          },
          '& .delete-btn': { opacity: 1 },
          '& .btn-arrow': { transform: 'translateX(4px)', opacity: 1 }
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          left: '42px',
          top: 0,
          bottom: 0,
          width: '1px',
          backgroundColor: '#E2E8F0',
          zIndex: 0
        },
        '&:first-of-type::before': { top: '36px' },
        '&:last-of-type::before': { height: '36px' }
      }}
    >
      <Box sx={{ display: 'flex', gap: 4, width: '100%', position: 'relative', zIndex: 1 }}>
        {/* Nodo de Timeline */}
        <Box
          className="timeline-node"
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            color: accentColor,
            flexShrink: 0,
            mt: 4,
            transition: 'all 0.3s ease-in-out',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}
        >
          {getAvisoIcon(aviso.icono)}
        </Box>

        {/* Contenido */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: '#64748B',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  display: 'block',
                  mb: 0.5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {formatearFecha(aviso.created_at)}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontFamily: "'Geogrotesque Sharp', sans-serif",
                  color: '#0F172A',
                  lineHeight: 1.2,
                  fontSize: '1.25rem'
                }}
              >
                {aviso.titulo}
              </Typography>
            </Box>

            {rol === 'ADM' && (
              <IconButton
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteAvisoClick(aviso);
                }}
                size="small"
                sx={{
                  color: '#CBD5E1',
                  '&:hover': { color: '#E2464C' },
                  opacity: 0,
                  transition: 'opacity 0.2s ease'
                }}
              >
                <DeleteIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            )}
          </Box>

          <Box>
            <Typography
              ref={textRef}
              variant="body2"
              sx={{
                color: '#475569',
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
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                sx={{
                  mt: 1.5,
                  textTransform: 'none',
                  p: 0,
                  fontWeight: 700,
                  color: '#009EE3',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '0.95rem',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: 'underline'
                  }
                }}
              >
                {isExpanded ? 'Leer menos' : 'Leer más'}
                <Box
                  component="span"
                  className="btn-arrow"
                  sx={{
                    ml: 0.5,
                    transition: 'all 0.2s ease',
                    display: 'inline-block',
                    opacity: 0.7
                  }}
                >
                  →
                </Box>
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Home;