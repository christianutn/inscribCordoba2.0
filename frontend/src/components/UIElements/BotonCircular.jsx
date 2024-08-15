import React from 'react';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import EditNoteIcon from '@mui/icons-material/EditNote';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';


export default function FloatingActionButton({ onClick, icon, width, height, justifyContent, alignItems }) {
  const getClassForIcon = (icon) => {
    switch (icon) {
      case 'agregar':
        return 'fab-agregar';
      case 'editar':
        return 'fab-editar';
      case 'borrar':
        return 'fab-borrar';
      case 'descargar':
        return 'fab-descargar';
      default:
        return '';
    }
  };

  return (
    <Box className="boton-circular"
    sx={{ 
      display: 'flex', 
      justifyContent: justifyContent ||'flex-end', 
      alignItems: alignItems ||'flex-end',
      '& > :not(style)': { m: 1 },
      width: '100%',
    }}
    >
      <Fab
        className={getClassForIcon(icon)}
        aria-label={icon}
        onClick={onClick}
        sx={{ width: width || 50, height: height || 50 }}
      >
        {icon === 'agregar' && <AddIcon />}
        {icon === 'editar' && <EditNoteIcon />}
        {icon === 'borrar' && <DeleteForeverIcon />}
        {icon === 'descargar' && <DownloadForOfflineIcon />}
      </Fab>
    </Box>
  );
}
