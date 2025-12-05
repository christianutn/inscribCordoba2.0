import React, { useState, useMemo } from 'react';
import { Box, Button, Alert, CircularProgress, Snackbar, TextField, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import useUsuarios from './hooks/useUsuarios';
import UsuariosTable from './components/UsuariosTable';
import UsuarioModal from './components/UsuarioModal';

const GestionUsuarios = () => {
    const {
        data, loading, error,
        createItem, updateItem, deleteItem,
        auxiliaryData
    } = useUsuarios();

    const [modalOpen, setModalOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        const lowerSearch = searchTerm.toLowerCase();
        return data.filter(item => {
            const cuil = item.cuil ? String(item.cuil).toLowerCase() : '';
            const nombre = item.detalle_persona?.nombre ? item.detalle_persona.nombre.toLowerCase() : '';
            const apellido = item.detalle_persona?.apellido ? item.detalle_persona.apellido.toLowerCase() : '';
            return cuil.includes(lowerSearch) || nombre.includes(lowerSearch) || apellido.includes(lowerSearch);
        });
    }, [data, searchTerm]);

    const handleCreate = () => {
        setCurrentRecord(null);
        setModalOpen(true);
    };

    const handleEdit = (record) => {
        setCurrentRecord(record);
        setModalOpen(true);
    };

    const handleDelete = async (record) => {
        if (window.confirm(`¿Está seguro de eliminar el usuario ${record.cuil}?`)) {
            const result = await deleteItem(record.cuil);
            if (result.success) {
                setNotification({ open: true, message: 'Usuario eliminado correctamente', severity: 'success' });
            } else {
                setNotification({ open: true, message: result.error, severity: 'error' });
            }
        }
    };

    const handleSave = async (formData) => {
        let result;
        if (currentRecord) {
            result = await updateItem(formData);
        } else {
            result = await createItem(formData);
        }

        if (result.success) {
            setNotification({
                open: true,
                message: `Usuario ${currentRecord ? 'actualizado' : 'creado'} correctamente`,
                severity: 'success'
            });
            setModalOpen(false);
        } else {
            setNotification({ open: true, message: result.error, severity: 'error' });
        }
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    if (loading && data.length === 0) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ mt: 2 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                <TextField
                    placeholder="Buscar por Nombre, Apellido o CUIL..."
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: 300 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreate}
                >
                    Nuevo Usuario
                </Button>
            </Box>

            <UsuariosTable
                data={filteredData}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <UsuarioModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                record={currentRecord}
                auxiliaryData={auxiliaryData}
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

export default GestionUsuarios;
