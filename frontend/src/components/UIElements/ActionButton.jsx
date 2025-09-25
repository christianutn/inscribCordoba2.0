import React from 'react';
import { Button } from '@mui/material';

// Componente de Botón de Acción Reutilizable para el modal
const ActionButton = ({ onClick, children, ...props }) => (
    <Button size="small" variant="outlined" color="secondary" onClick={onClick} sx={{ ml: 'auto', flexShrink: 0 }} {...props}>
        {children}
    </Button>
);

export default ActionButton;
