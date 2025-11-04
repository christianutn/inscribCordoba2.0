import React from 'react';
import { Box } from '@mui/material';
import Footer from './footer'; // Asegúrate que la ruta a tu footer es correcta

/**
 * Componente de Layout que asegura que el footer siempre esté al final de la página.
 * @param {object} props - Las propiedades del componente.
 * @param {React.ReactNode} props.children - Los componentes hijos que se renderizarán como contenido principal.
 */
const Layout = ({ children }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh', // Ocupa al menos el 100% de la altura de la ventana
      }}
    >
      {/* Si tienes un Navbar o Header, iría aquí */}
      {/* <Navbar /> */}
      
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>

      <Footer />
    </Box>
  );
};

export default Layout;