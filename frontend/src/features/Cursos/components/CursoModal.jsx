import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, Grid, FormControl,
    InputLabel, Select, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const CursoModal = ({ open, onClose, onSave, record, auxiliaryData }) => {
    const isEdit = !!record;
    const [formData, setFormData] = useState({
        cod: '',
        nombre: '',
        cupo: '',
        codPlataformaDictado: '',
        codMedioInscripcion: '',
        codTipoCapacitacion: '',
        cantidad_horas: '',
        codArea: '',
        esVigente: 0,
        tiene_evento_creado: 0,
        numero_evento: '',
        esta_maquetado: 0,
        esta_configurado: 0,
        aplica_sincronizacion_certificados: 0,
        url_curso: '',
        esta_autorizado: 0,
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (record) {
            setFormData({
                cod: record.cod,
                nombre: record.nombre || '',
                cupo: record.cupo || '',
                codPlataformaDictado: record.detalle_plataformaDictado?.cod || '',
                codMedioInscripcion: record.detalle_medioInscripcion?.cod || '',
                codTipoCapacitacion: record.detalle_tipoCapacitacion?.cod || '',
                cantidad_horas: record.cantidad_horas || '',
                codArea: record.detalle_area?.cod || '',
                esVigente: (!!record.esVigente) ? 1 : 0,
                tiene_evento_creado: (!!record.tiene_evento_creado) ? 1 : 0,
                numero_evento: record.numero_evento || '',
                esta_maquetado: (!!record.esta_maquetado) ? 1 : 0,
                esta_configurado: (!!record.esta_configurado) ? 1 : 0,
                aplica_sincronizacion_certificados: (!!record.aplica_sincronizacion_certificados) ? 1 : 0,
                url_curso: record.url_curso || '',
                esta_autorizado: (!!record.esta_autorizado) ? 1 : 0,
            });
        } else {
            setFormData({
                cod: '',
                nombre: '',
                cupo: '',
                codPlataformaDictado: '',
                codMedioInscripcion: '',
                codTipoCapacitacion: '',
                cantidad_horas: '',
                codArea: '',
                esVigente: 0,
                tiene_evento_creado: 0,
                numero_evento: '',
                esta_maquetado: 0,
                esta_configurado: 0,
                aplica_sincronizacion_certificados: 0,
                url_curso: '',
                esta_autorizado: 0,
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
        if (!formData.cod) newErrors.cod = 'El código es obligatorio';
        if (formData.cod && formData.cod.length > 15) newErrors.cod = 'Máximo 15 caracteres';

        if (!formData.nombre) newErrors.nombre = 'El nombre es obligatorio';
        if (formData.nombre && formData.nombre.length > 250) newErrors.nombre = 'Máximo 250 caracteres';

        if (!formData.cupo) newErrors.cupo = 'El cupo es obligatorio';
        if (formData.cupo && parseInt(formData.cupo) <= 0) newErrors.cupo = 'Debe ser mayor a 0';

        if (!formData.cantidad_horas) newErrors.cantidad_horas = 'La cantidad de horas es obligatoria';
        if (formData.cantidad_horas && parseInt(formData.cantidad_horas) <= 0) newErrors.cantidad_horas = 'Debe ser mayor a 0';

        if (!formData.codPlataformaDictado) newErrors.codPlataformaDictado = 'Requerido';
        if (!formData.codMedioInscripcion) newErrors.codMedioInscripcion = 'Requerido';
        if (!formData.codTipoCapacitacion) newErrors.codTipoCapacitacion = 'Requerido';
        if (!formData.codArea) newErrors.codArea = 'Requerido';

        if (formData.numero_evento && isNaN(formData.numero_evento)) newErrors.numero_evento = 'Debe ser un número';
        if (formData.url_curso && typeof formData.url_curso !== 'string') newErrors.url_curso = 'Debe ser texto';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            onSave(formData);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ m: 0, p: 2 }}>
                {isEdit ? 'Editar Curso' : 'Nuevo Curso'}
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
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="cod"
                            label="Código"
                            fullWidth
                            value={formData.cod}
                            onChange={handleChange}
                            required
                            inputProps={{ maxLength: 15 }}
                            disabled={isEdit}
                            error={!!errors.cod}
                            helperText={errors.cod}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="nombre"
                            label="Nombre"
                            fullWidth
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            inputProps={{ maxLength: 250 }}
                            error={!!errors.nombre}
                            helperText={errors.nombre}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="cupo"
                            label="Cupo"
                            type="number"
                            fullWidth
                            value={formData.cupo}
                            onChange={handleChange}
                            required
                            error={!!errors.cupo}
                            helperText={errors.cupo}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required error={!!errors.codPlataformaDictado}>
                            <InputLabel>Plataforma de Dictado</InputLabel>
                            <Select
                                name="codPlataformaDictado"
                                value={formData.codPlataformaDictado}
                                label="Plataforma de Dictado"
                                onChange={handleChange}
                            >
                                {auxiliaryData.plataformas.map((item) => (
                                    <MenuItem key={item.cod} value={item.cod}>{item.nombre}</MenuItem>
                                ))}
                            </Select>
                            {errors.codPlataformaDictado && <p style={{ color: '#d32f2f', fontSize: '0.75rem', margin: '3px 14px 0' }}>{errors.codPlataformaDictado}</p>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required error={!!errors.codMedioInscripcion}>
                            <InputLabel>Medio de Inscripción</InputLabel>
                            <Select
                                name="codMedioInscripcion"
                                value={formData.codMedioInscripcion}
                                label="Medio de Inscripción"
                                onChange={handleChange}
                            >
                                {auxiliaryData.medios.map((item) => (
                                    <MenuItem key={item.cod} value={item.cod}>{item.nombre}</MenuItem>
                                ))}
                            </Select>
                            {errors.codMedioInscripcion && <p style={{ color: '#d32f2f', fontSize: '0.75rem', margin: '3px 14px 0' }}>{errors.codMedioInscripcion}</p>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required error={!!errors.codTipoCapacitacion}>
                            <InputLabel>Tipo de Capacitación</InputLabel>
                            <Select
                                name="codTipoCapacitacion"
                                value={formData.codTipoCapacitacion}
                                label="Tipo de Capacitación"
                                onChange={handleChange}
                            >
                                {auxiliaryData.tipos.map((item) => (
                                    <MenuItem key={item.cod} value={item.cod}>{item.nombre}</MenuItem>
                                ))}
                            </Select>
                            {errors.codTipoCapacitacion && <p style={{ color: '#d32f2f', fontSize: '0.75rem', margin: '3px 14px 0' }}>{errors.codTipoCapacitacion}</p>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="cantidad_horas"
                            label="Horas"
                            type="number"
                            fullWidth
                            value={formData.cantidad_horas}
                            onChange={handleChange}
                            required
                            error={!!errors.cantidad_horas}
                            helperText={errors.cantidad_horas}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Área</InputLabel>
                            <Select
                                name="codArea"
                                value={formData.codArea}
                                label="Área"
                                onChange={handleChange}
                            >
                                {auxiliaryData.areas.map((item) => (
                                    <MenuItem key={item.cod} value={item.cod}>{item.nombre}</MenuItem>
                                ))}
                            </Select>
                            {errors.codArea && <p style={{ color: '#d32f2f', fontSize: '0.75rem', margin: '3px 14px 0' }}>{errors.codArea}</p>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>¿Está vigente?</InputLabel>
                            <Select
                                name="esVigente"
                                value={formData.esVigente}
                                label="¿Está vigente?"
                                onChange={handleChange}
                            >
                                <MenuItem value={1}>Si</MenuItem>
                                <MenuItem value={0}>No</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>¿Tiene evento creado?</InputLabel>
                            <Select
                                name="tiene_evento_creado"
                                value={formData.tiene_evento_creado}
                                label="¿Tiene evento creado?"
                                onChange={handleChange}
                            >
                                <MenuItem value={1}>Si</MenuItem>
                                <MenuItem value={0}>No</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="numero_evento"
                            label="Número de Evento"
                            type="number"
                            fullWidth
                            value={formData.numero_evento}
                            onChange={handleChange}
                            error={!!errors.numero_evento}
                            helperText={errors.numero_evento}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>¿Está maquetado?</InputLabel>
                            <Select
                                name="esta_maquetado"
                                value={formData.esta_maquetado}
                                label="¿Está maquetado?"
                                onChange={handleChange}
                            >
                                <MenuItem value={1}>Si</MenuItem>
                                <MenuItem value={0}>No</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>¿Está configurado?</InputLabel>
                            <Select
                                name="esta_configurado"
                                value={formData.esta_configurado}
                                label="¿Está configurado?"
                                onChange={handleChange}
                            >
                                <MenuItem value={1}>Si</MenuItem>
                                <MenuItem value={0}>No</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>¿Aplica sincronización certificados?</InputLabel>
                            <Select
                                name="aplica_sincronizacion_certificados"
                                value={formData.aplica_sincronizacion_certificados}
                                label="¿Aplica sincronización certificados?"
                                onChange={handleChange}
                            >
                                <MenuItem value={1}>Si</MenuItem>
                                <MenuItem value={0}>No</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>¿Está autorizado?</InputLabel>
                            <Select
                                name="esta_autorizado"
                                value={formData.esta_autorizado}
                                label="¿Está autorizado?"
                                onChange={handleChange}
                            >
                                <MenuItem value={1}>Si</MenuItem>
                                <MenuItem value={0}>No</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            name="url_curso"
                            label="URL del Curso"
                            fullWidth
                            value={formData.url_curso}
                            onChange={handleChange}
                            error={!!errors.url_curso}
                            helperText={errors.url_curso}
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
        </Dialog >
    );
};

export default CursoModal;
