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
import { postArea } from "../../../services/areas.service";
import { getMinisterios } from "../../../services/ministerios.service";

const ModalCrearArea = ({ open, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        cod: "",
        nombre: "",
        ministerio: ""
    });
    const [ministerios, setMinisterios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMinisterios, setLoadingMinisterios] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (open) {
            fetchMinisterios();
        }
    }, [open]);

    const fetchMinisterios = async () => {
        setLoadingMinisterios(true);
        try {
            const data = await getMinisterios();
            setMinisterios(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingMinisterios(false);
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
        if (!formData.ministerio) return "Debe seleccionar un ministerio.";
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
            await postArea(formData);
            onSuccess("Área creada con éxito");
            onClose();
            setFormData({
                cod: "",
                nombre: "",
                ministerio: ""
            });
        } catch (err) {
            setError(err.message || "Error al crear el área");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Crear Área</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
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
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            select
                            fullWidth
                            label="Ministerio"
                            name="ministerio"
                            value={formData.ministerio}
                            onChange={handleChange}
                            required
                            disabled={loadingMinisterios}
                        >
                            {ministerios.map((m) => (
                                <MenuItem key={m.cod} value={m.cod}>
                                    {m.nombre}
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

export default ModalCrearArea;
