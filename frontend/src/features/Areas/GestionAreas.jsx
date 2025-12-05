import React, { useState, useMemo } from 'react';
import { Box, Button, Alert, CircularProgress, Snackbar, TextField, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import useAreas from './hooks/useAreas';
import AreasTable from './components/AreasTable';
import AreaModal from './components/AreaModal';

const GestionAreas = () => {
    const {
        data, loading, error,
        createItem, updateItem, deleteItem,
        auxiliaryData
    } = useAreas();

    const [modalOpen, setModalOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        const lowerSearch = searchTerm.toLowerCase();
        return data.filter(item => {
            const cod = item.cod ? String(item.cod).toLowerCase() : '';
            const nombre = item.nombre ? item.nombre.toLowerCase() : '';
            const ministerio = item.detalle_ministerio?.nombre ? item.detalle_ministerio.nombre.toLowerCase() : '';
            return cod.includes(lowerSearch) || nombre.includes(lowerSearch) || ministerio.includes(lowerSearch);
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
                message: `Área ${currentRecord ? 'actualizada' : 'creada'} correctamente`,
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
                    placeholder="Buscar por Código, Nombre o Ministerio..."
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: 350 }}
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
                    Nueva Área
                </Button>
            </Box>

            <AreasTable
                data={filteredData}
                onEdit={handleEdit}
            />

            <AreaModal
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

export default GestionAreas;
