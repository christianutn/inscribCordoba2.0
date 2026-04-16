import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import {
  Box,
  Drawer,
  CssBaseline,
  AppBar as MuiAppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Stack,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LogoutIcon from '@mui/icons-material/Logout';
import HouseIcon from '@mui/icons-material/House';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GavelIcon from '@mui/icons-material/Gavel';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CampaignIcon from '@mui/icons-material/Campaign';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import InsertInvitationIcon from '@mui/icons-material/InsertInvitation';
import QrCodeIcon from '@mui/icons-material/QrCode';
import TaskIcon from '@mui/icons-material/Task';
import DifferenceIcon from '@mui/icons-material/Difference';
import EventNoteIcon from '@mui/icons-material/EventNote';

import Formulario from './Formulario';
import Cronograma from "./Cronograma.jsx";
import RestriccionesFechasInicioCursada from "../components/RestriccionesFechasInicioCursada.jsx";
import Home from "./Home.jsx";
import NuevoEvento from './NuevoEvento.jsx';
import ReporteCursos from "./ReporteCursosCC.jsx";
import CrearAviso from './CrearAviso.jsx';
import VersionReducidaGa from './VersionReducidaGA.jsx';
import VersionReducidaAdministradores from './VersionReducidaAdministradores.jsx';
import AsistenciasMain from './AsistenciaQR/AsistenciasMain.jsx';
import CcAsistenciasMain from './CcAsistenciaQR/CcAsistenciasMain.jsx';
import SubaNotaDeAutorizacion from './NotaDeAutorizacion/SubaNotaDeAutorizacion.jsx';
import Autorizaciones from './NotaDeAutorizacion/Autorizaciones.jsx';
import MainGestion from './Gestion/MainGestion.jsx';
import VisualizacionMisNotasRefentes from './NotaDeAutorizacion/VisualizacionMisNotasRefentes.jsx';
import GestionEventoYCurso from '../features/EventoYCurso/GestionEventoYCurso.jsx'
import GestionEfemerides from '../features/Efemerides/GestionEfemerides.jsx';
import ReporteAdmin from '../features/ReporteAdmin/ReporteAdmin.jsx';
import Footer from './layout/footer';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useAuth } from '../context/AuthContext';
import config from '../config.js';

const drawerWidth = 260;
const miniDrawerWidth = 72;

const menuConfigByRole = {
  ADM: [
    { label: "Inicio", identifier: "Home", icon: <HouseIcon /> },
    { label: "Tablero ", identifier: "ReporteCursosIdentifier", icon: <AssessmentIcon /> },
    { label: "Reporte Admin", identifier: "ReporteAdmin", icon: <AssessmentIcon /> },
    { label: "Ver Calendario", identifier: "Calendario", icon: <CalendarMonthIcon /> },
    { label: "Versión Reducida ADM", identifier: "VersionReducidaAdministradores", icon: <InsertInvitationIcon /> },
    { label: "Versión Reducida GA", identifier: "VersionReducidaGa", icon: <InsertInvitationIcon /> },
    { label: "Gestionar Autorizaciones", identifier: "Autorizaciones", icon: <DifferenceIcon /> },
    { label: "Gestión", identifier: "Gestion", icon: <SettingsSuggestIcon /> },
    { label: "Restricciones Fechas", identifier: "RestriccionesFechasInicioCursada", icon: <GavelIcon /> },
    { label: "Crear Evento", identifier: "Eventos", icon: <AddCircleOutlineIcon /> },
    { label: "Crear Cohorte", identifier: "Formulario", icon: <EditCalendarIcon /> },
    { label: "Crear Aviso", identifier: "CrearAviso", icon: <CampaignIcon /> },
    ...(config.rolesPermitidosCcAsistencias.includes('ADM') ? [{ label: "Registro de Asistencias", identifier: "CcAsistenciasMain", icon: <QrCodeIcon /> }] : []),
    { label: "Efemérides", identifier: "Efemerides", icon: <EventNoteIcon /> },
  ],
  REF: [
    { label: "Inicio", identifier: "Home", icon: <HouseIcon /> },
    { label: "Tablero", identifier: "ReporteCursosIdentifier", icon: <AssessmentIcon /> },
    { label: "Ver Calendario", identifier: "Calendario", icon: <CalendarMonthIcon /> },
    { label: "Gestionar Nota de Autorización", identifier: "MisNotasAutorizacionIdentifier", icon: <TaskIcon /> },
    { label: "Crear Evento", identifier: "Eventos", icon: <AddCircleOutlineIcon /> },
    { label: "Crear Cohorte", identifier: "Formulario", icon: <EditCalendarIcon /> },
    ...(config.rolesPermitidosCcAsistencias.includes('REF') ? [{ label: "Registro de Asistencias", identifier: "CcAsistenciasMain", icon: <QrCodeIcon /> }] : []),
    { label: "Efemérides", identifier: "Efemerides", icon: <EventNoteIcon /> },
  ],
  GA: [
    { label: "Inicio", identifier: "Home", icon: <HouseIcon /> },
    { label: "Tablero", identifier: "ReporteCursosIdentifier", icon: <AssessmentIcon /> },
    { label: "Ver Calendario", identifier: "Calendario", icon: <CalendarMonthIcon /> },
    { label: "Versión Reducida GA", identifier: "VersionReducidaGa", icon: <InsertInvitationIcon /> },
    { label: "Gestión", identifier: "Gestion", icon: <SettingsSuggestIcon /> },
    { label: "Crear Evento", identifier: "Eventos", icon: <AddCircleOutlineIcon /> },
    ...(config.rolesPermitidosCcAsistencias.includes('GA') ? [{ label: "Registro de Asistencias", identifier: "CcAsistenciasMain", icon: <QrCodeIcon /> }] : []),
    { label: "Efemérides", identifier: "Efemerides", icon: <EventNoteIcon /> },
  ],
};

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  marginTop: '64px',
  width: '100%',
  overflowX: 'hidden',
  transition: theme.transitions.create(['margin', 'width'], {
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    duration: 350,
  }),
}));

const AppBarStyled = styled(MuiAppBar)(({ theme }) => ({
  // El zIndex + 1 lo pone por encima del menú lateral
  zIndex: theme.zIndex.drawer + 1,
  boxShadow: theme.shadows[1],
  backgroundColor: theme.palette.primary.main,
  width: '100%', // Ocupa todo el ancho siempre
  transition: theme.transitions.create(['margin', 'width'], {
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    duration: 350,
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
}));

export default function Principal() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(true);
  const [opcionesAMostrar, setOpcionesAMostrar] = useState([]);

  // Determina la sección inicial: primero hash de URL, luego sessionStorage, fallback Home
  const getInitialSection = useCallback(() => {
    const hash = location.hash?.replace('#', '');
    if (hash) return hash;
    return sessionStorage.getItem('opcionSeleccionada') || 'Home';
  }, [location.hash]);

  const [opcionSeleccionada, setOpcionSeleccionadaState] = useState(getInitialSection);

  // Wrapper que persiste la sección activa en sessionStorage y actualiza el hash
  const setOpcionSeleccionada = useCallback((identifier) => {
    sessionStorage.setItem('opcionSeleccionada', identifier);
    setOpcionSeleccionadaState(identifier);
    // Actualiza el hash sin recargar la página
    window.history.replaceState(null, '', `/principal#${identifier}`);
  }, []);

  const titulosSeccion = {
    Home: 'Inicio',
    ReporteCursosIdentifier: 'Tablero',
    ReporteAdmin: 'Reporte Admin',
    Calendario: 'Cronograma',
    VersionReducidaAdministradores: 'Versión Reducida Adm.',
    VersionReducidaGa: 'Versión Reducida GA',
    Autorizaciones: 'Gestión Autorizaciones',
    Gestion: 'Gestión',
    RestriccionesFechasInicioCursada: 'Restricciones Fechas',
    SubaNotaDeAutorizacion: 'Cargar Nota',
    Eventos: 'Crear Evento',
    Formulario: 'Crear Cohorte',
    CrearAviso: 'Crear Aviso',
    AsistenciasMain: 'Registro de Asistencia',
    CcAsistenciasMain: 'Registro de Asistencia',
    MisNotasAutorizacionIdentifier: 'Mis Notas',
    GestionEventoYCurso: 'Gestión Evento/Curso',
    Efemerides: 'Efemérides'
  };

  useDocumentTitle(titulosSeccion[opcionSeleccionada] || 'Inicio');

  useEffect(() => {
    if (user) {
      if (user.necesitaCbioContrasenia === "1") {
        navigate('/cambiarContrasenia');
        return;
      }

      const userRol = user.rol;
      const optionsForRole = menuConfigByRole[userRol] || [];
      setOpcionesAMostrar(optionsForRole);

      const currentOptionIsValid = optionsForRole.some(opt => opt.identifier === opcionSeleccionada);
      if (!currentOptionIsValid && optionsForRole.length > 0) {
        setOpcionSeleccionada(optionsForRole.find(opt => opt.identifier === "Home") ? "Home" : optionsForRole[0].identifier);
      }
    }
  }, [user, navigate, opcionSeleccionada, setOpcionSeleccionada]);

  // En mobile, cerrar el drawer al cambiar el breakpoint
  useEffect(() => {
    if (isMobile && open) {
      setOpen(false);
    }
  }, [isMobile]);

  // Asegura que al cambiar de sección el scroll se resetee al inicio de la página
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [opcionSeleccionada]);

  // Dispara resize 300ms después del cambio de sidebar para que gráficos y
  // tablas recalculen su ancho real una vez terminada la animación.
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 400);
    return () => clearTimeout(timer);
  }, [open, theme.transitions.duration.enteringScreen]);

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  const handleListItemClick = (e, identifier) => {
    e.preventDefault(); // Prevenir navegación del <a>, manejar por SPA
    setOpcionSeleccionada(identifier);
    if (window.innerWidth < theme.breakpoints.values.sm) {
      handleDrawerClose();
    }
  };

  const handleLogout = () => {
    logout(true);
  };

  const mostrarOpcion = () => {
    switch (opcionSeleccionada) {
      case "Formulario": return <Formulario />;
      case "Calendario": return <Cronograma user={user} />;
      case "Gestion": return <MainGestion user={user} />;
      case "RestriccionesFechasInicioCursada": return <RestriccionesFechasInicioCursada sidebarOpen={open} />;
      case "Eventos": return <NuevoEvento />;
      case "GestionEventoYCurso": return <GestionEventoYCurso />;
      case "ReporteCursosIdentifier": return <ReporteCursos sidebarOpen={open} />;
      case "ReporteAdmin": return <ReporteAdmin />;
      case "CrearAviso": return <CrearAviso />;
      case "AsistenciasMain": return <AsistenciasMain />;
      case "CcAsistenciasMain": return <CcAsistenciasMain />;
      case "VersionReducidaGa": return <VersionReducidaGa />;
      case "VersionReducidaAdministradores": return <VersionReducidaAdministradores />;
      case "SubaNotaDeAutorizacion": return <SubaNotaDeAutorizacion setOpcionSeleccionada={setOpcionSeleccionada} />;
      case "Autorizaciones": return <Autorizaciones />;
      case "MisNotasAutorizacionIdentifier": return <VisualizacionMisNotasRefentes />;
      case "Efemerides": return <GestionEfemerides modo="carga" user={user} />;
      case "Home":
      default: return <Home nombre={user?.nombre} rol={user?.rol} setOpcionSeleccionada={setOpcionSeleccionada} sidebarOpen={open} />;
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      <CssBaseline />
      <AppBarStyled position="fixed" open={open}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={() => setOpen(!open)}
              edge="start"
              sx={{ mr: 1, color: 'white', display: { xs: 'flex', md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          </Stack>

          <Typography variant="h5" noWrap component="div" sx={{ fontWeight: 600, flexGrow: 1, textAlign: 'left' }} >
            InscribCórdoba
          </Typography>

          <Stack direction="row" alignItems="center" spacing={1}>
            {user && (
              <Typography
                variant="body2"
                sx={{
                  display: { xs: 'none', md: 'block' },
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '16px',
                  fontWeight: 500,
                  letterSpacing: '0.02em'
                }}
              >
                {user.nombre} ({user.rol})
              </Typography>
            )}
            <Tooltip title="Cerrar Sesión">
              <IconButton color="inherit" onClick={handleLogout} sx={{ color: 'white' }}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBarStyled>

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          width: open ? drawerWidth : (isMobile ? 0 : miniDrawerWidth),
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          transition: theme.transitions.create('width', {
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            duration: 350,
          }),
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : (isMobile ? 0 : miniDrawerWidth),
            boxSizing: 'border-box',
            borderRight: '1px solid #E0E0E0',
            // --- ESTOS CAMBIOS SON LOS QUE EVITAN SOLAPAMIENTOS Y GAPS ---
            marginTop: isMobile ? '56px' : '64px', // Ajuste dinámico para mobile (56px) y desktop (64px)
            height: isMobile ? 'calc(100% - 56px)' : 'calc(100% - 64px)', 
            // -----------------------------------------------------
            transition: theme.transitions.create('width', {
              easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
              duration: 350,
            }),
            overflowX: 'hidden',
            // Scrollbar modern refinements
            scrollbarWidth: 'thin',
            scrollbarColor: `#E2E8F0 transparent`,
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#CBD5E1',
              borderRadius: '10px',
              border: '2px solid transparent',
              backgroundClip: 'content-box',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: '#009EE3 !important',
            },
          },
        }}
      >
        <DrawerHeader sx={{
          justifyContent: isMobile ? 'flex-start' : (open ? 'space-between' : 'center'),
          px: open ? 2 : 0,
          minHeight: '64px !important', 
          backgroundColor: isMobile ? '#F8F9FA' : 'transparent',
          borderBottom: isMobile ? '1px solid #E2E8F0' : 'none',
        }}>
          {open && (
            <Typography variant="h6" sx={{ 
              ml: isMobile ? 1.5 : 1, 
              fontWeight: 700, 
              color: '#1E293B', 
              fontSize: '0.9rem',
              textAlign: 'left',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Menú
            </Typography>
          )}
          <IconButton onClick={() => setOpen(!open)} sx={{
            p: '4px',
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
            transition: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)',
            display: { xs: 'none', md: 'inline-flex' }
          }}>
            {open ? <MenuIcon sx={{ color: '#1e293b', fontSize: '1.2rem' }} /> : <MenuIcon sx={{ color: '#1e293b', fontSize: '1.2rem' }} />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List sx={{ flexGrow: 1, py: 1 }}>

          {opcionesAMostrar.map((item) => (
            <ListItem key={item.identifier} disablePadding sx={{ display: 'block' }}>
              <Tooltip title={!open ? item.label : ""} placement="right" arrow>
                <ListItemButton
                  component="a"
                href={`/principal#${item.identifier}`}
                onClick={(e) => handleListItemClick(e, item.identifier)}
                selected={opcionSeleccionada === item.identifier}
                sx={{
                  minHeight: 44,
                  justifyContent: open ? 'initial' : 'center',
                  px: open ? 2.5 : 0,
                  py: 0.8,
                  mb: 0.4,
                  borderRadius: open ? '50px' : '12px',
                  mx: open ? 1.2 : 'auto',
                  width: open ? 'auto' : 44,
                  textDecoration: 'none',
                  color: '#475569',
                  transition: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(0, 158, 227, 0.08)',
                    color: '#009EE3',
                    '& .MuiListItemIcon-root': {
                      color: '#009EE3',
                    },
                    '& .MuiListItemText-primary': {
                      color: '#009EE3',
                      fontWeight: 600,
                      display: open ? 'block' : 'none',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(0, 158, 227, 0.12)',
                    }
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(0, 158, 227, 0.04)',
                    color: opcionSeleccionada === item.identifier ? '#009EE3' : '#0F172A',
                    '& .MuiListItemIcon-root': {
                      color: opcionSeleccionada === item.identifier ? '#009EE3' : '#0F172A',
                    }
                  }
                }}
              >
                <ListItemIcon sx={{
                  minWidth: 0,
                  mr: open ? 2 : 0,
                  justifyContent: 'center',
                  color: opcionSeleccionada === item.identifier ? '#009EE3' : '#64748B',
                  transition: 'color 350ms cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: opcionSeleccionada === item.identifier ? 600 : 500,
                    fontSize: '0.875rem',
                    fontFamily: "'Poppins', 'Roboto', sans-serif",
                  }}
                  sx={{
                    display: open ? 'block' : 'none',
                    opacity: open ? 1 : 0,
                    transition: 'opacity 350ms cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>

        <Box sx={{ mb: 2, mt: 'auto' }}>
          <Divider sx={{ mx: 1.5, my: 1 }} />
          <ListItem disablePadding sx={{ display: 'block' }}>
            <Tooltip title={!open ? "Cerrar Sesión" : ""} placement="right" arrow>
              <ListItemButton
                onClick={handleLogout}
              sx={{
                minHeight: 44,
                justifyContent: open ? 'initial' : 'center',
                px: open ? 2.5 : 0,
                py: 0.8,
                borderRadius: open ? '50px' : '12px',
                mx: open ? 1.2 : 'auto',
                width: open ? 'auto' : 44,
                color: theme.palette.error.main,
                transition: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 0.08)',
                  color: theme.palette.error.dark,
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.error.dark,
                  }
                }
              }}
            >
              <ListItemIcon sx={{
                minWidth: 0,
                mr: open ? 2 : 0,
                justifyContent: 'center',
                color: 'inherit',
                transition: 'color 350ms cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="Cerrar Sesión"
                primaryTypographyProps={{
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  fontFamily: "'Poppins', 'Roboto', sans-serif",
                }}
                sx={{
                  display: open ? 'block' : 'none',
                  opacity: open ? 1 : 0,
                  transition: 'opacity 350ms cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </ListItemButton>
          </Tooltip>
        </ListItem>
        </Box>
      </Drawer>

      <Main open={open}>
        {/* Este Box asegura que el contenido ocupe todo el ancho sin márgenes raros */}
        <Box sx={{ flexGrow: 1, width: '100%' }}>
          {mostrarOpcion()}
        </Box>
        <Footer />
      </Main>
    </Box>
  );
}