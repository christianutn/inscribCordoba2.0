import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Snackbar,
    Alert
} from '@mui/material';
import useTutores from '../hooks/useTutores';
import { getAreas } from '../../../services/areas.service';

const TutorModal = ({ open, onClose, onSuccess, tutor }) => {
    const { crearTutor, actualizarTutor } = useTutores();
    const [areas, setAreas] = useState([]);
    const [formData, setFormData] = useState({
        cuil: '',
        nombre: '',
        apellido: '',
        mail: '',
        celular: '',
        esReferente: 0,
        area: ''
    });
    const [errors, setErrors] = useState({});
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchAreas = async () => {
            try {
                const data = await getAreas();
                setAreas(data || []);
            } catch (error) {
                console.error("Error fetching areas:", error);
                setSnackbar({
                    open: true,
                    message: 'Error al cargar las áreas',
                    severity: 'error'
                });
            }
        };
        fetchAreas();
    }, []);

    useEffect(() => {
        if (tutor) {
            setFormData({
                cuil: tutor.cuil,
                nombre: tutor.detalle_persona?.nombre || '',
                apellido: tutor.detalle_persona?.apellido || '',
                mail: tutor.detalle_persona?.mail || '',
                celular: tutor.detalle_persona?.celular || '',
                esReferente: tutor.esReferente === 1 ? 1 : 0,
                area: tutor.detalle_area?.cod || ''
            });
        } else {
            setFormData({
                cuil: '',
                nombre: '',
                apellido: '',
                mail: '',
                celular: '',
                esReferente: 0,
                area: ''
            });
        }
        setErrors({});
    }, [tutor, open]);

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
        if (!formData.cuil) newErrors.cuil = 'El CUIL es requerido';
        else if (formData.cuil.length !== 11) newErrors.cuil = 'El CUIL debe tener 11 dígitos';

        if (!formData.nombre) newErrors.nombre = 'El nombre es requerido';
        if (!formData.apellido) newErrors.apellido = 'El apellido es requerido';

        if (formData.mail && !/\S+@\S+\.\S+/.test(formData.mail)) {
            newErrors.mail = 'Formato de email inválido';
        }

        if (formData.celular && formData.celular.length !== 10) {
            newErrors.celular = 'El celular debe tener 10 dígitos';
        }

        if (!formData.area) newErrors.area = 'El área es requerida';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setIsSubmitting(true);
        let result;

        if (tutor) {
            result = await actualizarTutor(formData);
        } else {
            result = await crearTutor(formData);
        }

        if (result.success) {
            setSnackbar({
                open: true,
                message: tutor ? 'Tutor actualizado con éxito' : 'Tutor creado con éxito',
                severity: 'success'
            });
            setTimeout(() => {
                onClose();
                if (onSuccess) onSuccess();
            }, 1000); // Give time to see the snackbar
        } else {
            setSnackbar({
                open: true,
                message: result.error || 'Ocurrió un error',
                severity: 'error'
            });
        }
        setIsSubmitting(false);
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle>{tutor ? 'Editar Tutor' : 'Nuevo Tutor'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="cuil"
                                label="CUIL"
                                fullWidth
                                value={formData.cuil}
                                onChange={handleChange}
                                required
                                error={!!errors.cuil}
                                helperText={errors.cuil}
                                inputProps={{ maxLength: 11 }}
                                disabled={!!tutor} // Assuming CUIL is not editable when updating as it's often the ID
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
                                error={!!errors.nombre}
                                helperText={errors.nombre}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="apellido"
                                label="Apellido"
                                fullWidth
                                value={formData.apellido}
                                onChange={handleChange}
                                required
                                error={!!errors.apellido}
                                helperText={errors.apellido}
                            />
                        </Grid>
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
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="celular"
                                label="Celular (10 dígitos)"
                                fullWidth
                                value={formData.celular}
                                onChange={handleChange}
                                error={!!errors.celular}
                                helperText={errors.celular}
                                inputProps={{ maxLength: 10 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required error={!!errors.esReferente}>
                                <InputLabel>Es Referente</InputLabel>
                                <Select
                                    name="esReferente"
                                    value={formData.esReferente}
                                    label="Es Referente"
                                    onChange={handleChange}
                                >
                                    <MenuItem value={1}>Si</MenuItem>
                                    <MenuItem value={0}>No</MenuItem>
                                </Select>
                                {errors.esReferente && <p style={{ color: '#d32f2f', fontSize: '0.75rem', margin: '3px 14px 0' }}>{errors.esReferente}</p>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required error={!!errors.area}>
                                <InputLabel>Área</InputLabel>
                                <Select
                                    name="area"
                                    value={formData.area}
                                    label="Área"
                                    onChange={handleChange}
                                >
                                    {areas.map((area) => (
                                        <MenuItem key={area.cod} value={area.cod}>
                                            {area.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.area && <p style={{ color: '#d32f2f', fontSize: '0.75rem', margin: '3px 14px 0' }}>{errors.area}</p>}
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="secondary" disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : 'Guardar'}
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default TutorModal;
