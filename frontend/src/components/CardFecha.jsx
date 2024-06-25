import { Card } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Fecha from './Fecha'
import SubtituloPrincipal from './fonts/SubtituloPrincipal';

const CardFecha = ({titulo, mensajeDesde, mensajeHasta}) => {
    return (
        <Card className='container-card-fecha' sx={{ height: '100%', padding: 2 }}>
            
                <div className='card-fecha-encabezado'>
                    <CalendarTodayIcon sx={{ mr: 1 }} />
                    <SubtituloPrincipal texto={titulo}></SubtituloPrincipal>
                </div>
                
                <div className='card-fecha-datos'>
                    <Fecha mensaje={mensajeDesde}></Fecha>
                    <Fecha mensaje={mensajeHasta}></Fecha>
                </div>
            
        </Card>
    );
};

export default CardFecha;
