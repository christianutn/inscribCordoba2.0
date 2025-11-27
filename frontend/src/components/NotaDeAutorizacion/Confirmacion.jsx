import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import {
    Box,
    Typography,
    TextField,
    Autocomplete,
    Button,
    Grid,
    Card,
    CardContent,
    IconButton,
    Checkbox,
    List,
    ListItem,
    ListItemText,
    Divider,
    Stack,
    Alert,
    Snackbar,
    InputAdornment,
    Paper
} from "@mui/material";
import {
    Add as AddIcon,
    Search as SearchIcon,
    Close as CloseIcon,
    ExpandMore as ExpandMoreIcon
} from "@mui/icons-material";

import { getTutores } from "../../services/tutores.service.js";
import { getAreas } from "../../services/areas.service.js";
import { getAutorizadores } from "../../services/autorizadores.service.js";
import { getCursos } from "../../services/cursos.service.js";
import { getCoordinadores } from "../../services/coordinadores.service.js";
import { autorizar } from "../../services/notasDeAutorizacion.service.js";
import MiComponenteConAlerta from "../UIElements/Dialog";

// Custom styles to match the design
const styles = {
    pageBackground: {
        bgcolor: "#f5f7f8", // background-light
        minHeight: "100vh",
        p: { xs: 2, sm: 3, lg: 4 },
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start"
    },
    mainCard: {
        width: "100%",
        maxWidth: "1280px", // max-w-7xl
        borderRadius: "0.75rem", // rounded-xl
        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)", // shadow-lg
        border: "1px solid #F1F3F5", // border-neutral-gray
        overflow: "hidden"
    },
    header: {
        p: { xs: 3, sm: 4 },
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        justifyContent: "space-between"
    },
    sectionTitle: {
        color: "#343A40", // text-dark-gray
        fontWeight: 900, // font-black
        fontSize: "1.875rem", // text-3xl
        lineHeight: 1.25,
        letterSpacing: "-0.025em"
    },
    sectionSubtitle: {
        color: "#64748b", // text-slate-500
        fontSize: "1rem",
        fontWeight: 400,
        mt: 1
    },
    columnLeft: {
        borderRight: { md: "1px solid #F1F3F5" },
        p: { xs: 3, sm: 4 },
        pt: { xs: 3, sm: 4 }
    },
    columnRight: {
        p: { xs: 3, sm: 4 },
        pt: { xs: 3, sm: 4 },
        flex: 1
    },
    label: {
        color: "#343A40",
        fontWeight: 700,
        fontSize: "1rem",
        mb: 0.5,
        display: "block"
    },
    helperText: {
        color: "#64748b",
        fontSize: "0.875rem",
        mb: 1
    },
    createButton: {
        mt: 1,
        bgcolor: "rgba(0, 81, 156, 0.1)", // bg-primary/10
        color: "#00519c", // text-primary
        fontWeight: 700,
        textTransform: "none",
        borderRadius: "0.5rem",
        height: "40px",
        "&:hover": {
            bgcolor: "rgba(0, 81, 156, 0.2)"
        }
    },
    inputBase: {
        "& .MuiOutlinedInput-root": {
            borderRadius: "0.5rem",
            bgcolor: "#fff",
            "& fieldset": {
                borderColor: "#cbd5e1" // border-slate-300
            },
            "&:hover fieldset": {
                borderColor: "#94a3b8"
            },
            "&.Mui-focused fieldset": {
                borderColor: "#00519c", // focus:border-primary
                borderWidth: "2px"
            }
        }
    },
    courseSearchContainer: {
        display: "flex",
        alignItems: "center",
        bgcolor: "#F1F3F5", // bg-neutral-gray
        borderRadius: "0.5rem",
        height: "48px",
        px: 2
    },
    courseSearchInput: {
        flex: 1,
        border: "none",
        bgcolor: "transparent",
        outline: "none",
        fontSize: "1rem",
        color: "#343A40",
        "&::placeholder": {
            color: "#64748b"
        }
    },
    courseList: {
        maxHeight: "14vh",
        overflowY: "auto",
        pr: 1,
        mt: 2
    },
    courseListItem: {
        borderRadius: "0.5rem",
        mb: 0.5,
        "&:hover": {
            bgcolor: "#F1F3F5"
        }
    },
    selectedCourseCard: {
        bgcolor: "rgba(241, 243, 245, 0.7)", // bg-neutral-gray/70
        borderRadius: "0.5rem",
        p: 2,
        mb: 2
    },
    tutorChip: {
        bgcolor: "rgba(0, 81, 156, 0.1)",
        borderRadius: "0.5rem",
        p: 1,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mt: 1
    },
    confirmButton: {
        bgcolor: "#00519c",
        color: "#fff",
        fontWeight: 700,
        fontSize: "1rem",
        textTransform: "none",
        borderRadius: "0.5rem",
        height: "48px",
        px: 3,
        minWidth: "150px",
        "&:hover": {
            bgcolor: "rgba(0, 81, 156, 0.9)"
        }
    }
};

const Confirmacion = () => {
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const nota_autorizacion = location.state?.datos;

    // State
    const [areas, setAreas] = useState([]);
    const [directores, setDirectores] = useState([]);
    const [coordinadores, setCoordinadores] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [tutores, setTutores] = useState([]);

    const [selectedArea, setSelectedArea] = useState(null);
    const [selectedDirector, setSelectedDirector] = useState(null);
    const [selectedCoordinador, setSelectedCoordinador] = useState(null);
    const [selectedCursos, setSelectedCursos] = useState([]);
    const [cursoTutores, setCursoTutores] = useState({});
    const [cursoSearch, setCursoSearch] = useState("");

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        setCargando(true);
        fetchAreas();
        fetchDirectores();
        fetchCoordinadores();
        fetchCursos();
        fetchTutores();
        setCargando(false);
    }, []);

    const fetchAreas = async (search = "") => {
        try {
            const data = await getAreas(search);
            setAreas(data);
        } catch (err) { console.error(err); }
    };

    const fetchDirectores = async (search = "") => {
        try {
            const data = await getAutorizadores(search);
            setDirectores(data);
        } catch (err) { console.error(err); }
    };

    const fetchCoordinadores = async (search = "") => {
        try {
            const data = await getCoordinadores(search);
            // filtrar para que en este data no se repitan cuil
            const filteredData = data.filter((item, index) => data.findIndex((t) => t.cuil === item.cuil) === index);
            setCoordinadores(filteredData);
        } catch (err) { console.error(err); }
    };

    const fetchCursos = async (search = "") => {
        try {
            const data = await getCursos(search);
            setCursos(data);
        } catch (err) { console.error(err); }
    };

    const fetchTutores = async (search = "") => {
        try {
            const data = await getTutores(search);
            setTutores(data);
        } catch (err) { console.error(err); }
    };

    const handleCreate = (type) => {
        console.log(`Crear ${type}`);
    };

    const handleCursoToggle = (curso) => {

        const isSelected = selectedCursos.some((c) => c.cod === curso.cod);
        if (isSelected) {
            setSelectedCursos(selectedCursos.filter((c) => c.cod !== curso.cod));
            const newCursoTutores = { ...cursoTutores };
            delete newCursoTutores[curso.cod];
            setCursoTutores(newCursoTutores);
        } else {
            setSelectedCursos([...selectedCursos, curso]);
        }

    };

    const handleAddTutor = (cursoCod, tutor, rol) => {
        if (!tutor) return;
        setCursoTutores((prev) => {
            const current = prev[cursoCod] || [];
            if (current.some((t) => t.tutor.cuil === tutor.cuil && t.rol === rol)) return prev;
            return { ...prev, [cursoCod]: [...current, { tutor, rol }] };
        });
    };

    const handleRemoveTutor = (cursoCod, tutorCuil, rol) => {
        setCursoTutores((prev) => {
            const current = prev[cursoCod] || [];
            return { ...prev, [cursoCod]: current.filter((t) => !(t.tutor.cuil === tutorCuil && t.rol === rol)) };
        });
    };

    const handleConfirm = async () => {

        if (!selectedArea) return setError("Debe seleccionar un Área.");
        if (!selectedDirector) return setError("Debe seleccionar un Director/a.");
        if (!selectedCoordinador) return setError("Debe seleccionar un Coordinador/a.");
        if (selectedCursos.length === 0) return setError("Debe seleccionar al menos un curso.");

        for (const curso of selectedCursos) {
            const tutores = cursoTutores[curso.cod] || [];
            if (tutores.length === 0) return setError(`El curso "${curso.nombre}" debe tener al menos un profesor asignado.`);
        }

        const payload = {
            tutores: [],
            coordinadores: [{ cuil: selectedCoordinador.cuil || selectedCoordinador.detalle_persona?.cuil }],
            autorizador: { cuil: selectedDirector.cuil || selectedDirector.detalle_persona?.cuil },
            cursos: selectedCursos.map((c) => ({ cod: c.cod })),
            nota_autorizacion: { id: nota_autorizacion?.id?.toString() },
        };

        Object.entries(cursoTutores).forEach(([cursoCod, assignments]) => {
            assignments.forEach(({ tutor, rol }) => {
                payload.tutores.push({
                    cuil: tutor.cuil || tutor.detalle_persona?.cuil,
                    curso: { cod: cursoCod },
                    rol_tutor_cod: rol,
                });
            });
        });

        try {
            setCargando(true);
            await autorizar(payload);
            setOpenDialog(true);
        } catch (err) {
            setError(err.message || "Error al autorizar la nota.");
        } finally {
            setCargando(false);
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        navigate("/principal");
    };

    const renderSelector = (label, description, options, value, onChange, onSearch, createLabel) => (
        <Box sx={{ mb: 4 }}>
            <Typography sx={styles.label}>{label}</Typography>
            <Typography sx={styles.helperText}>{description}</Typography>
            <Autocomplete
                options={options}
                getOptionLabel={(option) => {
                    if (option.nombre && option.apellido) return `${option.nombre} ${option.apellido}`; // Generic person object
                    if (option.detalle_persona) return `${option.detalle_persona.nombre} ${option.detalle_persona.apellido}`;
                    return option.nombre || "";
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder={`Seleccionar ${label.toLowerCase()}`}
                        variant="outlined"
                        size="medium"
                        sx={styles.inputBase}
                        onChange={(e) => onSearch(e.target.value)}
                    />
                )}
                value={value}
                onChange={(_, newValue) => onChange(newValue)}
                isOptionEqualToValue={(option, value) => (option.cod || option.cuil || option.id) === (value.cod || value.cuil || value.id)}
                popupIcon={<ExpandMoreIcon sx={{ color: "#64748b" }} />}
            />
            <Button
                startIcon={<AddIcon />}
                fullWidth
                sx={styles.createButton}
                onClick={() => handleCreate(createLabel)}
            >
                Crear
            </Button>
        </Box>
    );

    const renderTutorSelection = (curso, rol, label) => {
        const assignments = (cursoTutores[curso.cod] || []).filter((t) => t.rol === rol);
        return (
            <Box sx={{ mt: 2 }}>
                <Typography sx={{ ...styles.label, fontSize: "0.875rem" }}>{label}</Typography>

                {/* Tutor Search Input - Mimicking the design */}
                <Box sx={{ ...styles.courseSearchContainer, bgcolor: "#fff", border: "1px solid #cbd5e1", mb: 1 }}>
                    <Box sx={{ color: "#64748b", display: "flex", alignItems: "center", pr: 1 }}>
                        <SearchIcon />
                    </Box>
                    <Autocomplete
                        options={tutores}
                        getOptionLabel={(option) => {
                            const nombre = option.detalle_persona ? `${option.detalle_persona.nombre} ${option.detalle_persona.apellido}` : option.nombre || "";
                            const cuil = option.cuil || option.detalle_persona?.cuil || "";
                            return `${nombre} - ${cuil}`;
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Buscar por Nombre, Apellido y CUIL"
                                variant="standard"
                                InputProps={{
                                    ...params.InputProps,
                                    disableUnderline: true,
                                }}
                                sx={{ width: "100%" }}
                            />
                        )}
                        onChange={(_, value) => handleAddTutor(curso.cod, value, rol)}
                        value={null}
                        blurOnSelect
                        sx={{ flex: 1 }}
                        ListboxProps={{ style: { maxHeight: 200, overflow: 'auto' } }}
                    />
                </Box>

                <Stack spacing={1}>
                    {assignments.map(({ tutor }) => (
                        <Box key={tutor.cuil || tutor.detalle_persona?.cuil} sx={styles.tutorChip}>
                            <Box>
                                <Typography sx={{ color: "#00519c", fontWeight: 700, fontSize: "0.875rem" }}>
                                    {tutor.detalle_persona ? `${tutor.detalle_persona.nombre} ${tutor.detalle_persona.apellido}` : tutor.nombre}
                                </Typography>
                                <Typography sx={{ color: "#64748b", fontSize: "0.75rem" }}>
                                    CUIL: {tutor.cuil || tutor.detalle_persona?.cuil}
                                </Typography>
                            </Box>
                            <IconButton
                                size="small"
                                onClick={() => handleRemoveTutor(curso.cod, tutor.cuil || tutor.detalle_persona?.cuil, rol)}
                                sx={{ color: "#64748b", "&:hover": { color: "#ef4444" } }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    ))}
                </Stack>
            </Box>
        );
    };

    return (
        <>
            <Box sx={styles.pageBackground}>
                <Paper sx={styles.mainCard} elevation={0}>
                    {/* Header */}
                    <Box sx={styles.header}>
                        <Box>
                            <Typography component="h1" sx={styles.sectionTitle}>
                                Autorizar Nota y Asignar Director, Área y Profesores
                            </Typography>
                            <Typography sx={styles.sectionSubtitle}>
                                Seleccioná los cursos para vincular a esta nota de autorización.
                            </Typography>
                        </Box>
                    </Box>

                    <Grid container>
                        {/* Left Column */}
                        <Grid item xs={12} xl={4} sx={styles.columnLeft}>
                            {renderSelector(
                                "Área",
                                "Seleccioná el área a la que pertenece la nota de autorización.",
                                areas,
                                selectedArea,
                                setSelectedArea,
                                fetchAreas,
                                "Área"
                            )}
                            <Divider sx={{ my: 3, borderColor: "#F1F3F5" }} />
                            {renderSelector(
                                "Director/a",
                                "Seleccioná un director o directora para la nota de autorización.",
                                directores,
                                selectedDirector,
                                setSelectedDirector,
                                fetchDirectores,
                                "Director"
                            )}
                            <Divider sx={{ my: 3, borderColor: "#F1F3F5" }} />
                            {renderSelector(
                                "Coordinador/a",
                                "Seleccioná un coordinador o coordinadora para la nota de autorización.",
                                coordinadores,
                                selectedCoordinador,
                                setSelectedCoordinador,
                                fetchCoordinadores,
                                "Coordinador"
                            )}
                        </Grid>

                        {/* Right Column */}
                        <Grid item xs={12} xl={8} sx={styles.columnRight}>
                            <Box sx={{ mb: 4 }}>
                                <Typography sx={styles.label}>Cursos</Typography>
                                <Typography sx={styles.helperText}>Buscá y seleccioná los cursos que querés asignar.</Typography>

                                <Box sx={styles.courseSearchContainer}>
                                    <SearchIcon sx={{ color: "#64748b", mr: 1 }} />
                                    <input
                                        style={styles.courseSearchInput}
                                        placeholder="Buscar cursos por nombre"
                                        value={cursoSearch}
                                        onChange={(e) => {
                                            setCursoSearch(e.target.value);
                                            fetchCursos(e.target.value);
                                        }}
                                    />
                                </Box>
                                <Button
                                    startIcon={<AddIcon />}
                                    sx={{ ...styles.createButton, width: "auto", px: 2, mt: 2 }}
                                    onClick={() => handleCreate("Curso")}
                                >
                                    Crear
                                </Button>

                                <List sx={styles.courseList}>
                                    {cursos.map((curso) => {
                                        const isSelected = selectedCursos.some((c) => c.cod === curso.cod);
                                        return (
                                            <ListItem
                                                key={curso.cod}
                                                button
                                                onClick={() => handleCursoToggle(curso)}
                                                sx={styles.courseListItem}
                                            >
                                                <Checkbox
                                                    edge="start"
                                                    checked={isSelected}
                                                    disableRipple
                                                    sx={{
                                                        color: "#cbd5e1",
                                                        "&.Mui-checked": { color: "#00519c" }
                                                    }}
                                                />
                                                <ListItemText
                                                    primary={curso.nombre}
                                                    primaryTypographyProps={{
                                                        sx: { color: "#343A40", fontWeight: 400 }
                                                    }}
                                                />
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            </Box>

                            <Divider sx={{ my: 4, borderColor: "#F1F3F5" }} />

                            <Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                    <Box>
                                        <Typography sx={styles.label}>
                                            Cursos Seleccionados ({selectedCursos.length})
                                        </Typography>
                                        <Typography sx={styles.helperText}>
                                            Asigná los profesores para cada curso seleccionado.
                                        </Typography>
                                    </Box>
                                    <Button
                                        startIcon={<AddIcon />}
                                        sx={{ ...styles.createButton, width: "auto", px: 2 }}
                                        onClick={() => handleCreate("Profesor/a")}
                                    >
                                        Crear Profesor/a
                                    </Button>
                                </Box>

                                <Stack spacing={2}>
                                    {selectedCursos.map((curso) => (
                                        <Box key={curso.cod} sx={styles.selectedCourseCard}>
                                            <Typography sx={{ color: "#343A40", fontWeight: 700, mb: 2 }}>
                                                {curso.nombre}
                                            </Typography>
                                            <Stack spacing={2}>
                                                {renderTutorSelection(curso, "CPE", "Profesor/a con permiso de edición")}
                                                {renderTutorSelection(curso, "SPE", "Profesor/a sin permiso de edición")}
                                            </Stack>
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        </Grid>
                    </Grid>

                    <Box sx={{ p: 4, borderTop: "1px solid #F1F3F5", display: "flex", justifyContent: "flex-end" }}>
                        <Button
                            onClick={handleConfirm}
                            sx={styles.confirmButton}
                        >
                            Confirmar
                        </Button>
                    </Box>
                </Paper>

                <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
                    <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
                        {error}
                    </Alert>
                </Snackbar>

                <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)}>
                    <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
                        {success}
                    </Alert>
                </Snackbar>

                <MiComponenteConAlerta
                    openAlertDialog={openDialog}
                    setOpenAlertDialog={handleCloseDialog}
                    titulo="Éxito"
                    mensaje="Nota de Autorización confirmada con Exito, presione continuar para salir"
                />
            </Box>
            {

                cargando && <Backdrop
                    sx={{ color: '#00519C', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={cargando}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>

            }
        </>
    );
};

export default Confirmacion;