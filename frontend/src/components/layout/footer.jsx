import { Box, Grid, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "rgb(43, 42, 42)",
        color: "#fff",
        paddingTop: "60px",
        paddingBottom: "20px",
      }}
    >
      <Grid
        container
        spacing={2}
        justifyContent="center"
        alignItems="center"
        sx={{
          maxWidth: "2000px",
          margin: "0 auto",
          textAlign: { xs: "center", md: "left" },
        }}
      >
        {/* Logo */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "center", md: "flex-end" },
              paddingBottom: "25px",
            }}
          >
            <Box
              component="img"
              src="https://campuscordoba.cba.gov.ar/images/logo-gobierno-blanco.png"
              alt="Gobierno de Córdoba"
              sx={{
                width: { xs: "250px", sm: "300px", md: "400px" },
                height: "auto",
              }}
            />
          </Box>
        </Grid>

        {/* Información */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: { xs: "center", md: "flex-start" },
          }}
        >
          <Typography sx={{ mb: 0.5 }}>
            Secretaría General de la Gobernación
          </Typography>
          <Typography sx={{ mb: 0.5 }}>
            Secretaría de Capital Humano
          </Typography>
          <Typography sx={{ mb: 0.5 }}>
            Subdirección de Capacitación y Formación
          </Typography>
          <Typography sx={{ mb: 0 }}>
            soportecampuscordoba@cba.gov.ar
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
