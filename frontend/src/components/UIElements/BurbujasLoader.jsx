import React from 'react';
import { Box, styled, keyframes } from '@mui/material';

/**
 * Keyframes para la animación de rebote y pulsación.
 * Crea un efecto de onda fluida.
 */
const wave = keyframes`
  0%, 40%, 100% {
    transform: translateY(0);
    opacity: 0.5;
    scale: 0.8;
  }
  20% {
    transform: translateY(-8px);
    opacity: 1;
    scale: 1.1;
  }
`;

const LoaderContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '20px',
});

const Dot = styled(Box)(({ theme, delay }) => ({
  width: '12px',
  height: '12px',
  backgroundColor: '#009EE3', // Azul Institucional
  borderRadius: '50%',
  animation: `${wave} 1.5s infinite ease-in-out`,
  animationDelay: delay,
  boxShadow: '0 4px 10px rgba(0, 158, 227, 0.2)',
}));

/**
 * BurbujasLoader - Componente de carga moderno estilo 2026.
 * Reemplaza al CircularProgress genérico para una experiencia más fluida y tecnológica.
 * @param {boolean} small - Si es true, el tamaño de las burbujas se reduce.
 */
const BurbujasLoader = ({ small = false }) => {
  const size = small ? '6px' : '12px';
  const gap = small ? '4px' : '8px';

  return (
    <LoaderContainer id="burbujas-loader-container" sx={{ gap }}>
      <Dot
        delay="0s"
        id="dot-1"
        sx={{ width: size, height: size }}
      />
      <Dot
        delay="0.2s"
        id="dot-2"
        sx={{ width: size, height: size }}
      />
      <Dot
        delay="0.4s"
        id="dot-3"
        sx={{ width: size, height: size }}
      />
    </LoaderContainer>
  );
};

export default BurbujasLoader;
