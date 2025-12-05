import React, { useState } from 'react';
import { Box, Typography, Divider, Alert } from '@mui/material';
import Autocomplete from '../UIElements/Autocomplete'; // Adjust path if necessary
import Titulo from '../fonts/TituloPrincipal';
import GestionCursos from '../../features/Cursos/GestionCursos';
import GestionUsuarios from '../../features/Usuarios/GestionUsuarios';
import GestionAsignacionesAreas from '../../features/AsignacionesAreasUsuario/GestionAsignacionesAreas';
import GestionAreas from '../../features/Areas/GestionAreas';
import GestionMinisterios from '../../features/Ministerios/GestionMinisterios';
import GestionMediosInscripcion from '../../features/MediosDeInscripcion/GestionMediosInscripcion';
import GestionPlataformasDictado from '../../features/PlataformasDeDictado/GestionPlataformasDictado';
import GestionTiposCapacitacion from '../../features/TiposDeCapacitacion/GestionTiposCapacitacion';
import GestionEventos from '../../features/Eventos/GestionEventos';
import GestionRolesTutores from '../../features/RolTutores/GestionRolTutores';

const MainGestion = () => {
    const [selectedOption, setSelectedOption] = useState(null);

    const options = [
        "Cursos",
        "Usuarios",
        "Areas",
        "Asignaciones Areas",
        "Ministerios",
        "Medios de Inscripción",
        "Plataformas de Dictado",
        "Tipos de Capacitación",
        "Eventos",
        "Roles Tutores",
        // Add other options as features are implemented
        // "Ministerios", "Áreas", "Personas", "Tutores", "Medios de Inscripción", 
        // "Plataformas de Dictado", "Tipos de Capacitación", "Asignar areas a usuarios"
    ];

    const handleSelectOption = (value) => {
        setSelectedOption(value);
    };

    const renderFeature = () => {
        switch (selectedOption) {
            case 'Cursos':
                return <GestionCursos />;
            case 'Usuarios':
                return <GestionUsuarios />;
            case 'Areas':
                return <GestionAreas />;
            case 'Asignaciones Areas':
                return <GestionAsignacionesAreas />;
            case 'Ministerios':
                return <GestionMinisterios />;
            case 'Medios de Inscripción':
                return <GestionMediosInscripcion />;
            case 'Plataformas de Dictado':
                return <GestionPlataformasDictado />;
            case 'Tipos de Capacitación':
                return <GestionTiposCapacitacion />;
            case 'Eventos':
                return <GestionEventos />;
            case 'Roles Tutores':
                return <GestionRolesTutores />;
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
