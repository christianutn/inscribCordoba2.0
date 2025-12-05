import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Autocomplete, Grid, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const AsignacionModal = ({ open, onClose, onSave, auxiliaryData }) => {
    const [formData, setFormData] = useState({
        cuil_usuario: '',
        cod_area: '',
        comentario: ''
    });

    const [selectedArea, setSelectedArea] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (open) {
            setFormData({
                cuil_usuario: '',
                cod_area: '',
                comentario: ''
            });
            setSelectedArea(null);
            setErrors({});
        }
    }, [open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleAreaChange = (event, newValue) => {
        setSelectedArea(newValue);
        setFormData(prev => ({
            ...prev,
            cod_area: newValue ? newValue.cod : ''
        }));
        if (errors.cod_area) {
            setErrors(prev => ({ ...prev, cod_area: null }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.cuil_usuario) {
            newErrors.cuil_usuario = 'El CUIL es obligatorio';
        } else if (!/^\d{11}$/.test(formData.cuil_usuario)) {
            newErrors.cuil_usuario = 'El CUIL debe tener 11 dígitos numéricos';
        }

        if (!formData.cod_area) {
            newErrors.cod_area = 'El área es obligatoria';
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
                Nueva Asignación
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
                            name="cuil_usuario"
                            label="CUIL del Usuario"
                            fullWidth
                            value={formData.cuil_usuario}
                            onChange={handleChange}
                            error={!!errors.cuil_usuario}
                            helperText={errors.cuil_usuario || "Ingrese el CUIL del usuario"}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Autocomplete
                            id="area-selector"
                            options={auxiliaryData.areas}
                            getOptionLabel={(option) => option.nombre}
                            value={selectedArea}
                            onChange={handleAreaChange}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Seleccionar Área"
                                    error={!!errors.cod_area}
                                    helperText={errors.cod_area}
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            name="comentario"
                            label="Comentario (Opcional)"
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.comentario}
                            onChange={handleChange}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancelar
                </Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    Asignar Área
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AsignacionModal;
