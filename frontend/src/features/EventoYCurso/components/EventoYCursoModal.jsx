import React, { useState, useEffect, useMemo } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, Grid, FormControl,
    InputLabel, Select, IconButton, Typography, Divider, Box,
    Alert, Stepper, Step, StepLabel, Chip, Tooltip,
    CircularProgress, Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BlockIcon from '@mui/icons-material/Block';
import RestoreIcon from '@mui/icons-material/Restore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Configuración de la máquina de estados
const ESTADOS = {
    AUT:   { label: 'Autorizado',                  cod: 'AUT',   color: '#7986cb', step: 0 },
    MAQ:   { label: 'Maquetado',                   cod: 'MAQ',   color: '#4db6ac', step: 1 },
    CON:   { label: 'Configurado',                 cod: 'CON',   color: '#81c784', step: 2 },
    PVICT: { label: 'Pendiente carga en Victorius',cod: 'PVICT', color: '#ffb74d', step: 3 },
    EC:    { label: 'Evento cargado en Victorius', cod: 'EC',    color: '#4caf50', step: 4 },
    NVIG:  { label: 'No Vigente',                  cod: 'NVIG',  color: '#ef5350', step: -1 },
};

const FLUJO_NORMAL = ['AUT', 'MAQ', 'CON', 'PVICT', 'EC'];

// Info contextual por estado
const ESTADO_INFO = {
    AUT:   'El curso fue autorizado. El referente debe maquetar el curso y avisar para avanzar.',
    MAQ:   'El curso está maquetado. El equipo debe configurarlo para habilitarlo.',
    CON:   'El curso está configurado y visible para completar el formulario de nuevo evento.',
    PVICT: 'El formulario de evento fue completado. Un usuario GA debe cargar el evento en Victorius.',
    EC:    'El evento fue cargado en Victorius. El proceso está completo.',
    NVIG:  'El curso está dado de baja y no está vigente.',
};

const EstadoStepper = ({ estadoActual, onAvanzar, onRetroceder, onDarDeBaja, onRestaurar, loading }) => {
    const [restaurarTarget, setRestaurarTarget] = useState('');
    const [showRestaurarMenu, setShowRestaurarMenu] = useState(false);

    const esNVIG = estadoActual === 'NVIG';
    const stepActual = ESTADOS[estadoActual]?.step ?? -1;
    const esPrimerEstado = stepActual === 0;
    const esUltimoEstado = stepActual === FLUJO_NORMAL.length - 1;

    return (
        <Paper
            variant="outlined"
            sx={{
                p: 2.5,
                mb: 3,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)',
                borderColor: '#c5cae9'
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                    Estado del Curso
                </Typography>
                <Chip
                    label={ESTADOS[estadoActual]?.label ?? estadoActual}
                    sx={{
                        backgroundColor: ESTADOS[estadoActual]?.color ?? '#9e9e9e',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        px: 1
                    }}
                    icon={<CheckCircleIcon style={{ color: 'white' }} />}
                />
            </Box>

            {/* Stepper visual del flujo normal */}
            {!esNVIG && (
                <Stepper activeStep={stepActual} alternativeLabel sx={{ mb: 2 }}>
                    {FLUJO_NORMAL.map((cod) => (
                        <Step key={cod} completed={stepActual > ESTADOS[cod].step}>
                            <StepLabel
                                StepIconProps={{
                                    style: {
                                        color: stepActual >= ESTADOS[cod].step
                                            ? ESTADOS[cod].color
                                            : undefined
                                    }
                                }}
                            >
                                <Typography variant="caption">{ESTADOS[cod].label}</Typography>
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
            )}

            {/* Info contextual */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2, p: 1.5, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 1 }}>
                <InfoOutlinedIcon fontSize="small" color="action" sx={{ mt: 0.2 }} />
                <Typography variant="body2" color="text.secondary">
                    {ESTADO_INFO[estadoActual] ?? ''}
                </Typography>
            </Box>

            {/* Acciones de estado */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                {/* Retroceder (ADM) */}
                {!esNVIG && !esPrimerEstado && (
                    <Tooltip title="Retroceder al estado anterior (solo ADM)">
                        <span>
                            <Button
                                size="small"
                                variant="outlined"
                                color="warning"
                                startIcon={<ArrowBackIcon />}
                                onClick={onRetroceder}
                                disabled={loading}
                                sx={{ textTransform: 'none' }}
                            >
                                Retroceder estado
                            </Button>
                        </span>
                    </Tooltip>
                )}

                {/* Avanzar */}
                {!esNVIG && !esUltimoEstado && (
                    <Tooltip title={`Avanzar al siguiente estado: ${ESTADOS[FLUJO_NORMAL[stepActual + 1]]?.label}`}>
                        <span>
                            <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                endIcon={<ArrowForwardIcon />}
                                onClick={onAvanzar}
                                disabled={loading}
                                sx={{ textTransform: 'none' }}
                            >
                                Avanzar a: {ESTADOS[FLUJO_NORMAL[stepActual + 1]]?.label}
                            </Button>
                        </span>
                    </Tooltip>
                )}

                {/* Dar de baja (ADM, solo si no es NVIG) */}
                {!esNVIG && (
                    <Tooltip title="Marcar curso como No Vigente (solo ADM)">
                        <span>
                            <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<BlockIcon />}
                                onClick={onDarDeBaja}
                                disabled={loading}
                                sx={{ textTransform: 'none' }}
                            >
                                Dar de baja
                            </Button>
                        </span>
                    </Tooltip>
                )}

                {/* Restaurar (solo si NVIG) */}
                {esNVIG && (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        <FormControl size="small" sx={{ minWidth: 220 }}>
                            <InputLabel>Restaurar al estado</InputLabel>
                            <Select
                                value={restaurarTarget}
                                label="Restaurar al estado"
                                onChange={(e) => setRestaurarTarget(e.target.value)}
                            >
                                {FLUJO_NORMAL.map((cod) => (
                                    <MenuItem key={cod} value={cod}>{ESTADOS[cod].label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Tooltip title="Restaurar el curso a un estado activo (solo ADM)">
                            <span>
                                <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    startIcon={<RestoreIcon />}
                                    onClick={() => restaurarTarget && onRestaurar(restaurarTarget)}
                                    disabled={!restaurarTarget || loading}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Restaurar
                                </Button>
                            </span>
                        </Tooltip>
                    </Box>
                )}

                {loading && <CircularProgress size={20} />}
            </Box>
        </Paper>
    );
};

const EventoYCursoModal = ({ open, onClose, onSave, onChangeEstado, record, auxiliaryData, filter }) => {
    const tieneEvento = useMemo(() => record?.detalle_evento != null, [record]);

    const [formData, setFormData] = useState({
        curso: '',
        nombre: '',
        cupo: '',
        codPlataformaDictado: '',
        codMedioInscripcion: '',
        codTipoCapacitacion: '',
        cantidad_horas: '',
        codArea: '',
        aplica_sincronizacion_certificados: 0,
        url_curso: '',
        numero_evento: '',
        // Evento
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
    const [estadoLoading, setEstadoLoading] = useState(false);
    const [estadoFeedback, setEstadoFeedback] = useState(null); // { type: 'success'|'error', msg }
    const [estadoActual, setEstadoActual] = useState('AUT');

    useEffect(() => {
        if (record) {
            const evento = record.detalle_evento;
            setFormData({
                curso: record.cod || '',
                nombre: record.nombre || '',
                cupo: record.cupo || '',
                codPlataformaDictado: record.plataforma_dictado || '',
                codMedioInscripcion: record.medio_inscripcion || '',
                codTipoCapacitacion: record.tipo_capacitacion || '',
                cantidad_horas: record.cantidad_horas || '',
                codArea: record.area || '',
                aplica_sincronizacion_certificados: record.aplica_sincronizacion_certificados ? 1 : 0,
                url_curso: record.url_curso || '',
                numero_evento: record.numero_evento || '',
                perfil: evento?.detalle_perfil?.cod || evento?.perfil || '',
                area_tematica: evento?.detalle_areaTematica?.cod || evento?.area_tematica || '',
                tipo_certificacion: evento?.detalle_tipoCertificacion?.cod || evento?.tipo_certificacion || '',
                presentacion: evento?.presentacion || '',
                objetivos: evento?.objetivos || '',
                requisitos_aprobacion: evento?.requisitos_aprobacion || '',
                ejes_tematicos: evento?.ejes_tematicos || '',
                certifica_en_cc: evento ? (Number(evento.certifica_en_cc) === 0 ? 0 : 1) : 1,
                disenio_a_cargo_cc: evento ? (Number(evento.disenio_a_cargo_cc) === 0 ? 0 : 1) : 1
            });
        } else {
            setFormData({
                curso: '', nombre: '', cupo: '',
                codPlataformaDictado: '', codMedioInscripcion: '',
                codTipoCapacitacion: '', cantidad_horas: '', codArea: '',
                aplica_sincronizacion_certificados: 0, url_curso: '', numero_evento: '',
                perfil: '', area_tematica: '', tipo_certificacion: '',
                presentacion: '', objetivos: '', requisitos_aprobacion: '',
                ejes_tematicos: '', certifica_en_cc: 1, disenio_a_cargo_cc: 1
            });
        }
        setErrors({});
        setEstadoFeedback(null);
        setEstadoActual(record?.estado ?? record?.detalle_estado_curso?.cod ?? 'AUT');
    }, [record, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const hayDatosDeEvento = useMemo(() => !!(
        formData.perfil || formData.area_tematica || formData.tipo_certificacion ||
        formData.presentacion?.trim() || formData.objetivos?.trim() ||
        formData.requisitos_aprobacion?.trim() || formData.ejes_tematicos?.trim()
    ), [formData]);

    const validate = () => {
        const newErrors = {};
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

        if (tieneEvento || hayDatosDeEvento) {
            if (!formData.perfil) newErrors.perfil = 'El perfil es obligatorio';
            if (!formData.area_tematica) newErrors.area_tematica = 'El área temática es obligatoria';
            if (!formData.tipo_certificacion) newErrors.tipo_certificacion = 'El tipo de certificación es obligatorio';
            if (!formData.presentacion?.trim()) newErrors.presentacion = 'La presentación es obligatoria';
            if (!formData.objetivos?.trim()) newErrors.objetivos = 'Los objetivos son obligatorios';
            if (!formData.requisitos_aprobacion?.trim()) newErrors.requisitos_aprobacion = 'Los requisitos de aprobación son obligatorios';
            if (!formData.ejes_tematicos?.trim()) newErrors.ejes_tematicos = 'Los ejes temáticos son obligatorios';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            onSave({ ...formData, tieneEvento });
        }
    };

    const calcularNuevoEstado = (estadoCurrent, accion, estadoDestino) => {
        const stepActual = ESTADOS[estadoCurrent]?.step ?? -1;
        switch (accion) {
            case 'avanzar':    return FLUJO_NORMAL[stepActual + 1] ?? estadoCurrent;
            case 'retroceder': return FLUJO_NORMAL[stepActual - 1] ?? estadoCurrent;
            case 'darDeBaja':  return 'NVIG';
            case 'restaurar':  return estadoDestino ?? estadoCurrent;
            default:           return estadoCurrent;
        }
    };

    const handleCambioEstado = async (accion, estadoDestino = null) => {
        if (!record?.cod || !onChangeEstado) return;
        setEstadoLoading(true);
        setEstadoFeedback(null);
        const result = await onChangeEstado(record, accion, estadoDestino);
        setEstadoLoading(false);
        if (result.success) {
            setEstadoActual(prev => calcularNuevoEstado(prev, accion, estadoDestino));
            setEstadoFeedback({ type: 'success', msg: 'Estado actualizado correctamente.' });
        } else {
            setEstadoFeedback({ type: 'error', msg: result.error || 'Error al cambiar el estado.' });
        }
    };

    const cursoNombre = record?.nombre || record?.cod || '';
    const modalTitle = tieneEvento ? 'Editar Evento y Curso' : 'Editar Curso / Crear Evento';

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ m: 0, p: 2 }}>
                {modalTitle}
                <Typography variant="subtitle2" color="text.secondary">
                    Curso: {cursoNombre} ({record?.cod})
                </Typography>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute', right: 8, top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {/* ============================== */}
                {/* SECCIÓN: Estado del Curso      */}
                {/* ============================== */}
                {estadoFeedback && (
                    <Alert severity={estadoFeedback.type} sx={{ mb: 2 }} onClose={() => setEstadoFeedback(null)}>
                        {estadoFeedback.msg}
                    </Alert>
                )}

                <EstadoStepper
                    estadoActual={estadoActual}
                    loading={estadoLoading}
                    onAvanzar={() => handleCambioEstado('avanzar')}
                    onRetroceder={() => handleCambioEstado('retroceder')}
                    onDarDeBaja={() => handleCambioEstado('darDeBaja')}
                    onRestaurar={(destino) => handleCambioEstado('restaurar', destino)}
                />

                {!tieneEvento && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Este curso aún no tiene un evento asociado. Puede modificar los datos del curso y, opcionalmente,
                        completar los datos del evento para crearlo. Si deja los campos de evento vacíos, solo se actualizará el curso.
                    </Alert>
                )}

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
                                {auxiliaryData.plataformas
                                    .filter(item => item.esVigente === 1)
                                    .map((item) => (
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
                                {auxiliaryData.medios
                                    .filter(item => item.esVigente === 1)
                                    .map((item) => (
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
                                {auxiliaryData.tipos
                                    .filter(item => item.esVigente === 1)
                                    .map((item) => (
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
                            <InputLabel>¿Aplica sincronización de certificados?</InputLabel>
                            <Select
                                name="aplica_sincronizacion_certificados"
                                value={formData.aplica_sincronizacion_certificados}
                                label="¿Aplica sincronización de certificados?"
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

                    {!tieneEvento && !hayDatosDeEvento && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            Si completa los campos de evento, se creará un evento nuevo para este curso al guardar.
                        </Alert>
                    )}

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth required={tieneEvento || hayDatosDeEvento} error={!!errors.perfil}>
                                <InputLabel>Perfil</InputLabel>
                                <Select
                                    name="perfil"
                                    value={formData.perfil}
                                    label="Perfil"
                                    onChange={handleChange}
                                >
                                    <MenuItem value=""><em>Sin seleccionar</em></MenuItem>
                                    {auxiliaryData.perfiles.map((item) => (
                                        <MenuItem key={item.cod} value={item.cod}>{item.descripcion}</MenuItem>
                                    ))}
                                </Select>
                                {errors.perfil && <p style={{ color: '#d32f2f', fontSize: '0.75rem', margin: '3px 14px 0' }}>{errors.perfil}</p>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth required={tieneEvento || hayDatosDeEvento} error={!!errors.area_tematica}>
                                <InputLabel>Área Temática</InputLabel>
                                <Select
                                    name="area_tematica"
                                    value={formData.area_tematica}
                                    label="Área Temática"
                                    onChange={handleChange}
                                >
                                    <MenuItem value=""><em>Sin seleccionar</em></MenuItem>
                                    {auxiliaryData.areasTematicas.map((item) => (
                                        <MenuItem key={item.cod} value={item.cod}>{item.descripcion}</MenuItem>
                                    ))}
                                </Select>
                                {errors.area_tematica && <p style={{ color: '#d32f2f', fontSize: '0.75rem', margin: '3px 14px 0' }}>{errors.area_tematica}</p>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth required={tieneEvento || hayDatosDeEvento} error={!!errors.tipo_certificacion}>
                                <InputLabel>Tipo de Certificación</InputLabel>
                                <Select
                                    name="tipo_certificacion"
                                    value={formData.tipo_certificacion}
                                    label="Tipo de Certificación"
                                    onChange={handleChange}
                                >
                                    <MenuItem value=""><em>Sin seleccionar</em></MenuItem>
                                    {auxiliaryData.tiposCertificacion.map((item) => (
                                        <MenuItem key={item.cod} value={item.cod}>{item.descripcion}</MenuItem>
                                    ))}
                                </Select>
                                {errors.tipo_certificacion && <p style={{ color: '#d32f2f', fontSize: '0.75rem', margin: '3px 14px 0' }}>{errors.tipo_certificacion}</p>}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                name="presentacion"
                                label="Presentación"
                                fullWidth multiline rows={4}
                                value={formData.presentacion}
                                onChange={handleChange}
                                required={tieneEvento || hayDatosDeEvento}
                                error={!!errors.presentacion}
                                helperText={errors.presentacion}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                name="objetivos"
                                label="Objetivos"
                                fullWidth multiline rows={4}
                                value={formData.objetivos}
                                onChange={handleChange}
                                required={tieneEvento || hayDatosDeEvento}
                                error={!!errors.objetivos}
                                helperText={errors.objetivos}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                name="ejes_tematicos"
                                label="Ejes Temáticos"
                                fullWidth multiline rows={4}
                                value={formData.ejes_tematicos}
                                onChange={handleChange}
                                required={tieneEvento || hayDatosDeEvento}
                                error={!!errors.ejes_tematicos}
                                helperText={errors.ejes_tematicos}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                name="requisitos_aprobacion"
                                label="Requisitos de Aprobación"
                                fullWidth multiline rows={3}
                                value={formData.requisitos_aprobacion}
                                onChange={handleChange}
                                required={tieneEvento || hayDatosDeEvento}
                                error={!!errors.requisitos_aprobacion}
                                helperText={errors.requisitos_aprobacion}
                            />
                        </Grid>

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
                    {tieneEvento ? 'Guardar Cambios' : (hayDatosDeEvento ? 'Crear Evento y Guardar' : 'Guardar Curso')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EventoYCursoModal;
