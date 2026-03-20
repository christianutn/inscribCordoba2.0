import React from 'react';
import { Box, Typography, Container, IconButton, Stack } from "@mui/material";
import {
  Facebook as FacebookIcon,
  X as XIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon
} from "@mui/icons-material";
import logoCba from '../../components/imagenes/gobierno_blanco.png';

/**
 * Footer component refactored to Government of Córdoba Institutional Standards.
 * Features a 3-column layout: Identity Logo, Contact Info, and Social Media links.
 */
export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#009EE3", // Azul Institucional GBC
        color: "common.white",
        width: "100%",
        position: 'relative',
        mt: 'auto',
        py: 3,
      }}
    >
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 5 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'center', // Centrado compacto
            gap: { xs: 4, md: 20 }, // Espaciado simétrico entre los 3 bloques
          }}
        >
          {/* Columna Izquierda: Identidad */}
          <Box
            sx={{
              display: "flex",
              alignItems: 'center'
            }}
          >
            <Box
              component="img"
              src={logoCba}
              alt="Gobierno de Córdoba"
              sx={{
                width: "250px",
                height: "auto",
                display: "block",
                mt: { xs: 1, md: 3 },
              }}
            />
          </Box>

          {/* Columna Central: Información de Contacto */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center"
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                opacity: 1,
                fontSize: '1.05rem',
                fontFamily: 'Roboto, sans-serif'
              }}
            >
              Gobierno de la Provincia de Córdoba
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5, fontSize: '1rem' }}>
              República Argentina / Tel: 0800 888-1234
            </Typography>
            <Typography
              variant="body1"
              component="a"
              href="mailto:soportecampuscordoba@cba.gov.ar"
              sx={{
                opacity: 1,
                mt: 1,
                color: 'inherit',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              soportecampuscordoba@cba.gov.ar
            </Typography>
          </Box>

          {/* Columna Derecha: Redes Sociales */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center"
            }}
          >
            <Stack direction="row" spacing={0.5}>
              <IconButton
                sx={{ color: '#FFFFFF' }}
                component="a"
                href="https://es-la.facebook.com/gobdecordoba/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                sx={{ color: '#FFFFFF' }}
                component="a"
                href="https://x.com/gobdecordoba?lang=es"
                target="_blank"
                rel="noopener noreferrer"
              >
                <XIcon />
              </IconButton>
              <IconButton
                sx={{ color: '#FFFFFF' }}
                component="a"
                href="https://www.instagram.com/cordobaok/?hl=es-la"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon />
              </IconButton>
              <IconButton
                sx={{ color: '#FFFFFF' }}
                component="a"
                href="https://www.youtube.com/user/gobiernodecordoba"
                target="_blank"
                rel="noopener noreferrer"
              >
                <YouTubeIcon />
              </IconButton>
            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
