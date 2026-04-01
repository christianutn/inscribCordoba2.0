import React, { useState, useEffect, useMemo } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Grid, FormControl,
    InputLabel, Select, MenuItem, IconButton,
    FormHelperText, Typography, Box, Autocomplete as MuiAutocomplete,
    Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const MESES = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
];

const currentYear = new Date().getFullYear();
const ANIOS = Array.from({ length: 6 }, (_, i) => currentYear - i);

const DatosDesarrolloModal = ({ open, handleClose, handleSave, editingData, usuarios = [] }) => {
    const isEdit = !!editingData;

    const [formData, setFormData] = useState({
        mes: '',
        anio: currentYear,
        cuil: '',
        lineas_cod_modificadas: '',
        lineas_cod_eliminadas: '',
        observaciones: ''
    });

    const [errors, setErrors] = useState({});

    // Build options for the Autocomplete from detalle_persona
    const usuariosOptions = useMemo(() => {
        return usuarios.map(u => {
            const persona = u?.detalle_persona;
            return {
                cuil: u.cuil,
                label: `${persona?.nombre || ''} ${persona?.apellido || ''} (${u.cuil})`.trim()
            };
        });
    }, [usuarios]);

    const selectedUsuario = useMemo(() => {
        return usuariosOptions.find(u => u.cuil === formData.cuil) || null;
    }, [formData.cuil, usuariosOptions]);

    useEffect(() => {
        if (editingData) {
            setFormData({
                mes: editingData.mes || '',
                anio: editingData.anio || currentYear,
                cuil: editingData.cuil || '',
                lineas_cod_modificadas: editingData.lineas_cod_modificadas ?? '',
                lineas_cod_eliminadas: editingData.lineas_cod_eliminadas ?? '',
                observaciones: editingData.observaciones || ''
            });
        } else {
            setFormData({
                mes: '',
                anio: currentYear,
                cuil: '',
                lineas_cod_modificadas: '',
                lineas_cod_eliminadas: '',
                observaciones: ''
            });
        }
        setErrors({});
    }, [editingData, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        if (value === '' || /^\d+$/.test(value)) {
            setFormData(prev => ({ ...prev, [name]: value }));
            if (errors[name]) {
                setErrors(prev => ({ ...prev, [name]: null }));
            }
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.mes) newErrors.mes = 'El mes es obligatorio';
        if (!formData.anio) newErrors.anio = 'El año es obligatorio';
        if (!formData.cuil) newErrors.cuil = 'El desarrollador es obligatorio';
        if (formData.lineas_cod_modificadas !== '' && isNaN(Number(formData.lineas_cod_modificadas))) {
            newErrors.lineas_cod_modificadas = 'Debe ser un número válido';
        }
        if (formData.lineas_cod_eliminadas !== '' && isNaN(Number(formData.lineas_cod_eliminadas))) {
            newErrors.lineas_cod_eliminadas = 'Debe ser un número válido';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onConfirm = () => {
        if (validate()) {
            const payload = {
                ...formData,
                lineas_cod_modificadas: formData.lineas_cod_modificadas !== '' ? Number(formData.lineas_cod_modificadas) : null,
                lineas_cod_eliminadas: formData.lineas_cod_eliminadas !== '' ? Number(formData.lineas_cod_eliminadas) : null,
                observaciones: formData.observaciones || null
            };
            handleSave(payload);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarMonthIcon color="primary" />
                <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
                    {isEdit ? 'Editar Registro de Desarrollo' : 'Nuevo Registro de Desarrollo'}
                </Typography>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
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
                <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
                    {/* Período */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                            Período
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth error={!!errors.mes} size="small">
                            <InputLabel>Mes</InputLabel>
                            <Select name="mes" value={formData.mes} label="Mes" onChange={handleChange}>
                                {MESES.map((m) => (
                                    <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                                ))}
                            </Select>
                            {errors.mes && <FormHelperText>{errors.mes}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth error={!!errors.anio} size="small">
                            <InputLabel>Año</InputLabel>
                            <Select name="anio" value={formData.anio} label="Año" onChange={handleChange}>
                                {ANIOS.map((a) => (
                                    <MenuItem key={a} value={a}>{a}</MenuItem>
                                ))}
                            </Select>
                            {errors.anio && <FormHelperText>{errors.anio}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    {/* Desarrollador */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                            Desarrollador
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <MuiAutocomplete
                            options={usuariosOptions}
                            getOptionLabel={(option) => option.label || ''}
                            value={selectedUsuario}
                            onChange={(_, newValue) => {
                                setFormData(prev => ({ ...prev, cuil: newValue?.cuil || '' }));
                                if (errors.cuil) setErrors(prev => ({ ...prev, cuil: null }));
                            }}
                            isOptionEqualToValue={(option, value) => option.cuil === value?.cuil}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Seleccionar Desarrollador"
                                    size="small"
                                    error={!!errors.cuil}
                                    helperText={errors.cuil}
                                    placeholder="Buscar por nombre o CUIL..."
                                />
                            )}
                            noOptionsText="No se encontraron desarrolladores"
                            size="small"
                        />
                    </Grid>

                    {/* Métricas */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                            Métricas de Código
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            name="lineas_cod_modificadas"
                            label="Líneas Modificadas"
                            fullWidth
                            size="small"
                            value={formData.lineas_cod_modificadas}
                            onChange={handleNumberChange}
                            error={!!errors.lineas_cod_modificadas}
                            helperText={errors.lineas_cod_modificadas || 'Cantidad de líneas agregadas/modificadas'}
                            placeholder="Ej: 1250"
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            name="lineas_cod_eliminadas"
                            label="Líneas Eliminadas"
                            fullWidth
                            size="small"
                            value={formData.lineas_cod_eliminadas}
                            onChange={handleNumberChange}
                            error={!!errors.lineas_cod_eliminadas}
                            helperText={errors.lineas_cod_eliminadas || 'Cantidad de líneas eliminadas'}
                            placeholder="Ej: 320"
                        />
                    </Grid>

                    {/* Observaciones */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                            Observaciones
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            name="observaciones"
                            label="Observaciones"
                            fullWidth
                            size="small"
                            multiline
                            rows={3}
                            value={formData.observaciones}
                            onChange={handleChange}
                            placeholder="Detalles adicionales sobre el trabajo realizado..."
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={handleClose} color="inherit" sx={{ mr: 1 }}>
                    Cancelar
                </Button>
                <Button onClick={onConfirm} variant="contained" color="primary" disableElevation>
                    {isEdit ? 'Actualizar' : 'Crear Registro'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DatosDesarrolloModal;
