import React, { useState, useEffect } from 'react';
import { Modal, Box, Card, CardHeader, CardContent, TextField, Button, CircularProgress, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { modalStyle } from '../constants';

const CambiarComentariosModal = ({ open, onClose, onUpdate, loading, selectedRowData }) => {
    const [comentario, setComentario] = useState('');

    useEffect(() => {
        if (open && selectedRowData) {
            setComentario(selectedRowData.originalInstancia?.comentario || '');
        }
    }, [open, selectedRowData]);

    const handleSubmit = () => {
        onUpdate({ comentario });
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{...modalStyle, maxWidth: 500, width: '90%'}}>
                <Card sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
                    <CardHeader
                        title="Cambiar Comentario"
                        action={<IconButton aria-label="Cerrar" onClick={onClose}><CloseIcon /></IconButton>}
                        sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, bgcolor: 'grey.100' }}
                    />
                    <CardContent sx={{ p: 2 }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Comentario"
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                            variant="outlined"
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button onClick={onClose} color="secondary" sx={{ mr: 1 }}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSubmit} disabled={loading} variant="contained">
                                {loading ? <CircularProgress size={24} /> : "Guardar"}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Modal>
    );
};

export default CambiarComentariosModal;
