import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, Grid, FormControl,
    InputLabel, Select, IconButton, FormHelperText,
    FormControlLabel, Switch
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const AreaModal = ({ open, onClose, onSave, record, auxiliaryData }) => {
    const isEdit = !!record;
    const [formData, setFormData] = useState({
        cod: '',
        nombre: '',
        ministerio: '',
        esVigente: true
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (record) {
            setFormData({
                cod: record.cod || '',
                nombre: record.nombre || '',
                ministerio: record.ministerio || '',
                esVigente: record.esVigente == 1
            });
        } else {
            setFormData({
                cod: '',
                nombre: '',
                ministerio: '',
                esVigente: true
            });
        }
        setErrors({});
    }, [record, open]);

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
        } else if (formData.cod.length > 15) {
            newErrors.cod = 'El código no puede tener más de 15 caracteres';
        }

        if (!formData.nombre) {
            newErrors.nombre = 'El nombre es obligatorio';
        }

        if (!formData.ministerio) {
            newErrors.ministerio = 'El ministerio es obligatorio';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            onSave(formData);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ m: 0, p: 2 }}>
                {isEdit ? 'Editar Área' : 'Nueva Área'}
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
                            disabled={isEdit}
                            error={!!errors.cod}
                            helperText={errors.cod || (isEdit ? "El código no se puede modificar" : "Ingrese el código del área")}
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
                        <FormControl fullWidth error={!!errors.ministerio}>
                            <InputLabel>Ministerio</InputLabel>
                            <Select
                                name="ministerio"
                                value={formData.ministerio}
                                label="Ministerio"
                                onChange={handleChange}
                            >
                                {auxiliaryData.ministerios.map((item) => (
                                    <MenuItem key={item.cod} value={item.cod}>{item.nombre}</MenuItem>
                                ))}
                            </Select>
                            {errors.ministerio && <FormHelperText>{errors.ministerio}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    {isEdit && (
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
                    )}
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

export default AreaModal;
