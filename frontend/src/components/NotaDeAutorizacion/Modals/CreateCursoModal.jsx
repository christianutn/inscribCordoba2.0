import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Autocomplete,
    Box,
    Alert,
    CircularProgress,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { postCurso } from "../../../services/cursos.service";
import { getMinisterios } from "../../../services/ministerios.service";
import { getMediosInscripcion } from "../../../services/mediosInscripcion.service";
import { getPlataformasDictado } from "../../../services/plataformasDictado.service";
import { getTiposCapacitacion } from "../../../services/tiposCapacitacion.service";

const CreateCursoModal = ({ open, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Dropdown Data
    const [ministerios, setMinisterios] = useState([]);
    const [areas, setAreas] = useState([]);
    const [mediosInscripcion, setMediosInscripcion] = useState([]);
    const [plataformasDictado, setPlataformasDictado] = useState([]);
    const [tiposCapacitacion, setTiposCapacitacion] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        cod: '',
        nombre: '',
        ministerio: null,
        area: null,
        medioInscripcion: null,
        plataformaDictado: null,
        tipoCapacitacion: null,
        cupo: '',
        horas: ''
    });

    useEffect(() => {
        if (open) {
            fetchData();
        } else {
            // Reset form on close
            setFormData({
                cod: '',
                nombre: '',
                ministerio: null,
                area: null,
                medioInscripcion: null,
                plataformaDictado: null,
                tipoCapacitacion: null,
                cupo: '',
                horas: ''
            });
            setError(null);
        }
    }, [open]);

    const fetchData = async () => {
        try {
            const [minRes, medRes, platRes, tipRes] = await Promise.all([
                getMinisterios(),
                getMediosInscripcion(),
                getPlataformasDictado(),
                getTiposCapacitacion()
            ]);
            setMinisterios(minRes);
            setMediosInscripcion(medRes);
            setPlataformasDictado(platRes);
            setTiposCapacitacion(tipRes);
        } catch (err) {
            console.error("Error fetching data for modal:", err);
            setError("Error al cargar los datos necesarios.");
        }
    };

    const handleMinisterioChange = (event, newValue) => {
        setFormData(prev => ({
            ...prev,
            ministerio: newValue,
            area: null // Reset area when ministerio changes
        }));
        if (newValue) {
            setAreas(newValue.detalle_areas || []);
        } else {
            setAreas([]);
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.cod) return setError("El código es requerido.");
        if (!formData.nombre) return setError("El nombre es requerido.");
        if (!formData.ministerio) return setError("El ministerio es requerido.");
        if (!formData.area) return setError("El área es requerida.");
        if (!formData.medioInscripcion) return setError("El medio de inscripción es requerido.");
        if (!formData.plataformaDictado) return setError("La plataforma de dictado es requerida.");
        if (!formData.tipoCapacitacion) return setError("El tipo de capacitación es requerido.");
        if (!formData.cupo || formData.cupo <= 0) return setError("El cupo debe ser mayor a 0.");
        if (!formData.horas || formData.horas <= 0) return setError("La cantidad de horas debe ser mayor a 0.");

        setLoading(true);
        setError(null);

        try {
            await postCurso({
                cod: formData.cod,
                nombre: formData.nombre,
                area: formData.area.cod,
                medio_inscripcion: formData.medioInscripcion.cod,
                plataforma_dictado: formData.plataformaDictado.cod,
                tipo_capacitacion: formData.tipoCapacitacion.cod,
                cupo: formData.cupo,
                cantidad_horas: formData.horas
            });
            onSuccess(); // Callback to refresh parent list
            onClose();
        } catch (err) {
            console.error("Error creating curso:", err);
            setError(err.message || "Error al crear el curso.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Crear Nuevo Curso
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <TextField
                        label="Código"
                        value={formData.cod}
                        onChange={(e) => setFormData({ ...formData, cod: e.target.value })}
                        fullWidth
                    />
                    <TextField
                        label="Nombre"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        fullWidth
                    />
                    <Autocomplete
                        options={ministerios}
                        getOptionLabel={(option) => option.nombre || ""}
                        value={formData.ministerio}
                        onChange={handleMinisterioChange}
                        renderInput={(params) => <TextField {...params} label="Ministerio" />}
                    />
                    <Autocomplete
                        options={areas}
                        getOptionLabel={(option) => option.nombre || ""}
                        value={formData.area}
                        onChange={(_, newValue) => setFormData({ ...formData, area: newValue })}
                        renderInput={(params) => <TextField {...params} label="Área" />}
                        disabled={!formData.ministerio}
                    />
                    <Autocomplete
                        options={mediosInscripcion}
                        getOptionLabel={(option) => option.nombre || ""}
                        value={formData.medioInscripcion}
                        onChange={(_, newValue) => setFormData({ ...formData, medioInscripcion: newValue })}
                        renderInput={(params) => <TextField {...params} label="Medio de Inscripción" />}
                    />
                    <Autocomplete
                        options={plataformasDictado}
                        getOptionLabel={(option) => option.nombre || ""}
                        value={formData.plataformaDictado}
                        onChange={(_, newValue) => setFormData({ ...formData, plataformaDictado: newValue })}
                        renderInput={(params) => <TextField {...params} label="Plataforma de Dictado" />}
                    />
                    <Autocomplete
                        options={tiposCapacitacion}
                        getOptionLabel={(option) => option.nombre || ""}
                        value={formData.tipoCapacitacion}
                        onChange={(_, newValue) => setFormData({ ...formData, tipoCapacitacion: newValue })}
                        renderInput={(params) => <TextField {...params} label="Tipo de Capacitación" />}
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="Cupo"
                            type="number"
                            value={formData.cupo}
                            onChange={(e) => setFormData({ ...formData, cupo: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Horas"
                            type="number"
                            value={formData.horas}
                            onChange={(e) => setFormData({ ...formData, horas: e.target.value })}
                            fullWidth
                        />
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Cancelar</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : "Crear Curso"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateCursoModal;
