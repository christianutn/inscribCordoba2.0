import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, Grid, FormControl,
    InputLabel, Select, IconButton, FormHelperText
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const UsuarioModal = ({ open, onClose, onSave, record, auxiliaryData }) => {
    const isEdit = !!record;
    const [formData, setFormData] = useState({
        cuil: '',
        area: '',
        rol: '',
        nombre: '',
        apellido: '',
        mail: '',
        celular: '',
        esExcepcionParaFechas: false,
        activo: "",
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (record) {
            setFormData({
                cuil: record.cuil || '',
                area: record.detalle_area?.cod || '',
                rol: record.detalle_rol?.cod || '',
                nombre: record.detalle_persona?.nombre || '',
                apellido: record.detalle_persona?.apellido || '',
                mail: record.detalle_persona?.mail || '',
                celular: record.detalle_persona?.celular || '',
                esExcepcionParaFechas: record.esExcepcionParaFechas == 1,
                activo: record.activo == 1
            });
        } else {
            setFormData({
                cuil: '',
                area: '',
                rol: '',
                nombre: '',
                apellido: '',
                mail: '',
                celular: '',
                esExcepcionParaFechas: false,
                activo: ""
            });
        }
        setErrors({});
    }, [record, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};

        // CUIL: 11 digits, mandatory
        if (!formData.cuil) {
            newErrors.cuil = 'El CUIL es obligatorio';
        } else if (!/^\d{11}$/.test(formData.cuil)) {
            newErrors.cuil = 'El CUIL debe tener 11 dígitos numéricos';
        }

        // Area: max 15 chars, optional
        if (formData.area && formData.area.length > 15) {
            newErrors.area = 'El área no puede tener más de 15 caracteres';
        }

        // Rol: max 15 chars, mandatory
        if (!formData.rol) {
            newErrors.rol = 'El rol es obligatorio';
        } else if (formData.rol.length > 15) {
            newErrors.rol = 'El rol no puede tener más de 15 caracteres';
        }

        // Nombre: mandatory
        if (!formData.nombre) {
            newErrors.nombre = 'El nombre es obligatorio';
        }

        // Apellido: mandatory
        if (!formData.apellido) {
            newErrors.apellido = 'El apellido es obligatorio';
        }

        // Mail: valid email, optional
        if (formData.mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.mail)) {
            newErrors.mail = 'Ingrese un correo electrónico válido';
        }

        // Celular: 10 digits, optional
        if (formData.celular && !/^\d{10}$/.test(formData.celular)) {
            newErrors.celular = 'El celular debe tener 10 dígitos numéricos';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            onSave({
                ...formData,
                originalCuil: record?.cuil,
                activo: formData.activo ? 1 : 0
            });
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ m: 0, p: 2 }}>
                {isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
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
                    {/* CUIL */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="cuil"
                            label="CUIL"
                            fullWidth
                            value={formData.cuil}
                            onChange={handleChange}
                            disabled={isEdit}
                            error={!!errors.cuil}
                            helperText={errors.cuil || (isEdit ? "El CUIL no se puede modificar" : "Ingrese el CUIL del usuario")}
                        />
                    </Grid>

                    {/* Nombre */}
                    <Grid item xs={12} sm={6}>
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

                    {/* Apellido */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="apellido"
                            label="Apellido"
                            fullWidth
                            value={formData.apellido}
                            onChange={handleChange}
                            error={!!errors.apellido}
                            helperText={errors.apellido}
                        />
                    </Grid>

                    {/* Mail */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="mail"
                            label="Email"
                            fullWidth
                            value={formData.mail}
                            onChange={handleChange}
                            error={!!errors.mail}
                            helperText={errors.mail}
                        />
                    </Grid>

                    {/* Celular */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="celular"
                            label="Celular"
                            fullWidth
                            value={formData.celular}
                            onChange={handleChange}
                            error={!!errors.celular}
                            helperText={errors.celular || "10 dígitos numéricos"}
                        />
                    </Grid>

                    {/* Area */}
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={!!errors.area}>
                            <InputLabel>Área</InputLabel>
                            <Select
                                name="area"
                                value={formData.area}
                                label="Área"
                                onChange={handleChange}
                            >
                                <MenuItem value="">
                                    <em>Ninguna</em>
                                </MenuItem>
                                {auxiliaryData.areas.map((item) => (
                                    <MenuItem key={item.cod} value={item.cod}>{item.nombre}</MenuItem>
                                ))}
                            </Select>
                            {errors.area && <FormHelperText>{errors.area}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    {/* Rol */}
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={!!errors.rol}>
                            <InputLabel>Rol</InputLabel>
                            <Select
                                name="rol"
                                value={formData.rol}
                                label="Rol"
                                onChange={handleChange}
                            >
                                {auxiliaryData.roles.map((item) => (
                                    <MenuItem key={item.cod} value={item.cod}>{item.nombre}</MenuItem>
                                ))}
                            </Select>
                            {errors.rol && <FormHelperText>{errors.rol}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    {/* Excepcion Fechas */}
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>¿Es excepción para fechas?</InputLabel>
                            <Select
                                name="esExcepcionParaFechas"
                                value={formData.esExcepcionParaFechas}
                                label="¿Es excepción para fechas?"
                                onChange={handleChange}
                            >
                                <MenuItem value={true}>Si</MenuItem>
                                <MenuItem value={false}>No</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Activo */}
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>¿Es Activo?</InputLabel>
                            <Select
                                name="activo"
                                value={formData.activo}
                                label="¿Es Activo?"
                                onChange={handleChange}
                            >
                                <MenuItem value={true}>Si</MenuItem>
                                <MenuItem value={false}>No</MenuItem>
                            </Select>
                        </FormControl>
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

export default UsuarioModal;
