import React from 'react';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import EditNoteIcon from '@mui/icons-material/EditNote';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import GppBadIcon from '@mui/icons-material/GppBad';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';


const FloatingActionButton = React.forwardRef((props, ref) => {
    const { onClick, icon, width, height, disabled } = props;
    const getClassForIcon = (icon) => {
        switch (icon) {
            case 'agregar': return 'fab-agregar';
            case 'editar': return 'fab-editar';
            case 'borrar': return 'fab-borrar';
            case 'descargar': return 'fab-descargar';
            case 'fab-logout': return 'fab-logout';
            case 'volver': return 'fab-volver';
            default: return '';
        }
    };

     const getColor = (icon) => {
        switch (icon) {
            case 'agregar': return 'success';
            case 'editar': return 'warning';
            case 'borrar': return 'error';
            case 'descargar': return 'warning';
            case 'fab-logout': return 'error';
            case 'volver': return 'warning';
            default: return '';
        }
    };

    

    return (
        <Fab
            color={getColor(icon)}
            variant="extended"
            ref={ref}
            className={getClassForIcon(icon)}
            aria-label={icon}
            onClick={onClick}
            disabled={disabled}
            style={{
                width: width || 40,
                height: height || 40,
                color: "#fff"
            }}
            
        >
            {icon === 'agregar' && <AddIcon />}
            {icon === 'editar' && <EditNoteIcon />}
            {icon === 'borrar' && <DeleteForeverIcon />}
            {icon === 'descargar' && <DownloadForOfflineIcon />}
            {icon === 'logout' && <GppBadIcon />}
            {icon === 'volver' && <KeyboardReturnIcon />}
        </Fab>
    );
});

export default FloatingActionButton;
