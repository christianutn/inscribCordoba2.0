import { useState, useEffect } from "react";
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
    CircularProgress,
    Autocomplete
} from "@mui/material";
import { postTutores } from "../../../services/tutores.service";
import { getAreas } from "../../../services/areas.service";

const ModalCrearTutor = ({ open, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        cuil: "",
        esReferente: "No",
        nombre: "",
        apellido: "",
        mail: "",
        celular: "",
        area: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [areas, setAreas] = useState([]);

    const fetchData = async () => {
        try {
            const res = await getAreas();
            setAreas(res);
        } catch (err) {
            console.error("Error fetching data for modal:", err);
            setError("Error al cargar los datos necesarios.");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        if (!formData.cuil || formData.cuil.length !== 11 || isNaN(formData.cuil)) return "El CUIL debe tener 11 dígitos numéricos.";
        if (!formData.nombre.trim()) return "El nombre es obligatorio.";
        if (!formData.apellido.trim()) return "El apellido es obligatorio.";
        if (formData.mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.mail)) return "El email no es válido.";
        if (!formData.area) return "Debe seleccionar una área.";
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
            await postTutores(formData);
            onSuccess("Tutor creado con éxito");
            onClose();
            setFormData({
                cuil: "",
                esReferente: "No",
                nombre: "",
                apellido: "",
                mail: "",
                celular: "",
                area: ""
            });
        } catch (err) {
            setError(err.message || "Error al crear el tutor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Crear Tutor</DialogTitle>
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
                    <Grid item xs={12}>
                        <TextField
                            select
                            fullWidth
                            label="Es Referente"
                            name="esReferente"
                            value={formData.esReferente}
                            onChange={handleChange}
                            required
                        >
                            <MenuItem value="Si">Si</MenuItem>
                            <MenuItem value="No">No</MenuItem>
                        </TextField>
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
                            {areas.map((area) => (
                                <MenuItem key={area.cod} value={area.cod}>
                                    {area.nombre}
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

export default ModalCrearTutor;
