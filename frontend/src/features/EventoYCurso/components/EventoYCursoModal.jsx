import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, Grid, FormControl,
    InputLabel, Select, IconButton, Typography, Divider, Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const EventoYCursoModal = ({ open, onClose, onSave, record, auxiliaryData }) => {
    const [formData, setFormData] = useState({
        // Campos del Curso
        curso: '',
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
        // Campos del Evento
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
            const detalleCurso = record.detalle_curso || {};
            setFormData({
                // Campos del Curso (extraídos de detalle_curso del evento)
                curso: record.curso || '',
                nombre: detalleCurso.nombre || '',
                cupo: detalleCurso.cupo || '',
                codPlataformaDictado: detalleCurso.plataforma_dictado || '',
                codMedioInscripcion: detalleCurso.medio_inscripcion || '',
                codTipoCapacitacion: detalleCurso.tipo_capacitacion || '',
                cantidad_horas: detalleCurso.cantidad_horas || '',
                codArea: detalleCurso.area || '',
                esVigente: detalleCurso.esVigente ? 1 : 0,
                tiene_evento_creado: detalleCurso.tiene_evento_creado ? 1 : 0,
                numero_evento: detalleCurso.numero_evento || '',
                esta_maquetado: detalleCurso.esta_maquetado ? 1 : 0,
                esta_configurado: detalleCurso.esta_configurado ? 1 : 0,
                aplica_sincronizacion_certificados: detalleCurso.aplica_sincronizacion_certificados ? 1 : 0,
                url_curso: detalleCurso.url_curso || '',
                esta_autorizado: detalleCurso.esta_autorizado ? 1 : 0,
                // Campos del Evento
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
                curso: '', nombre: '', cupo: '',
                codPlataformaDictado: '', codMedioInscripcion: '',
                codTipoCapacitacion: '', cantidad_horas: '', codArea: '',
                esVigente: 0, tiene_evento_creado: 0, numero_evento: '',
                esta_maquetado: 0, esta_configurado: 0,
                aplica_sincronizacion_certificados: 0, url_curso: '',
                esta_autorizado: 0,
                perfil: '', area_tematica: '', tipo_certificacion: '',
                presentacion: '', objetivos: '', requisitos_aprobacion: '',
                ejes_tematicos: '', certifica_en_cc: 1, disenio_a_cargo_cc: 1
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
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};

        // --- Validaciones del Curso ---
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

        // --- Validaciones del Evento ---
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
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ m: 0, p: 2 }}>
                Editar Evento
                <Typography variant="subtitle2" color="text.secondary">
                    Curso: {cursoNombre} ({record?.curso})
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
                {/* ============================== */}
                {/* SECCIÓN: Datos del Curso       */}
                {/* ============================== */}
                <Typography variant="h6" sx={{ mb: 1, mt: 1, color: 'primary.main' }}>
                    Datos del Curso
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="curso"
                            label="Código"
                            fullWidth
                            value={formData.curso}
                            disabled
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
                        <FormControl fullWidth required error={!!errors.codArea}>
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
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel>¿Está vigente?</InputLabel>
                            <Select
                                name="esVigente"
                                value={formData.esVigente}
                                label="¿Está vigente?"
                                onChange={handleChange}
                            >
                                <MenuItem value={1}>Sí</MenuItem>
                                <MenuItem value={0}>No</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel>¿Tiene evento creado?</InputLabel>
                            <Select
                                name="tiene_evento_creado"
                                value={formData.tiene_evento_creado}
                                label="¿Tiene evento creado?"
                                onChange={handleChange}
                            >
                                <MenuItem value={1}>Sí</MenuItem>
                                <MenuItem value={0}>No</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
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
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel>¿Está maquetado?</InputLabel>
                            <Select
                                name="esta_maquetado"
                                value={formData.esta_maquetado}
                                label="¿Está maquetado?"
                                onChange={handleChange}
                            >
                                <MenuItem value={1}>Sí</MenuItem>
                                <MenuItem value={0}>No</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel>¿Está configurado?</InputLabel>
                            <Select
                                name="esta_configurado"
                                value={formData.esta_configurado}
                                label="¿Está configurado?"
                                onChange={handleChange}
                            >
                                <MenuItem value={1}>Sí</MenuItem>
                                <MenuItem value={0}>No</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel>¿Aplica sincronización certificados?</InputLabel>
                            <Select
                                name="aplica_sincronizacion_certificados"
                                value={formData.aplica_sincronizacion_certificados}
                                label="¿Aplica sincronización certificados?"
                                onChange={handleChange}
                            >
                                <MenuItem value={1}>Sí</MenuItem>
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
                                <MenuItem value={1}>Sí</MenuItem>
                                <MenuItem value={0}>No</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
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

                {/* ============================== */}
                {/* SECCIÓN: Datos del Evento      */}
                {/* ============================== */}
                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
                        Datos del Evento en Victorius
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                        {/* Dropdowns del Evento */}
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

                        {/* Text Areas del Evento */}
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

                        {/* Booleanos del Evento */}
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
                </Box>
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

export default EventoYCursoModal;
