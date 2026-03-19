// src/associateAllModels.js

// Importa la función de asociación de cada dominio/módulo
import associateInscribModels from '../domains/Inscribcordoba/api/models/asociateModelos.js';
import associateAsistenciaModels from '../domains/Asistencia/api/models/asociateModels.js';

import CcAsistenciaEventos from './cc_asistencia_eventos.models.js';
import CcAsistenciaParticipantes from './cc_asistencia_participantes.models.js';
import CcAsistenciaInscriptos from './cc_asistencia_inscriptos.models.js';
import Curso from '../domains/Inscribcordoba/api/models/curso.models.js';

const associateCcAsistenciaModels = () => {
    console.log("Configurando asociaciones para CC Asistencia...");
    CcAsistenciaEventos.belongsTo(Curso, { foreignKey: 'curso_cod', targetKey: 'cod', as: 'curso' });
    Curso.hasMany(CcAsistenciaEventos, { foreignKey: 'curso_cod', sourceKey: 'cod', as: 'cc_eventos' });

    CcAsistenciaInscriptos.belongsTo(CcAsistenciaEventos, { foreignKey: 'evento_id', as: 'evento' });
    CcAsistenciaEventos.hasMany(CcAsistenciaInscriptos, { foreignKey: 'evento_id', as: 'inscriptos' });

    CcAsistenciaInscriptos.belongsTo(CcAsistenciaParticipantes, { foreignKey: 'cuil', as: 'participante' });
    CcAsistenciaParticipantes.hasMany(CcAsistenciaInscriptos, { foreignKey: 'cuil', as: 'inscripciones' });
};

const associateAllModels = () => {
    console.log("Configurando asociaciones para el dominio principal 'Inscrib'...");
    associateInscribModels();

    console.log("Configurando asociaciones para el dominio 'Asistencia'...");
    associateAsistenciaModels();
    
    associateCcAsistenciaModels();

    // Si tienes más dominios en el futuro, los añades aquí.
    
    console.log("Todas las asociaciones de modelos han sido configuradas.");
};

export default associateAllModels;