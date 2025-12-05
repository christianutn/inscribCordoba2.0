import React, { useState, useMemo, useCallback } from 'react';
import { Box, Alert, CircularProgress, Snackbar, TextField, InputAdornment, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import useRolTutores from './hooks/useRolTutores';
import RolTutoresTable from './components/RolTutoresTable';
import RolTutorModal from './components/RolTutorModal';

const GestionRolTutores = () => {
    const {
        cursos, tutoresCurso, roles, tutoresDisponibles,
        loading, loadingTutores, error,
        fetchTutoresCurso, fetchTutoresDisponibles, asignarRol
    } = useRolTutores();

    const [modalOpen, setModalOpen] = useState(false);
    const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCursos = useMemo(() => {
        if (!searchTerm) return cursos;
        const lowerSearch = searchTerm.toLowerCase();
        return cursos.filter(item =>
            (item.nombre && item.nombre.toLowerCase().includes(lowerSearch)) ||
            (item.cod && item.cod.toLowerCase().includes(lowerSearch)) ||
            (item.detalle_area?.nombre && item.detalle_area.nombre.toLowerCase().includes(lowerSearch)) ||
            (item.detalle_area?.detalle_ministerio?.nombre && item.detalle_area.detalle_ministerio.nombre.toLowerCase().includes(lowerSearch))
        );
    }, [cursos, searchTerm]);

    const handleVerTutores = async (curso) => {
        setCursoSeleccionado(curso);
        setModalOpen(true);
        await fetchTutoresCurso(curso.cod);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setCursoSeleccionado(null);
    };

    const handleAsignarRol = async (tutor_cuil, curso_cod, rol_tutor_cod) => {
        const result = await asignarRol(tutor_cuil, curso_cod, rol_tutor_cod);
        if (result.success) {
            setNotification({
                open: true,
                message: 'Rol asignado correctamente',
                severity: 'success'
            });
        } else {
            setNotification({
                open: true,
                message: result.error || 'Error al asignar el rol',
                severity: 'error'
            });
        }
        return result;
    };

    const handleBuscarTutores = useCallback(async (busqueda) => {
        await fetchTutoresDisponibles(busqueda);
    }, [fetchTutoresDisponibles]);

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    if (loading && cursos.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                Gestión de Roles de Tutores
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                <TextField
                    placeholder="Buscar por curso, área o ministerio..."
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: 400 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            <RolTutoresTable
                data={filteredCursos}
                onVerTutores={handleVerTutores}
            />

            <RolTutorModal
                open={modalOpen}
                onClose={handleCloseModal}
                curso={cursoSeleccionado}
                tutores={tutoresCurso}
                roles={roles}
                tutoresDisponibles={tutoresDisponibles}
                loadingTutores={loadingTutores}
                onAsignarRol={handleAsignarRol}
                onBuscarTutores={handleBuscarTutores}
            />

            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default GestionRolTutores;
