import React, { useState, useMemo } from 'react';
import { Button, Box, Typography, Paper, TextField, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import TutorModal from './components/TutorModal';
import TutoresTable from './components/TutoresTable';
import useTutores from './hooks/useTutores';

const GestionTutores = () => {
    const { tutores, fetchTutores } = useTutores();
    const [openModal, setOpenModal] = useState(false);
    const [selectedTutor, setSelectedTutor] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTutores = useMemo(() => {
        if (!searchTerm) return tutores;
        const lowerSearch = searchTerm.toLowerCase();
        return tutores.filter(tutor =>
            (tutor.detalle_persona?.nombre && tutor.detalle_persona.nombre.toLowerCase().includes(lowerSearch)) ||
            (tutor.detalle_persona?.apellido && tutor.detalle_persona.apellido.toLowerCase().includes(lowerSearch)) ||
            (tutor.cuil && tutor.cuil.toLowerCase().includes(lowerSearch))
        );
    }, [tutores, searchTerm]);

    const handleOpenModal = () => {
        setSelectedTutor(null);
        setOpenModal(true);
    };

    const handleEditTutor = (tutor) => {
        setSelectedTutor(tutor);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedTutor(null);
    };

    const handleSuccess = () => {
        fetchTutores();
    };

    return (
        <Box sx={{ p: 3 }}>
            <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" component="h1">
                        Gestión de Tutores
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleOpenModal}
                    >
                        Agregar Nuevo Tutor
                    </Button>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        placeholder="Buscar por Nombre, Apellido o CUIL"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
            </Paper>

            <TutoresTable
                tutores={filteredTutores}
                onEdit={handleEditTutor}
            />

            <TutorModal
                open={openModal}
                onClose={handleCloseModal}
                onSuccess={handleSuccess}
                tutor={selectedTutor}
            />
        </Box>
    );
};

export default GestionTutores;
