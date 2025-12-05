import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Grid, IconButton, FormControlLabel, Switch
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const MedioInscripcionModal = ({ open, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({
        cod: '',
        nombre: '',
        esVigente: true
    });
    const [errors, setErrors] = useState({});
    const isEditMode = !!initialData;

    useEffect(() => {
        if (open) {
            if (initialData) {
                setFormData({
                    cod: initialData.cod,
                    nombre: initialData.nombre,
                    esVigente: initialData.esVigente === 1 || initialData.esVigente === true
                });
            } else {
                setFormData({
                    cod: '',
                    nombre: '',
                    esVigente: true
                });
            }
            setErrors({});
        }
    }, [open, initialData]);

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.cod) {
            newErrors.cod = 'El código es obligatorio';
        }
        if (!formData.nombre) {
            newErrors.nombre = 'El nombre es obligatorio';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            onSave({
                ...formData,
                esVigente: formData.esVigente ? 1 : 0
            });
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ m: 0, p: 2 }}>
                {isEditMode ? 'Editar Medio de Inscripción' : 'Nuevo Medio de Inscripción'}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    <Grid item xs={12}>
                        <TextField
                            name="cod"
                            label="Código"
                            fullWidth
                            value={formData.cod}
                            onChange={handleChange}
                            disabled={isEditMode}
                            error={!!errors.cod}
                            helperText={errors.cod}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            name="nombre"
                            label="Nombre"
                            fullWidth
                            value={formData.nombre}
                            onChange={handleChange}
                            error={!!errors.nombre}
                            helperText={errors.nombre}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.esVigente}
                                    onChange={handleChange}
                                    name="esVigente"
                                    color="primary"
                                />
                            }
                            label="¿Es Vigente?"
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancelar
                </Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    Guardar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MedioInscripcionModal;
