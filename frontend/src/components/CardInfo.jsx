import { Card } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import SubtituloPrincipal from './fonts/SubtituloPrincipal';

export default function CardInfo({ titulo, dato, height }) {


    return (
        <Card  sx={{ maxWidth: '100%', height: parseInt(height) || '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <SubtituloPrincipal texto={titulo} fontWeight={500}></SubtituloPrincipal>
                        
                <Typography variant='h2'
                    color="#1c7cd5"
                    sx={{
                        fontFamily: 'Roboto Condensed, sans-serif',
                        fontWeight: 500
                    }}>
                    {dato}
                </Typography>

            </CardContent>
        </Card>
    );
}