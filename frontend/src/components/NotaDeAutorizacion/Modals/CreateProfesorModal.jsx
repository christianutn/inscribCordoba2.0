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
import { postTutores } from "../../../services/tutores.service";
import { getMinisterios } from "../../../services/ministerios.service";

const CreateProfesorModal = ({ open, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Dropdown Data
    const [ministerios, setMinisterios] = useState([]);
    const [areas, setAreas] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        cuil: '',
        ministerio: null,
        area: null,
        esReferente: null
    });

    useEffect(() => {
        if (open) {
            fetchData();
        } else {
            // Reset form on close
            setFormData({
                cuil: '',
                ministerio: null,
                area: null,
                esReferente: null
            });
            setError(null);
        }
    }, [open]);

    const fetchData = async () => {
        try {
            const minRes = await getMinisterios();
            setMinisterios(minRes);
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
        if (!formData.cuil) return setError("El CUIL es requerido.");
        if (formData.cuil.length !== 11) return setError("El CUIL debe tener 11 caracteres.");
        if (!formData.ministerio) return setError("El ministerio es requerido.");
        if (!formData.area) return setError("El área es requerida.");
        if (!formData.esReferente) return setError("Debe indicar si es referente.");

        setLoading(true);
        setError(null);

        try {
            await postTutores({
                cuil: formData.cuil,
                area: formData.area.cod,
                esReferente: formData.esReferente === "Si"
            });
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Error creating tutor:", err);
            setError(err.message || "Error al crear el tutor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Crear Nuevo Profesor/a
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="CUIL"
                        value={formData.cuil}
                        onChange={(e) => setFormData({ ...formData, cuil: e.target.value })}
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
                        options={["Si", "No"]}
                        value={formData.esReferente}
                        onChange={(_, newValue) => setFormData({ ...formData, esReferente: newValue })}
                        renderInput={(params) => <TextField {...params} label="¿Es Referente?" />}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Cancelar</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : "Crear Profesor/a"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateProfesorModal;
