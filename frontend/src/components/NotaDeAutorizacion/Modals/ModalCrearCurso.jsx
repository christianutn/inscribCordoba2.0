import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    Grid,
    Alert,
    CircularProgress
} from "@mui/material";
import { postCurso } from "../../../services/cursos.service";
import { getMediosInscripcion } from "../../../services/mediosInscripcion.service";
import { getPlataformasDictado } from "../../../services/plataformasDictado.service";
import { getTiposCapacitacion } from "../../../services/tiposCapacitacion.service";
import { getAreas } from "../../../services/areas.service";

const ModalCrearCurso = ({ open, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        cod: "",
        nombre: "",
        cupo: "",
        cantidad_horas: "",
        medio_inscripcion: "",
        plataforma_dictado: "",
        tipo_capacitacion: "",
        area: ""
    });
    const [medios, setMedios] = useState([]);
    const [plataformas, setPlataformas] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [areas, setAreas] = useState([]);

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (open) {
            fetchData();
        }
    }, [open]);

    const fetchData = async () => {
        setLoadingData(true);
        try {
            const [mediosData, plataformasData, tiposData, areasData] = await Promise.all([
                getMediosInscripcion(),
                getPlataformasDictado(),
                getTiposCapacitacion(),
                getAreas()
            ]);
            setMedios(mediosData);
            setPlataformas(plataformasData);
            setTipos(tiposData);
            setAreas(areasData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        if (!formData.cod.trim()) return "El código es obligatorio.";
        if (formData.cod.length > 15) return "El código no debe superar los 15 caracteres.";
        if (!formData.nombre.trim()) return "El nombre es obligatorio.";
        if (!formData.cupo || isNaN(formData.cupo) || Number(formData.cupo) <= 0) return "El cupo debe ser un entero positivo.";
        if (!formData.cantidad_horas || isNaN(formData.cantidad_horas) || Number(formData.cantidad_horas) <= 0) return "La cantidad de horas debe ser un entero positivo.";
        if (!formData.medio_inscripcion) return "Debe seleccionar un medio de inscripción.";
        if (!formData.plataforma_dictado) return "Debe seleccionar una plataforma de dictado.";
        if (!formData.tipo_capacitacion) return "Debe seleccionar un tipo de capacitación.";
        if (!formData.area) return "Debe seleccionar un área.";
        return null;
    };

    const handleSubmit = async () => {
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await postCurso({
                ...formData,
                cupo: Number(formData.cupo),
                cantidad_horas: Number(formData.cantidad_horas)
            });
            onSuccess("Curso creado con éxito");
            onClose();
            setFormData({
                cod: "",
                nombre: "",
                cupo: "",
                cantidad_horas: "",
                medio_inscripcion: "",
                plataforma_dictado: "",
                tipo_capacitacion: "",
                area: ""
            });
        } catch (err) {
            setError(err.message || "Error al crear el curso");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Crear Curso</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Código"
                            name="cod"
                            value={formData.cod}
                            onChange={handleChange}
                            required
                            inputProps={{ maxLength: 15 }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Cupo"
                            name="cupo"
                            type="number"
                            value={formData.cupo}
                            onChange={handleChange}
                            required
                            inputProps={{ min: 1 }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Cantidad de Horas"
                            name="cantidad_horas"
                            type="number"
                            value={formData.cantidad_horas}
                            onChange={handleChange}
                            required
                            inputProps={{ min: 1 }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            select
                            fullWidth
                            label="Medio de Inscripción"
                            name="medio_inscripcion"
                            value={formData.medio_inscripcion}
                            onChange={handleChange}
                            required
                            disabled={loadingData}
                        >
                            {medios.map((m) => (
                                <MenuItem key={m.cod} value={m.cod}>
                                    {m.nombre}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            select
                            fullWidth
                            label="Plataforma de Dictado"
                            name="plataforma_dictado"
                            value={formData.plataforma_dictado}
                            onChange={handleChange}
                            required
                            disabled={loadingData}
                        >
                            {plataformas.map((p) => (
                                <MenuItem key={p.cod} value={p.cod}>
                                    {p.nombre}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            select
                            fullWidth
                            label="Tipo de Capacitación"
                            name="tipo_capacitacion"
                            value={formData.tipo_capacitacion}
                            onChange={handleChange}
                            required
                            disabled={loadingData}
                        >
                            {tipos.map((t) => (
                                <MenuItem key={t.cod} value={t.cod}>
                                    {t.nombre}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            select
                            fullWidth
                            label="Área"
                            name="area"
                            value={formData.area}
                            onChange={handleChange}
                            required
                            disabled={loadingData}
                        >
                            {areas.map((a) => (
                                <MenuItem key={a.cod} value={a.cod}>
                                    {a.nombre}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Cancelar</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : "Crear"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalCrearCurso;
