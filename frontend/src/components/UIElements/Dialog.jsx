import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

function MiComponenteConAlerta({setOpenAlertDialog, openAlertDialog, mensaje, titulo}) {

    // Función para cerrar el diálogo de alerta
    const handleCloseAlert = () => {
        setOpenAlertDialog(false);
    }

    return (
        <div>
            {/* --- El Diálogo de Alerta --- */}
            <Dialog
                open={openAlertDialog} // open es una propiedad que indica si el diálogo debe estar visible o no.
                onClose={(event, reason) => {
                    // Evita cerrar el diálogo si se hace clic fuera (opcional)
                    // Puedes quitar esta lógica si quieres que se cierre al hacer clic fuera.
                    if (reason && reason === 'backdropClick') {
                        return;
                    }
                    // Si quieres que Esc cierre el diálogo, puedes dejar solo handleCloseAlert()
                    handleCloseAlert(); // O simplemente no hacer nada para forzar el botón
                }}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                disableEscapeKeyDown // Opcional: evita que la tecla Esc cierre el diálogo
            >
                <DialogTitle id="alert-dialog-title">
                    {titulo || "Cargar titulo por favor..."}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {
                            mensaje || "Cargar mensaje por favor..."
                        }
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    {/* Botón para continuar */}
                    <Button onClick={handleCloseAlert} autoFocus>
                        Continuar
                    </Button>
                    {/* Podrías añadir un botón de Cancelar si fuera necesario */}
                    {/* <Button onClick={() => setOpenAlertDialog(false)}>Cancelar</Button> */}
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default MiComponenteConAlerta;