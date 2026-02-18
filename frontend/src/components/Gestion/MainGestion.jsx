import React, { useState } from 'react';
import { Box, Typography, Divider, Alert } from '@mui/material';
import Autocomplete from '../UIElements/Autocomplete'; // Adjust path if necessary
import Titulo from '../fonts/TituloPrincipal';
import GestionEventoYCurso from '../../features/EventoYCurso/GestionEventoYCurso';
import GestionUsuarios from '../../features/Usuarios/GestionUsuarios';
import GestionAsignacionesAreas from '../../features/AsignacionesAreasUsuario/GestionAsignacionesAreas';
import GestionAreas from '../../features/Areas/GestionAreas';
import GestionMinisterios from '../../features/Ministerios/GestionMinisterios';
import GestionMediosInscripcion from '../../features/MediosDeInscripcion/GestionMediosInscripcion';
import GestionPlataformasDictado from '../../features/PlataformasDeDictado/GestionPlataformasDictado';
import GestionTiposCapacitacion from '../../features/TiposDeCapacitacion/GestionTiposCapacitacion';
import GestionRolesTutores from '../../features/RolTutores/GestionRolTutores';
import GestionTutores from '../../features/Tutores/GestionTutores';

const MainGestion = () => {
    const [selectedOption, setSelectedOption] = useState(null);

    const options = [
        "Eventos",
        "Usuarios",
        "Áreas",
        "Asignaciones Áreas",
        "Ministerios",
        "Medios de Inscripción",
        "Plataformas de Dictado",
        "Tipos de Capacitación",
        "Roles Tutores",
        "Tutores",
        // Add other options as features are implemented
        // "Ministerios", "Áreas", "Personas", "Tutores", "Medios de Inscripción", 
        // "Plataformas de Dictado", "Tipos de Capacitación", "Asignar areas a usuarios"
    ];

    const handleSelectOption = (value) => {
        setSelectedOption(value);
    };

    const renderFeature = () => {
        switch (selectedOption) {
            case 'Eventos':
                return <GestionEventoYCurso />;
            case 'Usuarios':
                return <GestionUsuarios />;
            case 'Áreas':
                return <GestionAreas />;
            case 'Asignaciones Áreas':
                return <GestionAsignacionesAreas />;
            case 'Ministerios':
                return <GestionMinisterios />;
            case 'Medios de Inscripción':
                return <GestionMediosInscripcion />;
            case 'Plataformas de Dictado':
                return <GestionPlataformasDictado />;
            case 'Tipos de Capacitación':
                return <GestionTiposCapacitacion />;

            case 'Roles Tutores':
                return <GestionRolesTutores />;
            case 'Tutores':
                return <GestionTutores />;
            default:
                return (
                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Alert severity="info">Seleccione una opción para comenzar la gestión.</Alert>
                    </Box>
                );
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Titulo texto="Gestión de Entidades" />
            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 4, maxWidth: 400 }}>
                <Autocomplete
                    options={options}
                    label="Seleccione una Entidad"
                    value={selectedOption}
                    getValue={handleSelectOption}
                />
            </Box>

            <Box>
                {renderFeature()}
            </Box>
        </Box>
    );
};

export default MainGestion;
