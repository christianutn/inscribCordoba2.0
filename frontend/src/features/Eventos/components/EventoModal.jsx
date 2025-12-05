import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, Grid, FormControl,
    InputLabel, Select, IconButton, Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const EventoModal = ({ open, onClose, onSave, record, auxiliaryData }) => {
    const [formData, setFormData] = useState({
        curso: '',
        perfil: '',
        area_tematica: '',
        tipo_certificacion: '',
        presentacion: '',
        objetivos: '',
        requisitos_aprobacion: '',
        ejes_tematicos: '',
        certifica_en_cc: 1,
        disenio_a_cargo_cc: 1
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (record) {
            setFormData({
                curso: record.curso || '',
                perfil: record.detalle_perfil?.cod || record.perfil || '',
                area_tematica: record.detalle_areaTematica?.cod || record.area_tematica || '',
                tipo_certificacion: record.detalle_tipoCertificacion?.cod || record.tipo_certificacion || '',
                presentacion: record.presentacion || '',
                objetivos: record.objetivos || '',
                requisitos_aprobacion: record.requisitos_aprobacion || '',
                ejes_tematicos: record.ejes_tematicos || '',
                certifica_en_cc: Number(record.certifica_en_cc) === 0 ? 0 : 1,
                disenio_a_cargo_cc: Number(record.disenio_a_cargo_cc) === 0 ? 0 : 1
            });
        } else {
            setFormData({
                curso: '',
                perfil: '',
                area_tematica: '',
                tipo_certificacion: '',
                presentacion: '',
                objetivos: '',
                requisitos_aprobacion: '',
                ejes_tematicos: '',
                certifica_en_cc: 1,
                disenio_a_cargo_cc: 1
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

        if (!formData.perfil) newErrors.perfil = 'El perfil es obligatorio';
        if (!formData.area_tematica) newErrors.area_tematica = 'El área temática es obligatoria';
        if (!formData.tipo_certificacion) newErrors.tipo_certificacion = 'El tipo de certificación es obligatorio';

        if (!formData.presentacion || formData.presentacion.trim() === '') {
            newErrors.presentacion = 'La presentación es obligatoria';
        }
        if (!formData.objetivos || formData.objetivos.trim() === '') {
            newErrors.objetivos = 'Los objetivos son obligatorios';
        }
        if (!formData.requisitos_aprobacion || formData.requisitos_aprobacion.trim() === '') {
            newErrors.requisitos_aprobacion = 'Los requisitos de aprobación son obligatorios';
        }
        if (!formData.ejes_tematicos || formData.ejes_tematicos.trim() === '') {
            newErrors.ejes_tematicos = 'Los ejes temáticos son obligatorios';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            onSave(formData);
        }
    };

    const cursoNombre = record?.detalle_curso?.nombre || record?.curso || '';

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ m: 0, p: 2 }}>
                Editar Evento
                <Typography variant="subtitle2" color="text.secondary">
                    Curso: {cursoNombre}
                </Typography>
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
                    {/* Dropdowns */}
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth required error={!!errors.perfil}>
                            <InputLabel>Perfil</InputLabel>
                            <Select
                                name="perfil"
                                value={formData.perfil}
                                label="Perfil"
                                onChange={handleChange}
                            >
                                {auxiliaryData.perfiles.map((item) => (
                                    <MenuItem key={item.cod} value={item.cod}>{item.descripcion}</MenuItem>
                                ))}
                            </Select>
                            {errors.perfil && <p style={{ color: '#d32f2f', fontSize: '0.75rem', margin: '3px 14px 0' }}>{errors.perfil}</p>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth required error={!!errors.area_tematica}>
                            <InputLabel>Área Temática</InputLabel>
                            <Select
                                name="area_tematica"
                                value={formData.area_tematica}
                                label="Área Temática"
                                onChange={handleChange}
                            >
                                {auxiliaryData.areasTematicas.map((item) => (
                                    <MenuItem key={item.cod} value={item.cod}>{item.descripcion}</MenuItem>
                                ))}
                            </Select>
                            {errors.area_tematica && <p style={{ color: '#d32f2f', fontSize: '0.75rem', margin: '3px 14px 0' }}>{errors.area_tematica}</p>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth required error={!!errors.tipo_certificacion}>
                            <InputLabel>Tipo de Certificación</InputLabel>
                            <Select
                                name="tipo_certificacion"
                                value={formData.tipo_certificacion}
                                label="Tipo de Certificación"
                                onChange={handleChange}
                            >
                                {auxiliaryData.tiposCertificacion.map((item) => (
                                    <MenuItem key={item.cod} value={item.cod}>{item.descripcion}</MenuItem>
                                ))}
                            </Select>
                            {errors.tipo_certificacion && <p style={{ color: '#d32f2f', fontSize: '0.75rem', margin: '3px 14px 0' }}>{errors.tipo_certificacion}</p>}
                        </FormControl>
                    </Grid>

                    {/* Text Areas */}
                    <Grid item xs={12}>
                        <TextField
                            name="presentacion"
                            label="Presentación"
                            fullWidth
                            multiline
                            rows={4}
                            value={formData.presentacion}
                            onChange={handleChange}
                            required
                            error={!!errors.presentacion}
                            helperText={errors.presentacion}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            name="objetivos"
                            label="Objetivos"
                            fullWidth
                            multiline
                            rows={4}
                            value={formData.objetivos}
                            onChange={handleChange}
                            required
                            error={!!errors.objetivos}
                            helperText={errors.objetivos}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            name="ejes_tematicos"
                            label="Ejes Temáticos"
                            fullWidth
                            multiline
                            rows={4}
                            value={formData.ejes_tematicos}
                            onChange={handleChange}
                            required
                            error={!!errors.ejes_tematicos}
                            helperText={errors.ejes_tematicos}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            name="requisitos_aprobacion"
                            label="Requisitos de Aprobación"
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.requisitos_aprobacion}
                            onChange={handleChange}
                            required
                            error={!!errors.requisitos_aprobacion}
                            helperText={errors.requisitos_aprobacion}
                        />
                    </Grid>

                    {/* Boolean Fields */}
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>¿Certifica en CC?</InputLabel>
                            <Select
                                name="certifica_en_cc"
                                value={formData.certifica_en_cc}
                                label="¿Certifica en CC?"
                                onChange={handleChange}
                            >
                                <MenuItem value={1}>Sí</MenuItem>
                                <MenuItem value={0}>No</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>¿Diseño a cargo de CC?</InputLabel>
                            <Select
                                name="disenio_a_cargo_cc"
                                value={formData.disenio_a_cargo_cc}
                                label="¿Diseño a cargo de CC?"
                                onChange={handleChange}
                            >
                                <MenuItem value={1}>Sí</MenuItem>
                                <MenuItem value={0}>No</MenuItem>
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

export default EventoModal;
