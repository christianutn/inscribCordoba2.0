import React from 'react';
import BurbujasLoader from '../../UIElements/BurbujasLoader';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography
} from '@mui/material';

const ConfirmacionDialog = ({ open, onClose, onConfirm, title, children, loading }) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Typography>{children}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={onConfirm} variant="contained" color="primary" disabled={loading}>
                    {loading ? <BurbujasLoader small /> : "Confirmar"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmacionDialog;
