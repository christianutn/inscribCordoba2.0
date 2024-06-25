import { Card } from '@mui/material';
import ThreePIcon from '@mui/icons-material/ThreeP';
import SchoolIcon from '@mui/icons-material/School';
import SubtituloPrincipal from './fonts/SubtituloPrincipal';
import BotonCircular from './UIElements/BotonCircular';

const CardTutores = () => {

    return (

        <Card className='container-card-tutores' sx={{ height: '100%', padding: 2 }}>

            <div className='card-tutores-encabezado'>
                <ThreePIcon sx={{ mr: 1, height:'32px', width:'32px' }}/>
                <SubtituloPrincipal texto='Tutores'></SubtituloPrincipal>
            </div>

            <div className='card-tutores-datos'>
                <SchoolIcon></SchoolIcon>
                <SubtituloPrincipal texto='Messi, Lionel Andres' fontWeight={500} variant={'h6'}></SubtituloPrincipal>
            </div>
            <div className='card-tutores-datos'>
                <SchoolIcon></SchoolIcon>
                <SubtituloPrincipal texto='Messi, Lionel Andresssssssssssssssss' fontWeight={500} variant={'h6'}></SubtituloPrincipal>
            </div>
            <div className='card-tutores-datos'>
                <SchoolIcon></SchoolIcon>
                <SubtituloPrincipal texto='Messi, Lionel Andres' fontWeight={500} variant={'h6'}></SubtituloPrincipal>
            </div>
          

            <div className='card-tutores-footer'>
                <BotonCircular ></BotonCircular>
            </div>




        </Card>
    )
}

export default CardTutores