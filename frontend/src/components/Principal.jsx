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
  CircularProgress,
  Tooltip,
  Stack,
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
import { getMyUser } from "../services/usuarios.service.js";
import Footer from './layout/footer';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 260;

const menuConfigByRole = {
  ADM: [
    { label: "Inicio", identifier: "Home", icon: <HouseIcon /> },
    { label: "Tablero ", identifier: "ReporteCursosIdentifier", icon: <AssessmentIcon /> },
    { label: "Ver Calendario", identifier: "Calendario", icon: <CalendarMonthIcon /> },
    { label: "Versión Reducida Administradores", identifier: "VersionReducidaAdministradores", icon: <InsertInvitationIcon /> },
    { label: "Versión Reducida GA", identifier: "VersionReducidaGa", icon: <InsertInvitationIcon /> },
    { label: "Gestionar Autorizaciones", identifier: "Autorizaciones", icon: <DifferenceIcon /> },
    { label: "Gestión", identifier: "Gestion", icon: <SettingsSuggestIcon /> },
    { label: "Restricciones Fechas", identifier: "RestriccionesFechasInicioCursada", icon: <GavelIcon /> },
    { label: "Cargar Nota de Autorización", identifier: "SubaNotaDeAutorizacion", icon: <TaskIcon /> },
    { label: "Crear Evento", identifier: "Eventos", icon: <AddCircleOutlineIcon /> },
    { label: "Crear Cohorte", identifier: "Formulario", icon: <EditCalendarIcon /> },
    { label: "Crear Aviso", identifier: "CrearAviso", icon: <CampaignIcon /> },
    //{ label: "Registro de Asistencias", identifier: "AsistenciasMain", icon: <QrCodeIcon /> },
    { label: "Registro de Asistencias", identifier: "CcAsistenciasMain", icon: <QrCodeIcon /> },
    { label: "Efemérides", identifier: "Efemerides", icon: <EventNoteIcon /> },
  ],
  REF: [
    { label: "Inicio", identifier: "Home", icon: <HouseIcon /> },
    { label: "Ver Calendario", identifier: "Calendario", icon: <CalendarMonthIcon /> },
    { label: "Cargar Nota de Autorización", identifier: "SubaNotaDeAutorizacion", icon: <TaskIcon /> },
    { label: "Crear Evento", identifier: "Eventos", icon: <AddCircleOutlineIcon /> },
    { label: "Crear Cohorte", identifier: "Formulario", icon: <EditCalendarIcon /> },
    { label: "Tablero", identifier: "ReporteCursosIdentifier", icon: <AssessmentIcon /> },
    { label: "Mis Notas", identifier: "MisNotasAutorizacionIdentifier", icon: <TaskIcon /> },
    { label: "Registro de Asistencias", identifier: "CcAsistenciasMain", icon: <QrCodeIcon /> },
    { label: "Efemérides", identifier: "Efemerides", icon: <EventNoteIcon /> },
  ],
  GA: [
    { label: "Inicio", identifier: "Home", icon: <HouseIcon /> },
    { label: "Tablero", identifier: "ReporteCursosIdentifier", icon: <AssessmentIcon /> },
    { label: "Ver Calendario", identifier: "Calendario", icon: <CalendarMonthIcon /> },
    { label: "Versión Reducida GA", identifier: "VersionReducidaGa", icon: <InsertInvitationIcon /> },
    { label: "Gestión", identifier: "Gestion", icon: <SettingsSuggestIcon /> },
    { label: "Crear Evento", identifier: "Eventos", icon: <AddCircleOutlineIcon /> },
    //{ label: "Registro de Asistencias viejo", identifier: "AsistenciasMain", icon: <QrCodeIcon /> },
    //{ label: "Registro de Asistencias", identifier: "CcAsistenciasMain", icon: <QrCodeIcon /> },
    { label: "Efemérides", identifier: "Efemerides", icon: <EventNoteIcon /> },
  ],
};

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
    // Fix: merged duplicate sm breakpoints into one
    [theme.breakpoints.up('sm')]: {
      marginTop: '64px',
      minHeight: 'calc(100vh - 64px)',
    },
    marginTop: theme.mixins.toolbar.minHeight,
    minHeight: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`,
    width: '100%', // Asegura ancho 100% para que se expanda/contraia de forma elástica
    minWidth: 0,
    overflowX: 'hidden',
    marginLeft: `-${drawerWidth}px`,
    // Cerrado: transición rápida con curva sharp (menú salió)
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      marginLeft: 0,
      // Abierto: transición suave con curva easeOut (menú entró)
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  }),
);

const AppBarStyled = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  boxShadow: theme.shadows[1],
  backgroundColor: theme.palette.primary.main,

  // El color de fondo se tomará automáticamente de 'theme.palette.primary.main'
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
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
    Calendario: 'Cronograma',
    VersionReducidaAdministradores: 'Versión Reducida Adm.',
    VersionReducidaGa: 'Versión Reducida GA',
    Autorizaciones: 'Gestionar Autorizaciones',
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
      if (user.necesitaCbioContrasenia == "1") {
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
  }, [user, navigate]);

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
    }, theme.transitions.duration.enteringScreen + 50);
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
    <Box sx={{ display: 'flex', minHeight: '100vh', maxWidth: '100vw', overflowX: 'hidden' }}>
      <CssBaseline />
      <AppBarStyled position="fixed" open={open}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{ mr: 1, ...(open && { display: 'none' }), color: 'white' }}
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
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: 'none',
            boxShadow: theme.shadows[2]
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <Typography variant="h6" sx={{ ml: 1, flexGrow: 1, fontWeight: 600 }}>Menú</Typography>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List sx={{ flexGrow: 1, py: 1 }}>

          {opcionesAMostrar.map((item) => (
            <ListItem key={item.identifier} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                component="a"
                href={`/principal#${item.identifier}`}
                onClick={(e) => handleListItemClick(e, item.identifier)}
                selected={opcionSeleccionada === item.identifier}
                sx={{
                  minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5, py: 1.2, mb: 0.5, borderRadius: 1, mx: 1.5,
                  textDecoration: 'none', color: 'inherit',
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.action.selected, fontWeight: 'fontWeightBold',
                    '& .MuiListItemIcon-root, & .MuiListItemText-primary': { color: theme.palette.primary.main, }
                  },
                  '&:hover': { backgroundColor: theme.palette.action.hover, }
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: opcionSeleccionada === item.identifier ? theme.palette.primary.main : theme.palette.text.secondary }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: opcionSeleccionada === item.identifier ? '600' : '400', fontSize: '0.95rem' }}
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ mb: 2, mt: 'auto' }}>
          <Divider sx={{ mx: 1.5, my: 1 }} />
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton onClick={handleLogout} sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5, py: 1.2, borderRadius: 1, mx: 1.5, color: theme.palette.error.main, '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.08)', } }} >
              <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: 'inherit' }} >
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Cerrar Sesión" sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
        </Box>
      </Drawer>

      <Main open={open} sx={{ display: 'flex', flexDirection: 'column', p: 0 }}>
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {mostrarOpcion()}
        </Box>
        <Footer />
      </Main>
    </Box>
  );
}