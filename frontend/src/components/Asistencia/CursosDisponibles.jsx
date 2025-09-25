import React, { useState } from "react";
import Button from '@mui/material/Button';
import QrCodeIcon from '@mui/icons-material/QrCode';
import EditIcon from '@mui/icons-material/Edit';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';

const CursosDisponibles = () => {


    return (
        <div>
            
            <Button
                type="submit"
                
                variant="contained"
                sx={{
                    mt: 3,
                    mb: 2,
                    bgcolor: '#00519C',
                    color: '#fff',
                    borderRadius: '50px',
                    '&:hover': {
                        bgcolor: '#0A4B7F',
                    }
                }}
            >
                Generar Qr
                <QrCodeIcon sx={{ ml: 1 }}/>
            </Button>

            <Button
                type="submit"
                
                variant="contained"
                sx={{
                    mt: 3,
                    mb: 2,
                    bgcolor: '#D38037',
                    color: '#fff',
                    borderRadius: '50px',
                    '&:hover': {
                        bgcolor: '#91541eff',
                    }
                }}
            >
                Editar
                <EditIcon sx={{ ml: 1 }}/>
            </Button>

            <Button
                type="submit"
                
                variant="contained"
                sx={{
                    mt: 3,
                    mb: 2,
                    bgcolor: '#899DAC',
                    color: '#fff',
                    borderRadius: '50px',
                    '&:hover': {
                        bgcolor: '#535f68ff',
                    }
                }}
            >
                Listado de asistentes
                <FormatListNumberedIcon sx={{ ml: 1 }}/>
                
            </Button>
        </div>
    );
};

export default CursosDisponibles;


