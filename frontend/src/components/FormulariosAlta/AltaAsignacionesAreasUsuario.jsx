import { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Autocomplete,
    Chip,
    Button,
    Paper,
    Typography

} from '@mui/material';
import { postAreaAsignada } from '../../services/areasAsignadasUsuario.service';
import { getAreas } from '../../services/areas.service'; // Asumiendo que existe este servicio
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import Alert from '@mui/material/Alert';


const AltaAsignacionesAreasUsuario = () => {
    const [cuil, setCuil] = useState('');
    const [areas, setAreas] = useState([]);
    const [selectedAreas, setSelectedAreas] = useState([]);
    const [comentario, setComentario] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchAreas = async () => {
            try {
                const areasData = await getAreas();
                setAreas(areasData);
            } catch (error) {
                setError(error.message || 'Error al cargar las áreas');

            }
        };
        fetchAreas();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Extract 'cod' from selected areas
            const areasCodList = selectedAreas.map(area => area.cod);

            // Prepare data to send to the backend
            const asignacionData = {
                cuil_usuario: cuil, // Backend expects 'cuil_usuario'
                cod_area: areasCodList[0], 
                comentario: comentario
            };

            setCargando(true);
            await postAreaAsignada(asignacionData);
            setCargando(false);
            setSuccess(true);
            // Limpiar el formulario después de un envío exitoso
            setCuil('');
            setSelectedAreas([]);
            setComentario('');
            setError('');
        } catch (error) {
            setError(error.message || 'Error al asignar las áreas');
            setSuccess(false);
            setCargando(false);
        }
    };

    return (
        <>
            {
                success &&
                <Alert variant="filled" severity="success" sx={{ width: '100%' }} >
                    Formulario enviado exitosamente
                </Alert>
            }
            <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Asignar Áreas a Usuario
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <TextField
                        fullWidth
                        label="CUIL del Usuario"
                        value={cuil}
                        onChange={(e) => setCuil(e.target.value)}
                        margin="normal"
                        required
                        error={!!error}
                        helperText={error}
                    />

                    <Autocomplete
                        multiple
                        id="areas-selector"
                        options={areas}
                        value={selectedAreas}
                        onChange={(_, newValue) => setSelectedAreas(newValue)}
                        getOptionLabel={(option) => option.nombre} // Display 'nombre' in Autocomplete
    
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                {...omit(params, 'required')} // Remove 'required' from TextField props
                                label="Seleccionar Áreas"
                                margin="normal"
                            // required  <- REMOVED THIS LINE
                            />
                        )}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    label={option.nombre} // Display 'nombre' in Chip
                                    {...getTagProps({ index })}
                                    key={option.cod} // Use 'cod' as key for Chip, assuming 'cod' is unique
                                />
                            ))
                        }
                        sx={{ mt: 2 }}
                    />

                    {/* Nuevo TextField para Comentario */}
                    <TextField
                        fullWidth
                        label="Comentario (Opcional)"
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        margin="normal"
                        multiline
                        rows={2}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{ mt: 3 }}
                    >
                        Asignar Áreas
                    </Button>

                    <Button
                        type="button"
                        variant="contained"
                        fullWidth
                        sx={{ mt: 3 }}
                        onClick={() => window.history.back()}
                    >
                        Volver
                    </Button>
                </Box>
                {
                    cargando && <Backdrop
                        sx={{ color: '#00519C', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                        open={cargando}
                    >
                        <CircularProgress color="inherit" />
                    </Backdrop>
                }


            </Paper>
        </>
    );
};

// Utility function to omit props (optional, but cleaner)
function omit(obj, ...keys) {
    const ret = {};
    Object.keys(obj).forEach(key => {
        if (!keys.includes(key)) {
            ret[key] = obj[key];
        }
    });
    return ret;
}


export default AltaAsignacionesAreasUsuario;