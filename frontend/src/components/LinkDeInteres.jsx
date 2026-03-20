import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';

const LinkInteres = ({ imagenSrc, titulo, onClick }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        px: 3,
        py: 4,
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        border: '1px solid rgba(0, 90, 135, 0.1)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
          borderColor: '#005A87',
          '& img': {
            transform: 'scale(1.08)',
          }
        }
      }}
    >
      <Box
        component="img"
        src={imagenSrc}
        alt={titulo}
        sx={{
          maxWidth: '100%',
          height: '110px',
          objectFit: 'contain',
          mb: 3,
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
      <Typography
        variant="h6"
        sx={{
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 600,
          fontSize: '1.3rem',
          lineHeight: 1.3,
          textAlign: 'center',
          mb: 4,
          flexGrow: 1,
          color: '#1A1A1A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {titulo}
      </Typography>
      <Button
        variant="contained"
        fullWidth
        onClick={onClick}
        sx={{
          fontFamily: 'Poppins, sans-serif',
          py: 1.1,
          fontWeight: 600,
          fontSize: '1.2rem', // 16px as requested
          color: '#ffffff',
          backgroundColor: '#009EE3',
          borderRadius: '8px',
          textTransform: 'none',
          letterSpacing: '0.5px',
          boxShadow: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: '#0086C2',
            boxShadow: '0 0 20px rgba(0, 158, 227, 0.4)', // Cyan glow
            transform: 'scale(1.02)', // Sutil scale
          }
        }}
      >
        Ingresar
      </Button>
    </Paper>
  );
};

export default LinkInteres;
