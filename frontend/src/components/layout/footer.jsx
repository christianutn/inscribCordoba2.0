import { Box, Typography } from "@mui/material";
import logoCba from '../../components/imagenes/gobierno_blanco.png';

/**
 * Footer component refactored for balanced UI: max-width 1200px, flexbox layout, and centered perfectly.
 */
export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "primary.main",
        color: "common.white",
        width: "100%",
        position: 'relative', // always at bottom or relative to flow
        bottom: 0,
        mt: 'auto', // Pushes footer to end when in flex container
      }}
    >
      {/* Inner container with max-width */}
      <Box
        sx={{
          maxWidth: '1200px',
          mx: 'auto',
          py: 2, // moderate vertical padding
          px: 4, // lateral padding
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          gap: { xs: 4, md: 15 },
        }}
      >
        {/* Logo Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: { xs: "center", md: "flex-end" },
            alignItems: "center",
            flex: 1,
          }}
        >
          <Box
            component="img"
            src={logoCba}
            alt="Gobierno de Córdoba"
            sx={{
              width: "100%",
              maxWidth: "260px",
              height: "auto",
              display: "block",
              mt: 4.5, // baja el logo

            }}
          />
        </Box>

        {/* Info Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: { xs: "center", md: "flex-start" },
            textAlign: { xs: "center", md: "left" },
            flex: 1,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 'bold',
              mb: 1,
              fontSize: '1.08rem',
              letterSpacing: '0.01em'
            }}
          >
            Secretaría General de la Gobernación
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '1rem' }}>
              Secretaría de Capital Humano
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '1rem' }}>
              Subdirección de Capacitación y Formación
            </Typography>
          </Box>

          <Typography
            variant="body2"
            sx={{
              mt: 1,
              fontWeight: 'medium',
              opacity: 0.9, fontSize: '1rem'
            }}
          >
            soportecampuscordoba@cba.gov.ar
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
