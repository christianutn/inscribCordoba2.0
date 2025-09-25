import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, CircularProgress
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
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Confirmar"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmacionDialog;
