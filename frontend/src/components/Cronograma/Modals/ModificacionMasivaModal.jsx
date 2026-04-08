import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Grid, TextField, FormControl, InputLabel, Select, MenuItem,
    FormControlLabel, Switch, Typography, CircularProgress,
    Box, Tooltip, Alert
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { getPlataformasDictado } from '../../../services/plataformasDictado.service.js';
import { getTiposCapacitacion } from '../../../services/tiposCapacitacion.service.js';

const ModificacionMasivaModal = ({
    open,
    onClose,
    onConfirm,
    loading,
    selectedRowsCount,
    allEstados,
    adminUsers,
    allMediosInscripcion
}) => {
    // Almacena solo los datos que el usuario explícitamente quiere modificar
    const [formData, setFormData] = useState({});

    // Opciones traídas desde API
    const [plataformasOpciones, setPlataformasOpciones] = useState([]);
    const [tiposCapacitacionOpciones, setTiposCapacitacionOpciones] = useState([]);

    // Almacena qué campos han sido modificados (para los booleanos que podrían ser false)
    const [activeFields, setActiveFields] = useState({
        es_publicada_portal_cc: false,
        es_autogestionado: false
    });

    useEffect(() => {
        const fetchOpciones = async () => {
            try {
                const plataformas = await getPlataformasDictado();
                setPlataformasOpciones(plataformas);
            } catch (error) {
                console.error("Error obteniendo plataformas de dictado:", error);
            }

            try {
                const tipos = await getTiposCapacitacion();
                setTiposCapacitacionOpciones(tipos);
            } catch (error) {
                console.error("Error obteniendo tipos de capacitación:", error);
            }
        };
        fetchOpciones();
    }, []);

    useEffect(() => {
        if (open) {
            setFormData({});
            setActiveFields({
                es_publicada_portal_cc: false,
                es_autogestionado: false
            });
        }
    }, [open]);

    const handleTextSelectChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev };
            if (value === '') {
                delete newData[name];
            } else {
                newData[name] = value;
            }
            return newData;
        });
    };

    const handleSwitchChange = (e) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: checked ? 1 : 0
        }));
    };

    const handleToggleField = (name) => {
        setActiveFields(prev => {
            const isActive = !prev[name];
            if (!isActive) {
                // Remove from form data if unchecked
                setFormData(fd => {
                    const newFd = { ...fd };
                    delete newFd[name];
                    return newFd;
                });
            } else {
                // Set default value if checked
                setFormData(fd => ({
                    ...fd,
                    [name]: 0
                }));
            }
            return { ...prev, [name]: isActive };
        });
    };

    const handleSubmit = () => {
        const dataToSubmit = { ...formData };
        if (dataToSubmit.asignado === 'NULL_SYSTEM') {
            dataToSubmit.asignado = null;
        }
        onConfirm(dataToSubmit);
    };

    const hasChanges = Object.keys(formData).length > 0;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Actualización Masiva ({selectedRowsCount} instancias)
            </DialogTitle>
            <DialogContent dividers>
                <Alert severity="info" sx={{ mb: 3 }}>
                    Seleccione un valor únicamente en los campos que desee modificar.
                    <strong> Los campos que deje en blanco mantendrán su valor original </strong>
                    en cada una de las instancias seleccionadas.
                </Alert>

                <Grid container spacing={3}>
                    {/* Cupo */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Cupo"
                            name="cupo"
                            type="number"
                            value={formData.cupo !== undefined ? formData.cupo : ''}
                            onChange={handleTextSelectChange}
                            InputLabelProps={{ shrink: true }}
                            placeholder="Dejar vacío para no modificar"
                        />
                    </Grid>

                    {/* Cantidad de horas */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Cantidad de horas"
                            name="cantidad_horas"
                            type="number"
                            value={formData.cantidad_horas !== undefined ? formData.cantidad_horas : ''}
                            onChange={handleTextSelectChange}
                            InputLabelProps={{ shrink: true }}
                            placeholder="Dejar vacío para no modificar"
                        />
                    </Grid>

                    {/* Medio de inscripción */}
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel shrink>Medio de inscripción</InputLabel>
                            <Select
                                name="medio_inscripcion"
                                value={formData.medio_inscripcion !== undefined ? formData.medio_inscripcion : ''}
                                onChange={handleTextSelectChange}
                                displayEmpty
                                label="Medio de inscripción"
                                notched
                            >
                                <MenuItem value=""><em>(Sin cambios)</em></MenuItem>
                                {allMediosInscripcion?.map((medio) => (
                                    <MenuItem key={medio.cod} value={medio.cod}>
                                        {medio.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Estado Instancia */}
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel shrink>Estado Instancia</InputLabel>
                            <Select
                                name="estado_instancia"
                                value={formData.estado_instancia !== undefined ? formData.estado_instancia : ''}
                                onChange={handleTextSelectChange}
                                displayEmpty
                                label="Estado Instancia"
                                notched
                            >
                                <MenuItem value=""><em>(Sin cambios)</em></MenuItem>
                                {allEstados?.map((estado) => (
                                    <MenuItem key={estado.cod} value={estado.cod}>
                                        {estado.descripcion}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Plataforma Dictado */}
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel shrink>Plataforma de Dictado</InputLabel>
                            <Select
                                name="plataforma_dictado"
                                value={formData.plataforma_dictado !== undefined ? formData.plataforma_dictado : ''}
                                onChange={handleTextSelectChange}
                                displayEmpty
                                label="Plataforma de Dictado"
                                notched
                            >
                                <MenuItem value=""><em>(Sin cambios)</em></MenuItem>
                                {plataformasOpciones.map((plat) => (
                                    <MenuItem key={plat.cod} value={plat.cod}>
                                        {plat.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Tipo Capacitación */}
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel shrink>Tipo de Capacitación</InputLabel>
                            <Select
                                name="tipo_capacitacion"
                                value={formData.tipo_capacitacion !== undefined ? formData.tipo_capacitacion : ''}
                                onChange={handleTextSelectChange}
                                displayEmpty
                                label="Tipo de Capacitación"
                                notched
                            >
                                <MenuItem value=""><em>(Sin cambios)</em></MenuItem>
                                {tiposCapacitacionOpciones.map((tipo) => (
                                    <MenuItem key={tipo.cod} value={tipo.cod}>
                                        {tipo.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Asignado */}
                    <Grid item xs={12} sm={12}>
                        <FormControl fullWidth>
                            <InputLabel shrink>Asignado A</InputLabel>
                            <Select
                                name="asignado"
                                value={formData.asignado !== undefined ? formData.asignado : ''}
                                onChange={handleTextSelectChange}
                                displayEmpty
                                label="Asignado A"
                                notched
                            >
                                <MenuItem value=""><em>(Sin cambios)</em></MenuItem>
                                <MenuItem value="NULL_SYSTEM">
                                    <Typography color="error.main" sx={{ fontWeight: 'bold' }}>
                                        Sin asignar (Quitar responsable)
                                    </Typography>
                                </MenuItem>
                                {adminUsers?.map((user) => (
                                    <MenuItem key={user.cuil} value={user.cuil}>
                                        {user.detalle_persona?.nombre} {user.detalle_persona?.apellido} ({user.cuil})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Comentario */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Comentario"
                            name="comentario"
                            value={formData.comentario !== undefined ? formData.comentario : ''}
                            onChange={handleTextSelectChange}
                            InputLabelProps={{ shrink: true }}
                            placeholder="Dejar vacío para no modificar"
                            multiline
                            rows={3}
                        />
                    </Grid>

                    {/* Booleanos (requieren un checkbox para habilitar el cambio) */}
                    <Grid item xs={12} sm={6}>
                        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                            <FormControlLabel
                                control={<Switch checked={activeFields.es_publicada_portal_cc} onChange={() => handleToggleField('es_publicada_portal_cc')} />}
                                label="¿Modificar Publicada en Portal CC?"
                            />
                            {activeFields.es_publicada_portal_cc && (
                                <Box mt={1}>
                                    <FormControlLabel
                                        control={<Switch name="es_publicada_portal_cc" checked={formData.es_publicada_portal_cc === 1} onChange={handleSwitchChange} color="primary" />}
                                        label={formData.es_publicada_portal_cc === 1 ? "Sí, publicar" : "No publicar"}
                                    />
                                </Box>
                            )}
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                            <FormControlLabel
                                control={<Switch checked={activeFields.es_autogestionado} onChange={() => handleToggleField('es_autogestionado')} />}
                                label="¿Modificar Es Autogestionado?"
                            />
                            {activeFields.es_autogestionado && (
                                <Box mt={1}>
                                    <FormControlLabel
                                        control={<Switch name="es_autogestionado" checked={formData.es_autogestionado === 1} onChange={handleSwitchChange} color="primary" />}
                                        label={formData.es_autogestionado === 1 ? "Sí, autogestionado" : "No autogestionado"}
                                    />
                                </Box>
                            )}
                        </Box>
                    </Grid>

                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading} color="inherit">
                    Cancelar
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={loading || !hasChanges}
                    variant="contained"
                    color="primary"
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Actualizar Masivamente'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModificacionMasivaModal;
