import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from './UIElements/Button'; // Asegúrate de importar el componente Button si lo usas de Material-UI


const LinkInteres = ({ imagenSrc, titulo, onClick }) => {
  return (
    <div className='link-interes'>
      <div className='img'>
        <img src={imagenSrc} alt={titulo} className="link-interes__image" />
      </div>
      <div className='descripcion'>
        <Typography variant="h6" className="link-interes__title">
          {titulo}
        </Typography>
      </div>
      <div className='btn'>
        <Button
          hanldeOnClick={onClick} // Corrige el nombre del prop a 'onClick'
          mensaje="Ingresar"
        >
        </Button>
      </div>
    </div>
  );
};

export default LinkInteres;
