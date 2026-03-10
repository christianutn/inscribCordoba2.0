import { Box, Grid, Typography } from "@mui/material";

/**
 * Footer component refactored for 100% width and no padding as requested.
 */
export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "primary.main",
        color: "common.white",
        width: "100%",
        p: 0, // No padding
        mt: 'auto',
      }}
    >
      <Grid
        container
        alignItems="center"
        justifyContent="center"
        sx={{ m: 0, width: '100%' }}
      >
        {/* Logo Section */}
        <Grid item xs={12} md={6} sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box
              component="img"
              src="https://campuscordoba.cba.gov.ar/plataforma/pluginfile.php/4217561/mod_folder/content/0/gobierno_blanco.png"
              alt="Gobierno de Córdoba"
              sx={{
                width: "100%",
                maxWidth: "300px",
                height: "auto",
                display: "block",
              }}
            />
          </Box>
        </Grid>

        {/* Info Section */}
        <Grid item xs={12} md={6} sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 'bold',
                mb: 1,
                fontSize: '1rem',
                letterSpacing: '0.01em'
              }}
            >
              Secretaría General de la Gobernación
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Secretaría de Capital Humano
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Subdirección de Capacitación y Formación
              </Typography>
            </Box>

            <Typography
              variant="body2"
              sx={{
                mt: 1,
                fontWeight: 'medium',
                opacity: 0.9
              }}
            >
              soportecampuscordoba@cba.gov.ar
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
