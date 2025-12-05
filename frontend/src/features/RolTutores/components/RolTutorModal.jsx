import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    FormControl,
    Select,
    MenuItem,
    TextField,
    CircularProgress,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Autocomplete,
    Alert,
    Paper
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const RolTutorModal = ({
    open,
    onClose,
    curso,
    tutores,
    roles,
    tutoresDisponibles,
    loadingTutores,
    onAsignarRol,
    onBuscarTutores
}) => {
    const [notification, setNotification] = useState({ show: false, message: '', severity: 'success' });
    const [searchValue, setSearchValue] = useState('');

    useEffect(() => {
        if (open) {
            onBuscarTutores('');
            setSearchValue('');
        }
    }, [open, onBuscarTutores]);

    const handleRolChange = async (tutor, nuevoRol) => {
        const result = await onAsignarRol(tutor.tutor_cuil, curso.cod, nuevoRol);
        if (result.success) {
            setNotification({ show: true, message: 'Rol actualizado correctamente', severity: 'success' });
        } else {
            setNotification({ show: true, message: result.error, severity: 'error' });
        }
    };

    // Cuando se selecciona un tutor, automáticamente se asigna con rol PSPE (Profesor sin permiso de edición)
    const handleSeleccionarTutor = async (tutor) => {
        if (!tutor) return;

        const rolPorDefecto = 'SPE'; // Profesor sin permiso de edición
        const result = await onAsignarRol(tutor.cuil, curso.cod, rolPorDefecto);
        if (result.success) {
            setNotification({ show: true, message: `Tutor ${tutor.detalle_persona?.nombre} ${tutor.detalle_persona?.apellido} agregado correctamente como Profesor sin permiso de edición`, severity: 'success' });
            setSearchValue('');
        } else {
            setNotification({ show: true, message: result.error, severity: 'error' });
        }
    };

    const handleSearchChange = (event, value, reason) => {
        // Solo actualizar cuando el usuario escribe, no cuando selecciona o resetea
        if (reason === 'input') {
            setSearchValue(value);
            if (value.length >= 2) {
                onBuscarTutores(value);
            }
        }
    };

    // Filtrar tutores que ya están asignados al curso
    const tutoresFiltrados = tutoresDisponibles.filter(
        tutor => !tutores.some(t => t.tutor_cuil === tutor.cuil)
    );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Typography fontWeight="bold">
                    Tutores del Curso
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    {curso?.nombre}
                </Typography>
            </DialogTitle>
            <DialogContent>
                {notification.show && (
                    <Alert
                        severity={notification.severity}
                        onClose={() => setNotification({ ...notification, show: false })}
                        sx={{ mb: 2 }}
                    >
                        {notification.message}
                    </Alert>
                )}

                {/* Lista de tutores actuales */}
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                    Tutores Asignados
                </Typography>

                {loadingTutores ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : tutores.length === 0 ? (
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                        No hay tutores asignados a este curso.
                    </Typography>
                ) : (
                    <TableContainer component={Paper} sx={{ mb: 3 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Nombre</strong></TableCell>
                                    <TableCell><strong>Apellido</strong></TableCell>
                                    <TableCell><strong>Rol</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tutores.map((tutor) => (
                                    <TableRow key={tutor.id}>
                                        <TableCell>{tutor.detalle_persona?.nombre}</TableCell>
                                        <TableCell>{tutor.detalle_persona?.apellido}</TableCell>
                                        <TableCell>
                                            <FormControl size="small" sx={{ minWidth: 200 }}>
                                                <Select
                                                    value={tutor.rol_tutor_cod}
                                                    onChange={(e) => handleRolChange(tutor, e.target.value)}
                                                    disabled={loadingTutores}
                                                >
                                                    {roles.map((rol) => (
                                                        <MenuItem key={rol.cod} value={rol.cod}>
                                                            {rol.nombre}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Agregar nuevo tutor */}
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                    Agregar Nuevo Tutor
                </Typography>

                {/* Búsqueda de tutor */}
                <Box sx={{ mb: 2 }}>
                    <Autocomplete
                        fullWidth
                        options={tutoresFiltrados}
                        getOptionLabel={(option) =>
                            `${option.detalle_persona?.nombre || ''} ${option.detalle_persona?.apellido || ''} - ${option.cuil}`
                        }
                        value={null}
                        onChange={(event, newValue) => handleSeleccionarTutor(newValue)}
                        onInputChange={handleSearchChange}
                        inputValue={searchValue}
                        filterOptions={(options, { inputValue }) => {
                            const filterValue = inputValue.toLowerCase();
                            return options.filter(option => {
                                const nombre = option.detalle_persona?.nombre?.toLowerCase() || '';
                                const apellido = option.detalle_persona?.apellido?.toLowerCase() || '';
                                const cuil = option.cuil?.toString() || '';
                                return nombre.includes(filterValue) ||
                                    apellido.includes(filterValue) ||
                                    cuil.includes(filterValue);
                            });
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Buscar Tutor por Nombre, Apellido o CUIL"
                                placeholder="Escriba para buscar..."
                                size="small"
                            />
                        )}
                        renderOption={(props, option) => (
                            <li {...props} key={option.cuil}>
                                <Box sx={{ py: 0.5 }}>
                                    <Typography variant="body1" fontWeight="medium">
                                        {option.detalle_persona?.nombre} {option.detalle_persona?.apellido}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        CUIL: {option.cuil}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Área: {option.detalle_area?.nombre || 'Sin área asignada'}
                                    </Typography>
                                </Box>
                            </li>
                        )}
                        noOptionsText="No se encontraron tutores"
                        loading={loadingTutores}
                    />
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Al seleccionar un tutor, se agregará automáticamente como "Profesor sin permiso de edición"
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="outlined">
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RolTutorModal;
