import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';

const LinkInteres = ({ imagenSrc, titulo, url }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        px: 3,
        py: 4,
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02), 0 10px 20px rgba(0,0,0,0.04), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
        transition: 'all 0.2s cubic-bezier(0.165, 0.84, 0.44, 1)',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-8px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 20px 40px rgba(0, 158, 227, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
          borderColor: 'rgba(0, 158, 227, 0.2)',
          '& .MuiBox-root': {
            transform: 'scale(1.08)',
            filter: 'drop-shadow(0 8px 15px rgba(0, 158, 227, 0.2)) brightness(1.1)'
          },
          '& .action-btn': {
            background: 'linear-gradient(45deg, #009EE3, #00adef)',
            boxShadow: '0 0 15px rgba(0, 158, 227, 0.5)',
            transform: 'scale(1.02)'
          }
        }
      }}
    >
      <Box
        component="img"
        src={imagenSrc}
        alt={titulo}
        sx={{
          maxWidth: '85%',
          height: '90px',
          objectFit: 'contain',
          mb: 2,
          transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
          filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.05))'
        }}
      />
      <Typography
        variant="h6"
        sx={{
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 700,
          fontSize: '1.2rem',
          lineHeight: 1.3,
          textAlign: 'center',
          mb: 3,
          flexGrow: 1,
          color: '#0F172A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          letterSpacing: '-0.02em'
        }}
      >
        {titulo}
      </Typography>
      <Button
        className="action-btn"
        variant="contained"
        component="a"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          fontFamily: 'Poppins, sans-serif',
          py: 1.2,
          width: '160px',
          fontWeight: 700,
          fontSize: '0.95rem',
          color: '#ffffff',
          background: 'linear-gradient(45deg, #009EE3, #007bb1)',
          borderRadius: '50px',
          textTransform: 'none',
          boxShadow: '0 4px 12px rgba(0, 158, 227, 0.2)',
          textDecoration: 'none',
          transition: 'all 0.3s ease'
        }}
      >
        Ingresar
      </Button>
    </Paper>
  );
};

export default LinkInteres;
