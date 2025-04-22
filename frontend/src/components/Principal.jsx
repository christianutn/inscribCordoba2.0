import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import {
  Box,
  Drawer,
  CssBaseline,
  AppBar as MuiAppBar, // Renombrado para evitar conflicto con la variable AppBar
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress, // Para el estado de carga
  Tooltip, // Para hints en iconos
  Stack, // Para organizar elementos en AppBar/Drawer
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LogoutIcon from '@mui/icons-material/Logout'; // Icono para Cerrar Sesión

// Importar TODOS los iconos posibles para el menú
import HouseIcon from '@mui/icons-material/House';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ClassIcon from '@mui/icons-material/Class';
import GavelIcon from '@mui/icons-material/Gavel';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CampaignIcon from '@mui/icons-material/Campaign'; // Icono más adecuado para "Avisos"
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest'; // Icono genérico para ABM
import ReportIcon from '@mui/icons-material/Report'; // Otro posible para Reporte
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'; // Para "Crear Evento"

// Importar tus componentes de página
import Formulario from './Formulario';
import Cronograma from "./Cronograma.jsx";
import AltaBajaModificion from './AltaBajaModificion.jsx';
import RestriccionesFechasInicioCursada from "../components/RestriccionesFechasInicioCursada.jsx";
import Home from "./Home.jsx";
import NuevoEvento from './NuevoEvento.jsx';
import ReporteCursos from "./ReporteCursosCC.jsx";
import CrearAviso from './CrearAviso.jsx';

// Servicios
import { getMyUser } from "../services/usuarios.service.js";
import { Button } from '@mui/material'; // Usar Button de MUI directamente

const drawerWidth = 260; // Un poco más ancho para mejor espacio

// --- Definición Estructurada de Items del Menú ---
const menuItemsConfig = [
  { label: "Inicio", identifier: "Home", icon: <HouseIcon />, roles: ["ADM", "REF"] },
  { label: "Nueva Cohorte", identifier: "Formulario", icon: <EditCalendarIcon />, roles: ["ADM", "REF"] },
  { label: "Ver Calendario", identifier: "Calendario", icon: <CalendarMonthIcon />, roles: ["ADM", "REF"] },
  { label: "Crear Evento", identifier: "Eventos", icon: <AddCircleOutlineIcon />, roles: ["ADM", "REF"] },
  { label: "Reporte de Cursos", identifier: "ReporteCursosIdentifier", icon: <AssessmentIcon />, roles: ["ADM", "REF"] },
  { label: "Administrar Usuarios/Cursos", identifier: "AltaBajaModificion", icon: <SettingsSuggestIcon />, roles: ["ADM"] }, // Icono y nombre más descriptivo
  { label: "Restricciones Fechas", identifier: "RestriccionesFechasInicioCursada", icon: <GavelIcon />, roles: ["ADM"] },
  { label: "Crear Aviso", identifier: "CrearAviso", icon: <CampaignIcon />, roles: ["ADM"] },
];
// -------------------------------------------------

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: 0, // Inicia sin margen izquierdo
    marginTop: theme.mixins.toolbar.minHeight, // Espacio para el AppBar fijo
    [theme.breakpoints.up('sm')]: {
        marginTop: '64px', // Ajustar si la altura del toolbar es diferente
    },
    backgroundColor: theme.palette.background.default, // Fondo suave para el área de contenido
    minHeight: 'calc(100vh - 64px)', // Asegurar que ocupe al menos toda la altura visible
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: `opx`,
    }),
  }),
);

const AppBarStyled = styled(MuiAppBar, { // Renombrado aquí también
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  // Estilo moderno: Sombra suave, quizás un color diferente
  boxShadow: theme.shadows[1],
  // backgroundColor: theme.palette.background.paper, // O un color específico
  // color: theme.palette.text.primary, // Si cambias el fondo
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between', // Para separar el logo/título del botón de cierre
}));

export default function Principal() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Estado de carga inicial
  const [open, setOpen] = useState(true); // Iniciar abierto por defecto? O false?
  const [opcionSeleccionada, setOpcionSeleccionada] = useState("Home"); // Iniciar en Home
  const [opcionesAMostrar, setOpcionesAMostrar] = useState([]);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const res = await getMyUser();
        if (!res) {
          navigate('/login');
          return;
        }
        setUser(res);

        if (res.necesitaCbioContrasenia == "1") {
          navigate('/cambiarContrasenia');
          return;
        }

        // Filtrar opciones del menú según el rol
        const userRol = res.rol; // "ADM" o "REF"
        const filteredOptions = menuItemsConfig.filter(item =>
          item.roles.includes(userRol)
        );
        setOpcionesAMostrar(filteredOptions);

        // Opcional: si la opción seleccionada actual no está disponible para el rol, ir a Home
        const currentOptionIsValid = filteredOptions.some(opt => opt.identifier === opcionSeleccionada);
        if (!currentOptionIsValid) {
          setOpcionSeleccionada("Home");
        }

      } catch (error) {
        console.error("Error fetching user:", error);
        // Manejar error, quizás redirigir a login o mostrar mensaje
        navigate('/login'); // Redirigir si hay error de autenticación
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]); // Solo depende de navigate

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleListItemClick = (nombreComponenteARenderizar) => {
    setOpcionSeleccionada(nombreComponenteARenderizar);
    // Opcional: cerrar el drawer en pantallas pequeñas al seleccionar item
    if (window.innerWidth < theme.breakpoints.values.sm) {
        handleDrawerClose();
    }
  };

  const handleLogout = () => {
    // Limpiar cualquier dato de sesión
    localStorage.removeItem('jwt'); // O el nombre que uses
    sessionStorage.clear(); // Limpiar sessionStorage también por si acaso

    // Redirigir a login
    navigate('/login');
  };

  const mostrarOpcion = () => {
    // Mostrar spinner mientras carga el usuario y las opciones
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 128px)' }}>
          <CircularProgress size={60} />
        </Box>
      );
    }

    switch (opcionSeleccionada) {
      case "Formulario": return <Formulario cerrarNuevoEvento={true} />; // Prop parece innecesaria aquí si Formulario no es modal
      case "Calendario": return <Cronograma />;
      case "AltaBajaModificion": return <AltaBajaModificion />;
      case "RestriccionesFechasInicioCursada": return <RestriccionesFechasInicioCursada />;
      case "Eventos": return <NuevoEvento />;
      case "ReporteCursosIdentifier": return <ReporteCursos />;
      case "CrearAviso": return <CrearAviso />;
      case "Home": // Asegurarse que Home se renderiza por defecto y cuando se selecciona
      default: return <Home nombre={user?.nombre} />; // Pasar el nombre si está disponible
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBarStyled position="fixed" open={open}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Lado Izquierdo: Botón Menú y Título Sección (opcional) */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                // mr: 2, // Ajustado por Stack spacing
                ...(open && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {/* Mostrar el título de la sección activa */}
              {opcionesAMostrar.find(opt => opt.identifier === opcionSeleccionada)?.label || 'InscribCórdoba'}
            </Typography>
          </Stack>

          {/* Centro: Título Principal (más prominente) */}
          <Typography
            variant="h5" // Un poco más pequeño para balance
            noWrap
            component="div"
            sx={{
              fontWeight: 600,
              flexGrow: 1, // Ocupa espacio disponible
              textAlign: 'center', // Centrar el título
              // Podrías añadir un logo aquí también si quieres
            }}
          >
            InscribCórdoba
          </Typography>

          {/* Lado Derecho: Acciones (ej. Notificaciones, Perfil, Logout) */}
          <Stack direction="row" alignItems="center" spacing={1}>
            {/* Aquí podrías añadir iconos para notificaciones o perfil si los tienes */}
            {user && (
                 <Typography sx={{ display: { xs: 'none', md: 'block' } }}>
                    Hola, {user.nombre} ({user.rol})
                 </Typography>
             )}
            <Tooltip title="Cerrar Sesión">
              <IconButton color="inherit" onClick={handleLogout}>
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
            borderRight: 'none', // Quitar borde si no gusta
            // backgroundColor: '#f8f9fa' // Fondo ligeramente diferente
            boxShadow: theme.shadows[2] // Sombra sutil para el drawer
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
             {/* Puedes poner un Logo o Título aquí */}
             <Typography variant="h6" sx={{ ml: 1, flexGrow: 1, fontWeight: 600 }}>Menú</Typography>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List sx={{ flexGrow: 1, py: 1 }}> {/* py para padding vertical */}
          {opcionesAMostrar.map((item) => (
            <ListItem key={item.identifier} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                onClick={() => handleListItemClick(item.identifier)}
                selected={opcionSeleccionada === item.identifier} // Resalta el item seleccionado
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  py: 1.2, // Aumenta padding vertical para más espacio
                  mb: 0.5, // Pequeño margen inferior
                  borderRadius: 1, // Bordes redondeados
                  mx: 1.5, // Márgenes horizontales
                  '&.Mui-selected': { // Estilo cuando está seleccionado
                    backgroundColor: theme.palette.action.selected,
                    // backgroundColor: 'rgba(0, 81, 156, 0.08)', // Un azul claro transparente
                    fontWeight: 'fontWeightBold',
                     '& .MuiListItemIcon-root, & .MuiListItemText-primary': { // Estilo del icono y texto cuando seleccionado
                        color: theme.palette.primary.main,
                      }
                  },
                   '&:hover': { // Estilo en hover (si no está seleccionado)
                    backgroundColor: theme.palette.action.hover,
                     // backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                    color: opcionSeleccionada === item.identifier ? theme.palette.primary.main : theme.palette.text.secondary, // Color del icono
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                         fontWeight: opcionSeleccionada === item.identifier ? '600' : '400', // Fuente más gruesa si seleccionado
                         fontSize: '0.95rem' // Ajuste fino tamaño fuente
                    }}
                    sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* Sección de Logout en la parte inferior */}
        <Box sx={{ mb: 2, mt: 'auto' }}> {/* Empuja al fondo */}
          <Divider sx={{ mx: 1.5, my: 1 }}/>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              onClick={handleLogout}
               sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  py: 1.2,
                  borderRadius: 1,
                  mx: 1.5,
                  color: theme.palette.error.main, // Color rojo para logout
                  '&:hover': {
                    backgroundColor: 'rgba(211, 47, 47, 0.08)', // Rojo claro en hover
                  }
               }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: 'inherit' // Hereda el color rojo del ListItemButton
                }}
              >
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Cerrar Sesión" sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
        </Box>
      </Drawer>

      {/* El contenido principal se renderiza aquí */}
      <Main open={open}>
        {/* No es necesario DrawerHeader aquí, el padding ya está en Main */}
        {mostrarOpcion()}
      </Main>
    </Box>
  );
}