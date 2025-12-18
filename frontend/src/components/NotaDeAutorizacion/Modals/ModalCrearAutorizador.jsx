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

import { postAutorizador } from "../../../services/autorizadores.service";

const ModalCrearAutorizador = ({ open, onClose, onSuccess, areas }) => {
    const [formData, setFormData] = useState({
        cuil: "",
        nombre: "",
        apellido: "",
        mail: "",
        celular: "",
        area: "",
        descripcion_cargo: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        if (formData.cuil && (formData.cuil.length !== 11 || isNaN(formData.cuil))) return "El CUIL debe tener 11 dígitos numéricos.";
        if (!formData.nombre.trim()) return "El nombre es obligatorio.";
        if (!formData.apellido.trim()) return "El apellido es obligatorio.";
        if (formData.mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.mail)) return "El email no es válido.";
        if (!formData.area) return "Debe seleccionar un área.";
        if (!formData.descripcion_cargo.trim()) return "La descripción del cargo es obligatoria.";
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
            // Add current date as fecha_desde
            const payload = {
                ...formData
            };
            await postAutorizador(payload);
            onSuccess("Autorizador creado con éxito");
            onClose();
            setFormData({
                cuil: "",
                nombre: "",
                apellido: "",
                mail: "",
                celular: "",
                area: "",
                descripcion_cargo: ""
            });
        } catch (err) {
            setError(err.message || "Error al crear el autorizador");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Crear Autorizador</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="CUIL"
                            name="cuil"
                            value={formData.cuil}
                            onChange={handleChange}
                            inputProps={{ maxLength: 11 }}
                            helperText="11 dígitos sin guiones (Opcional)"
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
                            label="Apellido"
                            name="apellido"
                            value={formData.apellido}
                            onChange={handleChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Mail"
                            name="mail"
                            type="email"
                            value={formData.mail}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Celular"
                            name="celular"
                            value={formData.celular}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            select
                            fullWidth
                            label="Área"
                            name="area"
                            value={formData.area}
                            onChange={handleChange}
                            required
                        >
                            {areas.map((a) => (
                                <MenuItem key={a.cod} value={a.cod}>
                                    {a.nombre}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Descripción del Cargo"
                            name="descripcion_cargo"
                            value={formData.descripcion_cargo}
                            onChange={handleChange}
                            multiline
                            rows={2}
                        />
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

export default ModalCrearAutorizador;
