// src/components/Home.jsx
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
  Divider, // Para separar avisos o secciones
  Chip, // Opcional para etiquetas o fechas
  Skeleton // Para mostrar mientras cargan los avisos
} from '@mui/material';
import {
  CheckCircleOutline as CheckCircleOutlineIcon,
  InfoOutlined as InfoOutlinedIcon,
  EventAvailable as EventAvailableIcon,
  Article as ArticleIcon,
  ContactMail as ContactMailIcon,
  ArrowForward as ArrowForwardIcon,
  NotificationsActive as NotificationsActiveIcon // Icono para Avisos
} from '@mui/icons-material'; // Importa iconos
import { getAvisos } from '../services/avisos.service';
import DOMPurify from 'dompurify';
import LinkInteres from './LinkDeInteres.jsx'; // Asumiendo que este componente acepta 'sx'

// Importa tus imágenes
import Capacitacion4 from './imagenes/capacitacion_4pasos.png';
import PortalCC from './imagenes/portal_cc.png';
import Victorius from './imagenes/victorius.png';
import CampusCba from './imagenes/campus_cordoba.png';
import LogoFooter from './imagenes/logo_footer.png';

// Estilos reutilizables
const paperStyles = {
  p: 3, // Aumentamos un poco el padding
  borderRadius: 3, // Esquinas más redondeadas
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)', // Sombra más suave
  height: '100%', // Para que las cards en la misma fila tengan igual altura
};

const Home = ({ nombre }) => {
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
        // Aquí podrías manejar el error, por ejemplo, mostrando un mensaje al usuario
      } finally {
        setLoadingAvisos(false);
      }
    })();
  }, []);

  const formatearFecha = fecha =>
    new Date(fecha).toLocaleDateString('es-AR', {
      // Opciones más modernas o personalizadas si quieres
      year: 'numeric',
      month: 'short', // 'short' para abreviar (ej. 'dic.')
      day: 'numeric'
    });

  const linksInteresData = [
      { img: Capacitacion4, title: 'Capacitación 4 Pasos', url: 'https://campusvirtual.cba.gov.ar/course/view.php?id=14629' }, // URL actualizada o placeholder
      { img: Victorius,   title: 'Gestión Victorius', url: 'https://campuscordoba.cba.gov.ar/gestordeplataforma/public/' },
      { img: PortalCC,    title: 'Portal Campus Córdoba', url: 'https://campuscordoba.cba.gov.ar/#page-event-list' },
      { img: CampusCba,   title: 'Plataforma Campus Córdoba', url: 'https://campuscordoba.cba.gov.ar/plataforma/my/' },
    ];


  return (
    <>
      {/* HERO */}
      <Box
        sx={{
          // background: 'linear-gradient(135deg, #00519C 0%, #0d6dba 100%)', // Degradado azul
          background: '#f8f9fa', // Un gris muy claro y limpio
          color: '#333', // Texto oscuro para contraste
          py: { xs: 6, md: 10 }, // Más padding vertical
          textAlign: 'center',
          borderBottom: '1px solid #e0e0e0' // Línea sutil inferior
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1" // Mejor semántica
            sx={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 700,
              mb: 2,
              color: '#00519C', // Color principal para el título
              fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' } // Responsive font size
            }}
          >
            {nombre
              ? `¡Hola ${nombre}!` // Un saludo más cercano
              : 'Bienvenido/a a InscribCórdoba'}
          </Typography>
          <Typography
             variant="h6"
             component="p" // Mejor semántica
             color="text.secondary" // Color secundario de MUI
             sx={{ mb: 4, fontWeight: 400 }}
           >
            Tu espacio central para planificar y consultar las capacitaciones de Campus Córdoba.
          </Typography>
          <Button
            variant="contained"
            size="large"
            href="/capacitaciones" // Asume que tienes una ruta para esto
            endIcon={<ArrowForwardIcon />} // Icono para indicar acción
            sx={{
              borderRadius: '50px', // Botón píldora
              px: 4, // Padding horizontal
              py: 1.5, // Padding vertical
              fontWeight: 600,
              backgroundColor: '#00519C', // Color principal
              '&:hover': {
                backgroundColor: '#003d7a', // Oscurecer en hover
                transform: 'translateY(-2px)', // Ligera elevación
                boxShadow: '0 6px 15px rgba(0, 81, 156, 0.3)'
              },
              transition: 'all 0.3s ease',
            }}
          >
            Ver Capacitaciones
          </Button>
        </Container>
      </Box>

      {/* CONTENIDO PRINCIPAL */}
      <Container sx={{ py: { xs: 4, md: 8 } }}> {/* Ajusta padding */}
        <Grid container spacing={5}> {/* Aumenta espaciado */}

          {/* IZQUIERDA */}
          <Grid item xs={12} md={7} lg={8}> {/* Ajusta distribución */}
            <Paper sx={{ ...paperStyles, p: 4 }}> {/* Padding interno mayor */}
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
                 <ContactMailIcon color="action" sx={{ mr: 1 }}/>
                 <Typography variant="body2" color="text.secondary">
                   Para consultas: <a href="mailto:soportecampuscordoba@cba.gov.ar" style={{ color: '#00519C', textDecoration: 'none', fontWeight: 500 }}>soportecampuscordoba@cba.gov.ar</a>
                 </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* DERECHA: Avisos */}
          <Grid item xs={12} md={5} lg={4}> {/* Ajusta distribución */}
            <Paper
              sx={{
                ...paperStyles,
                p: 2.5, // Padding específico para avisos
                position: 'sticky',
                top: { xs: 20, md: 100 }, // Ajusta el top sticky
                maxHeight: { xs: 'auto', md: 'calc(100vh - 140px)' }, // Altura máxima ajustada
                overflowY: 'auto',
                backgroundColor: '#f5f7fa', // Fondo ligeramente distinto
                // Custom Scrollbar (Webkit only)
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#f1f1f1',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#ccc',
                  borderRadius: '10px',
                  '&:hover': {
                    backgroundColor: '#aaa',
                  }
                }
              }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                <NotificationsActiveIcon sx={{ mr: 1, color: 'primary.main' }}/>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                  Últimos Avisos
                </Typography>
              </Box>

              {loadingAvisos ? (
                // Skeleton Loading
                Array.from(new Array(3)).map((_, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                     <Skeleton variant="text" width="80%" sx={{ mb: 0.5 }}/>
                     <Skeleton variant="text" width="40%" sx={{ fontSize: '0.8rem', mb: 1 }}/>
                     <Skeleton variant="rectangular" height={40} />
                  </Box>
                ))
              ) : avisos.length === 0 ? (
                <Box textAlign="center" p={3}>
                   <InfoOutlinedIcon sx={{ fontSize: 40, color: 'text.secondary', mb:1 }} />
                   <Typography variant="body2" color="text.secondary">
                     No hay avisos para mostrar <br/>en este momento.
                   </Typography>
                </Box>
              ) : (
                avisos.map((aviso, index) => (
                  <React.Fragment key={aviso.id}>
                    <Box sx={{ p: 2, mb: 2, background: '#fff', borderRadius: 2, boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                       <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                         <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                           {aviso.icono || <InfoOutlinedIcon sx={{ fontSize: '1.2rem', verticalAlign: 'bottom', mr: 0.5 }}/>} {/* Icono por defecto */}
                           {aviso.titulo}
                         </Typography>
                         <Chip label={formatearFecha(aviso.created_at)} size="small" variant="outlined" />
                       </Box>
                       <Box
                         sx={{
                           mt: 1,
                           fontSize: '0.9rem', // Tamaño de fuente del contenido del aviso
                           color: 'text.secondary',
                           // Estilos para el contenido HTML si es necesario
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

      {/* LINKS DE INTERÉS */}
      <Box sx={{ backgroundColor: '#f5f7fa', py: { xs: 4, md: 8 } }}> {/* Fondo ligero para separar sección */}
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
                  sx={{ // Estilos aplicados a través del componente LinkInteres (asumiendo que los propaga)
                    width: '100%', // Asegura que ocupe todo el espacio del Grid item
                    textAlign: 'center',
                    p: 2,
                    borderRadius: 3, // Consistente con otras cards
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

      {/* FOOTER */}
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