import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import Formulario from './Formulario';
import ClassIcon from '@mui/icons-material/Class';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Cronograma from "./Cronograma.jsx"
import Cursos from "./Cursos.jsx"
import UpdateIcon from '@mui/icons-material/Update';
import { getMyUser } from "../services/usuarios.service.js";
import AltaBajaModificion from './AltaBajaModificion.jsx';
import BotonCircular from "./UIElements/BotonCircular.jsx";

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
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
  justifyContent: 'flex-end',
}));

export default function Principal() {

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {

      const user = await getMyUser();
      
      if (!user) {
        navigate('/login');
        return;
      }
    }


    )();
  }, [navigate]); // Asegúrate de incluir `navigate` en las dependencias

  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState('');

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleListItemClick = (nombreComponenteARenderizar) => {
    setOpcionSeleccionada(nombreComponenteARenderizar);
  };

  const mostrarOpcion = () => {
    switch (opcionSeleccionada) {
      case "Formulario":
        return <Formulario />
      case "Calendario":
        return <Cronograma />
      case "Cursos":
        return <Cursos />
      case "AltaBajaModificion":
        return <AltaBajaModificion />
      default:
        return <h1>Bienvenido</h1> // Mensaje por defecto o componente
    }
  };

  return (

    <Box sx={{ display: 'flex' }}>

      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            InscribCórdoba
          </Typography>
          <div style={{ width: 60, display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
            <BotonCircular icon={"logout"} onClick={() => {
              // Elimina cualquier token o información de usuario almacenada (localStorage, sessionStorage, etc.)
              localStorage.removeItem('jwt');  // o sessionStorage.removeItem('token');

              // Redirigir al usuario a la página de inicio de sesión
              navigate('/login');
            }} />
          </div>


        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {[["Nueva Cohorte", "Formulario"], ["Ver calendario", "Calendario"], ["Cursos", "Cursos"], ["ABM", "AltaBajaModificion"]].map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton onClick={() => handleListItemClick(item[1])}>
                <ListItemIcon>
                  {index === 0 && <EditCalendarIcon />}
                  {index === 1 && <CalendarMonthIcon />}
                  {index === 2 && <ClassIcon />}
                  {index === 3 && <UpdateIcon />}
                </ListItemIcon>
                <ListItemText primary={item[0]} />
              </ListItemButton>
            </ListItem>

          ))}
        </List>
        <Divider />

      </Drawer>
      <Main open={open} style={{ marginTop: '3%' }}>
        {mostrarOpcion()}
      </Main>
    </Box>


  );
}
