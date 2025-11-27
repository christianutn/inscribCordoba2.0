import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    Alert,
    CircularProgress
} from "@mui/material";
import { postCoordinador } from "../../../services/coordinadores.service";

const ModalCrearCoordinador = ({ open, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        cuil: "",
        nombre: "",
        apellido: "",
        mail: "",
        celular: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        if (!formData.cuil || formData.cuil.length !== 11 || isNaN(formData.cuil)) return "El CUIL debe tener 11 dígitos numéricos.";
        if (!formData.nombre.trim()) return "El nombre es obligatorio.";
        if (!formData.apellido.trim()) return "El apellido es obligatorio.";
        if (formData.mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.mail)) return "El email no es válido.";
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
            await postCoordinador({
                ...formData,
                cuil: Number(formData.cuil),
                celular: formData.celular ? Number(formData.celular) : null
            });
            onSuccess("Coordinador creado con éxito");
            onClose();
            setFormData({
                cuil: "",
                nombre: "",
                apellido: "",
                mail: "",
                celular: ""
            });
        } catch (err) {
            setError(err.message || "Error al crear el coordinador");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Crear Coordinador</DialogTitle>
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
                            required
                            inputProps={{ maxLength: 11 }}
                            helperText="11 dígitos sin guiones"
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

export default ModalCrearCoordinador;
