import React, { useEffect, useState } from 'react';
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
  Skeleton
} from '@mui/material';
import {
  CheckCircleOutline as CheckCircleOutlineIcon,
  InfoOutlined as InfoOutlinedIcon,
  EventAvailable as EventAvailableIcon,
  Article as ArticleIcon,
  ContactMail as ContactMailIcon,
  ArrowForward as ArrowForwardIcon,
  NotificationsActive as NotificationsActiveIcon
} from '@mui/icons-material';
import { getAvisos } from '../services/avisos.service';
import DOMPurify from 'dompurify';
import LinkInteres from './LinkDeInteres.jsx';

import Capacitacion4 from './imagenes/capacitacion_4pasos.png';
import PortalCC from './imagenes/portal_cc.png';
import Victorius from './imagenes/victorius.png';
import CampusCba from './imagenes/campus_cordoba.png';
import LogoFooter from './imagenes/logo_footer.png';

const paperStyles = {
  p: 3,
  borderRadius: 3,
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  height: '100%',
};

const Home = ({ nombre, setOpcionSeleccionada }) => {
  const [avisos, setAvisos] = useState([]);
  const [loadingAvisos, setLoadingAvisos] = useState(true);

  useEffect(() => {
    setLoadingAvisos(true);
    (async () => {
      try {
        const data = await getAvisos();
        setAvisos(
          data
            .filter(a => a.visible)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        );
      } catch (error) {
        console.error("Error fetching avisos:", error);
      } finally {
        setLoadingAvisos(false);
      }
    })();
  }, []);

  const formatearFecha = fecha =>
    new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

  const linksInteresData = [
    { img: Capacitacion4, title: 'Capacitación 4 Pasos', url: 'https://campusvirtual.cba.gov.ar/course/view.php?id=14629' },
    { img: Victorius, title: 'Gestión Victorius', url: 'https://campuscordoba.cba.gov.ar/gestordeplataforma/public/' },
    { img: PortalCC, title: 'Portal Campus Córdoba', url: 'https://campuscordoba.cba.gov.ar/#page-event-list' },
    { img: CampusCba, title: 'Plataforma Campus Córdoba', url: 'https://campuscordoba.cba.gov.ar/plataforma/my/' },
  ];

  return (
    <>
      <Box
        sx={{
          background: '#f8f9fa',
          color: '#333',
          py: { xs: 6, md: 10 },
          textAlign: 'center',
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 700,
              mb: 2,
              color: '#00519C',
              fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' }
            }}
          >
            {nombre
              ? `¡Hola ${nombre}!`
              : 'Bienvenido/a a InscribCórdoba'}
          </Typography>
          <Typography
            variant="h6"
            component="p"
            color="text.secondary"
            sx={{ mb: 4, fontWeight: 400 }}
          >
            Tu espacio central para planificar y consultar las capacitaciones de Campus Córdoba.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => setOpcionSeleccionada('Calendario')}
            endIcon={<ArrowForwardIcon />}
            sx={{
              borderRadius: '50px',
              px: 4,
              py: 1.5,
              fontWeight: 600,
              backgroundColor: '#00519C',
              '&:hover': {
                backgroundColor: '#003d7a',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 15px rgba(0, 81, 156, 0.3)'
              },
              transition: 'all 0.3s ease',
            }}
          >
            Ver Capacitaciones
          </Button>
        </Container>
      </Box>

      <Container sx={{ py: { xs: 4, md: 8 } }}>
        <Grid container spacing={5}>

          <Grid item xs={12} md={12} lg={12}>
            <Paper sx={{ ...paperStyles, p: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                ¿Qué podés hacer aquí?
              </Typography>
              <List>
                <ListItem disablePadding sx={{ mb: 1.5 }}>
                  <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                    <EventAvailableIcon />
                  </ListItemIcon>
                  <ListItemText primary="Planificar las fechas de tus capacitaciones." />
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1.5 }}>
                  <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                    <ArticleIcon />
                  </ListItemIcon>
                  <ListItemText primary="Consultar en tiempo real los cursos registrados." />
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1.5 }}>
                  <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                    <NotificationsActiveIcon />
                  </ListItemIcon>
                  <ListItemText primary="Recibir avisos importantes al instante." />
                </ListItem>
              </List>
              <Divider sx={{ my: 3 }} />
              <Box display="flex" alignItems="center" sx={{ mt: 2 }}>
                <ContactMailIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Para consultas: <a href="mailto:soportecampuscordoba@cba.gov.ar" style={{ color: '#00519C', textDecoration: 'none', fontWeight: 500 }}>soportecampuscordoba@cba.gov.ar</a>
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={12} lg={12}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                height: '100%',
                backgroundColor: '#f0f2f5',
                borderLeft: '5px solid',
                borderColor: 'primary.main',
                boxShadow: '0 8px 24px rgba(0,0,0,0.07)',
                overflowY: 'auto',
                '&::-webkit-scrollbar': { width: '8px' },
                '&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1', borderRadius: '10px' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: '#ccc', borderRadius: '10px', '&:hover': { backgroundColor: '#aaa' } }
              }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                <NotificationsActiveIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Últimos Avisos
                </Typography>
              </Box>

              {loadingAvisos ? (
                Array.from(new Array(3)).map((_, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Skeleton variant="text" width="80%" sx={{ mb: 0.5 }} />
                    <Skeleton variant="text" width="40%" sx={{ fontSize: '0.8rem', mb: 1 }} />
                    <Skeleton variant="rectangular" height={40} />
                  </Box>
                ))
              ) : avisos.length === 0 ? (
                <Box textAlign="center" p={3}>
                  <InfoOutlinedIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No hay avisos para mostrar <br />en este momento.
                  </Typography>
                </Box>
              ) : (
                avisos.map((aviso, index) => (
                  <React.Fragment key={aviso.id}>
                    <Box sx={{ p: 2, mb: 2, background: '#fff', borderRadius: 2, boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                      <Box display="flex" alignItems="center" mb={0.5}>
                        <Chip label={formatearFecha(aviso.created_at)} size="small" variant="outlined" sx={{ mr: 1.5 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {aviso.icono || <InfoOutlinedIcon sx={{ fontSize: '1.2rem', verticalAlign: 'bottom', mr: 0.5 }} />}
                          {aviso.titulo}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          mt: 1,
                          fontSize: '0.9rem',
                          color: 'text.secondary',
                          '& p': { marginBlockStart: '0.5em', marginBlockEnd: '0.5em' },
                          '& a': { color: 'primary.main' },
                        }}
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(aviso.contenido)
                        }}
                      />
                    </Box>
                    {index < avisos.length - 1 && <Divider sx={{ my: 1, borderColor: 'rgba(0,0,0,0.05)' }} />}
                  </React.Fragment>
                ))
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Box sx={{ backgroundColor: '#f5f7fa', py: { xs: 4, md: 8 } }}>
        <Container>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 5 }}>
            Accesos Rápidos
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {linksInteresData.map((link, i) => (
              <Grid item xs={12} sm={6} md={3} key={i} sx={{ display: 'flex' }}>
                <LinkInteres
                  imagenSrc={link.img}
                  titulo={link.title}
                  onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                  sx={{
                    width: '100%',
                    textAlign: 'center',
                    p: 2,
                    borderRadius: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    background: '#fff',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                    }
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ background: '#00519C', color: '#e0e0e0', py: 4, textAlign: 'center' }}>
        <Container>
          <img src={LogoFooter} alt="Campus Córdoba Logo Footer" style={{ maxWidth: 180, marginBottom: '1rem' }} />
          <Typography variant="body2">
            © {new Date().getFullYear()} Gobierno de la Provincia de Córdoba. Todos los derechos reservados.
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.7 }}>
            Campus Córdoba - Plataforma InscribCórdoba
          </Typography>
        </Container>
      </Box>
    </>
  );
};

export default Home;