import React from 'react';
import { Box, Typography, Container, IconButton, Stack } from "@mui/material";
import {
  FacebookRounded as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon
} from "@mui/icons-material";
import logoCba from '../../components/imagenes/gobierno_blanco.png';

/**
 * Footer component - Government of Córdoba Institutional Standards.
 * Layout: 3 columns (Logo | Contact | Social), collapses to vertical on mobile.
 * On md+ stays in a single row using space-between to avoid wrapping when the sidebar is open.
 */
export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#009EE3",
        color: "common.white",
        width: "100%",
        position: 'relative',
        mt: 'auto',
        py: { xs: 8, md: 7 },
      }}
    >
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 3, lg: 5 } }}>
        <Box
          sx={{
            display: 'flex',
            // Columna en mobile, fila en md+ (>900px). Con sidebar (260px) en 13" queda ~760px → column, que es correcto.
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            // space-between distribuye el espacio sin necesitar gap fijo enorme
            justifyContent: { xs: 'center', md: 'center' },
            gap: { xs: 3, md: 15 },
          }}
        >
          {/* Columna Izquierda: Logo - encoge en laptops para no consumir demasiado ancho */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <Box
              component="img"
              src={logoCba}
              alt="Gobierno de Córdoba"
              sx={{
                width: { xs: '220px', md: '170px', lg: '240px' },
                height: "auto",
                display: "block",
              }}
            />
          </Box>

          {/* Columna Central: Información de Contacto - ocupa el espacio central disponible */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              px: { md: 2 },
              flexShrink: 1,
              minWidth: 0, // Permite que se comprima si es necesario
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1rem', md: '0.95rem', lg: '1.1rem' },
                fontFamily: 'Roboto, sans-serif',
                whiteSpace: 'nowrap', // Evita el salto de línea del título
              }}
            >
              Gobierno de la Provincia de Córdoba
            </Typography>
            <Typography
              variant="body1"
              sx={{ mt: 0, fontSize: { xs: '1rem', md: '0.95rem', lg: '1.1rem' } }}
            >
              República Argentina / Tel: 0800 888-1234
            </Typography>
            <Typography
              variant="body1"
              component="a"
              href="mailto:soportecampuscordoba@cba.gov.ar"
              sx={{
                mt: 0,
                color: 'inherit',
                textDecoration: 'none',
                fontSize: { xs: '1rem', md: '0.95rem', lg: '1.1rem' },
                '&:hover': { color: 'primary.dark', transition: 'all 0.2s' }
              }}
            >
              soportecampuscordoba@cba.gov.ar
            </Typography>
          </Box>

          {/* Columna Derecha: Redes Sociales - tamaño fijo, siempre a la derecha */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <Stack direction="row" spacing={0}>
              <IconButton
                sx={{ color: '#FFFFFF', p: { md: '0px' }, transition: 'all 0.3s', '&:hover': { opacity: 0.8, transform: 'scale(1.2)', backgroundColor: 'transparent' } }}
                component="a"
                href="https://es-la.facebook.com/gobdecordoba/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FacebookIcon sx={{ fontSize: { md: '2rem', lg: '2rem' } }} />
              </IconButton>
              <IconButton
                sx={{ color: '#FFFFFF', p: { md: '0px' }, transition: 'all 0.3s', '&:hover': { opacity: 0.8, transform: 'scale(1.2)', backgroundColor: 'transparent' } }}
                component="a"
                href="https://x.com/gobdecordoba?lang=es"
                target="_blank"
                rel="noopener noreferrer"
              >
                <TwitterIcon sx={{ fontSize: { md: '2rem', lg: '2rem' } }} />
              </IconButton>
              <IconButton
                sx={{ color: '#FFFFFF', p: { md: '0px' }, transition: 'all 0.3s', '&:hover': { opacity: 0.8, transform: 'scale(1.2)', backgroundColor: 'transparent' } }}
                component="a"
                href="https://www.instagram.com/cordobaok/?hl=es-la"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon sx={{ fontSize: { md: '2rem', lg: '2rem' } }} />
              </IconButton>
              <IconButton
                sx={{ color: '#FFFFFF', p: { md: '0px' }, transition: 'all 0.3s', '&:hover': { opacity: 0.8, transform: 'scale(1.2)', backgroundColor: 'transparent' } }}
                component="a"
                href="https://www.youtube.com/user/gobiernodecordoba"
                target="_blank"
                rel="noopener noreferrer"
              >
                <YouTubeIcon sx={{ fontSize: { md: '2rem', lg: '2rem' } }} />
              </IconButton>
            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
