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
  PushPin as PushPinIcon,
  Delete as DeleteIcon,
  NotificationsNone as NotificationsNoneIcon,
  EventNote as EventNoteIcon,
  Assignment as AssignmentIcon,
  CalendarMonth as CalendarMonthIcon,
  NoteAdd as NoteAddIcon
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
          backgroundColor: '#F3F4F6',
          transition: 'width 0.3s ease-in-out',
          minHeight: 'auto',
          pb: 0
        }}
      >
        <Box sx={{ py: { xs: 4, md: 6 } }}>
          <Container maxWidth={false} sx={{ px: { xs: 2, md: 5 } }}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 600,
                fontFamily: 'Geogrotesque Sharp, sans-serif',
                fontSize: {
                  xs: 'clamp(1.6rem, 5vw, 2rem)',
                  sm: 'clamp(2rem, 4vw, 2.4rem)',
                  md: 'clamp(2.2rem, 3.5vw, 2.8rem)',
                  lg: 'clamp(2.6rem, 3vw, 3.5rem)',
                },
                mb: { xs: 4, md: 6 },
                color: 'primary.main',
                textAlign: 'left',
                letterSpacing: '-2px',
              }}
            >
              {nombre ? `¡Hola ${nombre}!` : '¡Hola Valentina De Los Angeles!'}
            </Typography>

            <Grid container spacing={4}>
              {/* COLUMNA IZQUIERDA: Mi Ruta de Gestión (60%) */}
              <Grid item xs={12} md={7.2}>
                <Box>
                  <Box display="flex" alignItems="center" mb={4}>
                    <Typography
                      variant="h5"
                      component="h2"
                      sx={{
                        fontWeight: 700,
                        fontFamily: 'Geogrotesque Sharp, sans-serif',
                        color: '#374151',
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
                    {/* PASOS: Ahora navegables por teclado y con mayor accesibilidad */}
                    {[
                      { step: 'Paso 1', title: 'Cargar Nota', color: '#009EE3', icon: <NoteAddIcon />, desc: 'Iniciá el proceso cargando la nota de autorización correspondiente.', option: 'SubaNotaDeAutorizacion' },
                      { step: 'Paso 2', title: 'Crear Evento', color: '#009EE3', icon: <AssignmentIcon />, desc: 'Una vez autorizada la nota, completá el formulario del evento de tu capacitación.', option: 'Eventos' },
                      { step: 'Paso 3', title: 'Crear Cohorte', color: '#009EE3', icon: <EventNoteIcon />, desc: 'Completá el formulario de cohorte para agendar las fechas de tu capacitación.', option: 'Formulario' },
                      { step: 'Paso 4', title: 'Ver Calendario', color: '#009EE3', icon: <CalendarMonthIcon />, desc: 'Consultá las cohortes que cargaste en el calendario.', option: 'Calendario' }
                    ].map((item, idx) => (
                      <Grid item xs={12} key={idx}>
                        <ButtonBase
                          component="div"
                          onClick={() => setOpcionSeleccionada(item.option)}
                          aria-label={`${item.step}: ${item.title}. ${item.desc}`}
                          sx={{
                            width: '100%',
                            textAlign: 'left',
                            display: 'block',
                            borderRadius: '16px',
                            transition: 'all 0.2s',
                          }}
                        >
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              borderRadius: '16px',
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #E5E7EB',
                              display: 'flex',
                              alignItems: 'center',
                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                borderColor: item.color
                              }
                            }}
                          >
                            <Box
                              sx={{
                                width: 56,
                                height: 56,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(0, 158, 227, 0.08)',
                                color: 'primary.main',
                                mr: 3,
                                flexShrink: 0
                              }}
                            >
                              {item.icon}
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography
                                variant="overline"
                                sx={{
                                  color: item.color,
                                  fontWeight: 800,
                                  fontFamily: 'Geogrotesque Sharp, sans-serif',
                                  letterSpacing: '1px',
                                  fontSize: '0.75rem',
                                  display: 'block',
                                  lineHeight: 1.5
                                }}
                              >
                                {item.step}
                              </Typography>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 700,
                                  fontFamily: 'Geogrotesque Sharp, sans-serif',
                                  color: '#1A202C',
                                  lineHeight: 1.2,
                                  fontSize: '1.15rem'
                                }}
                              >
                                {item.title}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5, fontFamily: 'Poppins, sans-serif', fontSize: '1rem' }}>
                                {item.desc}
                              </Typography>
                            </Box>
                            <ArrowForwardIcon sx={{ color: '#D1D5DB', ml: 2 }} />
                          </Paper>
                        </ButtonBase>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Grid>

              {/* COLUMNA DERECHA: Panel de Avisos (40%) */}
              <Grid item xs={12} md={4.8}>
                <Paper
                  elevation={0}
                  sx={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    p: 3,
                    border: '1px solid #E5E7EB',
                    height: '100%',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography
                      variant="h6"
                      component="h2"
                      sx={{
                        fontWeight: 700,
                        fontFamily: 'Geogrotesque Sharp, sans-serif',
                        color: '#374151',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        fontSize: '1.1rem'
                      }}
                    >
                      Avisos y Novedades
                    </Typography>
                  </Box>

                  {loading ? (
                    Array.from(new Array(5)).map((_, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Skeleton variant="text" width="70%" />
                        <Skeleton variant="text" width="30%" height={15} />
                        <Divider sx={{ my: 2, opacity: 0.5 }} />
                      </Box>
                    ))
                  ) : (
                    <List disablePadding>
                      {avisos.map((aviso, index) => (
                        <React.Fragment key={aviso.id}>
                          <AvisoCompacto
                            aviso={aviso}
                            rol={rol}
                            formatearFecha={formatearFecha}
                            handleDeleteAvisoClick={handleDeleteAvisoClick}
                          />
                          {index < avisos.length - 1 && <Divider sx={{ my: 2, opacity: 0.6 }} />}
                        </React.Fragment>
                      ))}
                      {avisos.length === 0 && (
                        <Box textAlign="center" py={6}>
                          <NotificationsNoneIcon sx={{ fontSize: 48, color: '#D1D5DB', mb: 2 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                            No hay noticias destacadas hoy.
                          </Typography>
                        </Box>
                      )}
                    </List>
                  )}
                </Paper>
              </Grid>

              {/* SECCIÓN INFERIOR: Accesos Rápidos */}
              <Grid item xs={12}>
                <Box sx={{ mt: 6, pt: 6, borderTop: '1px solid #E5E7EB' }}>
                  <Typography
                    variant="h3"
                    component="h2"
                    sx={{
                      fontWeight: 600,
                      fontFamily: 'Geogrotesque Sharp, sans-serif',
                      textAlign: 'center',
                      mb: 6,
                      color: '#1A202C',
                      textTransform: 'uppercase',
                      letterSpacing: '-1px',
                      fontSize: { xs: '1.4rem', md: '1.8rem' }
                    }}
                  >
                    Accesos Rápidos
                  </Typography>
                  <Grid container spacing={3}>
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

const AvisoCompacto = ({ aviso, rol, formatearFecha, handleDeleteAvisoClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const textRef = useRef(null);

  // Detectar si el texto está truncado físicamente después del renderizado
  useLayoutEffect(() => {
    if (textRef.current && !isExpanded) {
      // Usamos un pequeño margen de 5px para evitar falsos positivos por saltos de línea vacíos o redondeo de fuentes
      const isTruncated = textRef.current.scrollHeight > (textRef.current.clientHeight + 5);
      setCanExpand(isTruncated);
    }
  }, [aviso.contenido, isExpanded]);

  const renderIcon = () => {
    return (
      <Typography sx={{ fontSize: '1.2rem', lineHeight: 1 }}>
        {aviso.icono || '📌'}
      </Typography>
    );
  };

  return (
    <ListItem
      alignItems="flex-start"
      disableGutters
      sx={{
        flexDirection: 'column',
        position: 'relative',
        '&:hover .delete-btn': { opacity: 1 },
        py: 1
      }}
    >
      <Box sx={{ display: 'flex', width: '100%', mb: 0.5, alignItems: 'center' }}>
        <Box
          sx={{
            minWidth: 40,
            height: 40,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 158, 227, 0.05)',
            mr: 2,
            flexShrink: 0
          }}
        >
          {renderIcon()}
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              fontFamily: 'Poppins, sans-serif',
              color: '#1F2937',
              lineHeight: 1.3,
              fontSize: '0.95rem',
              wordBreak: 'break-word'
            }}
          >
            {aviso.titulo}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#9CA3AF',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '0.8rem',
              display: 'block',
              mt: 0.1
            }}
          >
            {formatearFecha(aviso.created_at)}
          </Typography>
        </Box>
        {rol === 'ADM' && (
          <IconButton
            className="delete-btn"
            aria-label="eliminar"
            onClick={() => handleDeleteAvisoClick(aviso)}
            size="small"
            sx={{
              opacity: 0,
              transition: 'opacity 0.2s',
              color: 'error.light',
              ml: 1
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      <Box sx={{ pl: 7, width: '100%' }}>
        <Typography
          ref={textRef}
          variant="body2"
          sx={{
            color: '#4B5563',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '0.98rem',
            lineHeight: 1.6,
            display: isExpanded ? 'block' : '-webkit-box',
            WebkitLineClamp: isExpanded ? 'none' : 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            wordBreak: 'break-word'
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
              mt: 0.5,
              textTransform: 'none',
              p: 0,
              minWidth: 'auto',
              fontWeight: 600,
              color: 'primary.main',
              display: 'inline-flex',
              '&:hover': {
                backgroundColor: 'transparent',
                textDecoration: 'underline'
              }
            }}
          >
            {isExpanded ? 'Ver menos' : 'Ver más'}
          </Button>
        )}
      </Box>
    </ListItem>
  );
};

export default Home;