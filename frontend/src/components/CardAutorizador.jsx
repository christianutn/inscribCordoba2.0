import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import FabAlargado from './UIElements/FabAlargado';
import Subtitulo from "./fonts/SubtituloPrincipal"

export default function CardAutorizador() {
    return (
        <Card sx={{ maxWidth: '100%' }}>
            <CardMedia
                sx={{ height: 250 }}
                image="https://campuscordoba.cba.gov.ar/gestordeplataforma/public/repository/eventos/evento/571.jpg"
                title="green iguana"
            />
            <CardContent>
                <Typography variant='subtitle2'
                    color="#2196F3"
                    sx={{
                        fontFamily: 'Roboto Condensed, sans-serif',
                        fontWeight: 500
                    }}>
                    Autorizador del Curso
                </Typography>

                <Subtitulo texto="Lopez, Fernando" fontWeight={500}></Subtitulo>
            </CardContent>
            <CardActions>
                <FabAlargado mensaje={"Ver Cursos"} icon={"verAutorizador"}/>
            </CardActions>
        </Card>
    );
}
