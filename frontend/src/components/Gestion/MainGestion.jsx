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

const MainGestion = ({ user }) => {
    const userRole = user?.rol;

    const allOptions = [
        { label: "Eventos", roles: ['ADM', 'GA'] },
        { label: "Usuarios", roles: ['ADM', 'GA'] },
        { label: "Áreas", roles: ['ADM'] },
        { label: "Asignaciones Áreas", roles: ['ADM'] },
        { label: "Ministerios", roles: ['ADM'] },
        { label: "Medios de Inscripción", roles: ['ADM'] },
        { label: "Plataformas de Dictado", roles: ['ADM'] },
        { label: "Tipos de Capacitación", roles: ['ADM'] },
        { label: "Roles Tutores", roles: ['ADM'] },
        { label: "Tutores", roles: ['ADM'] },
    ];

    // Filtrar opciones por rol
    const filteredOptions = allOptions
        .filter(opt => opt.roles.includes(userRole))
        .map(opt => opt.label);

    const [selectedOption, setSelectedOption] = useState(userRole === 'GA' ? 'Eventos' : null);

    const handleSelectOption = (value) => {
        setSelectedOption(value);
    };

    const renderFeature = () => {
        switch (selectedOption) {
            case 'Eventos':
                return <GestionEventoYCurso />;
            case 'Usuarios':
                return <GestionUsuarios readOnly={userRole === 'GA'} />;
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
            <Titulo texto={userRole === 'GA' ? "Gestión de Entidades" : "Gestión de Entidades"} />
            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 4, maxWidth: 400 }}>
                <Autocomplete
                    options={filteredOptions}
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
