// src/associateAllModels.js

// Importa la función de asociación de cada dominio/módulo
import associateInscribModels from '../domains/Inscribcordoba/api/models/asociateModelos.js';
import associateAsistenciaModels from '../domains/Asistencia/api/models/asociateModels.js';

const associateAllModels = () => {
    console.log("Configurando asociaciones para el dominio principal 'Inscrib'...");
    associateInscribModels();

    console.log("Configurando asociaciones para el dominio 'Asistencia'...");
    associateAsistenciaModels();
    
    // Si tienes más dominios en el futuro, los añades aquí.
    
    console.log("Todas las asociaciones de modelos han sido configuradas.");
};

export default associateAllModels;