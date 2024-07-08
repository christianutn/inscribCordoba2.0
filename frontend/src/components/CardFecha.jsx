import { Card } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Fecha from './Fecha';
import SubtituloPrincipal from './fonts/SubtituloPrincipal';
import { forwardRef } from 'react';

const CardFecha = forwardRef(({ titulo, mensajeDesde, mensajeHasta, getFechaDesde, getFechaHasta }, ref) => {
  return (
    <Card className='container-card-fecha' sx={{ height: '100%', padding: 2 }} ref={ref}>
      <div className='card-fecha-encabezado'>
        <CalendarTodayIcon sx={{ mr: 1 }} />
        <SubtituloPrincipal texto={titulo} />
      </div>
      <div className='card-fecha-datos'>
        <Fecha mensaje={mensajeDesde} getFecha={getFechaDesde} />
        <Fecha mensaje={mensajeHasta} getFecha={getFechaHasta} />
      </div>
    </Card>
  );
});

export default CardFecha;

