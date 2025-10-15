import Participante from './participante.model.js';
import CursoAsistencia from './curso.model.js';
import Evento from './evento.model.js';
import DiasEvento from './diaEvento.model.js';
import Inscripto from './inscripcion.model.js';
import EstadoAsistencia from './estadoAsistencia.model.js';
import Asistencia from './asistencia.model.js';
import Nota from './nota.model.js'; 

const associateAsistenciaModels = () => {
    // Evento <-> CursoAsistencia (Un curso tiene muchos eventos)
    CursoAsistencia.hasMany(Evento, { foreignKey: 'id_curso', as: 'eventos' });
    Evento.belongsTo(CursoAsistencia, { foreignKey: 'id_curso', as: 'curso' });

    // Evento <-> DiasEvento (Un evento tiene muchos días)
    Evento.hasMany(DiasEvento, { foreignKey: 'id_evento', as: 'dias' });
    DiasEvento.belongsTo(Evento, { foreignKey: 'id_evento', as: 'evento' });

    // Evento <-> Inscripto (Un evento tiene muchos inscriptos)
    Evento.hasMany(Inscripto, { foreignKey: 'id_evento', as: 'inscriptos' });
    Inscripto.belongsTo(Evento, { foreignKey: 'id_evento', as: 'evento' });

    // Participante <-> Inscripto (Un participante puede estar inscripto en muchos eventos)
    Participante.hasMany(Inscripto, { foreignKey: 'cuil', as: 'inscripciones' });
    Inscripto.belongsTo(Participante, { foreignKey: 'cuil', as: 'participante' });

    // Asistencia se relaciona con varias tablas (es una tabla de unión con estado)
    // Asistencia -> EstadoAsistencia
    EstadoAsistencia.hasMany(Asistencia, { foreignKey: 'estado_asistencia', as: 'asistencias' });
    Asistencia.belongsTo(EstadoAsistencia, { foreignKey: 'estado_asistencia', as: 'estado' });

    // Asistencia -> Inscripto (Más complejo, por la clave compuesta)
    // Una asistencia pertenece a una inscripción específica (evento + cuil)
    Inscripto.hasMany(Asistencia, { foreignKey: 'id_evento', sourceKey: 'id_evento', as: 'registros_asistencia' });
    Inscripto.hasMany(Asistencia, { foreignKey: 'cuil', sourceKey: 'cuil', as: 'registros_asistencia_por_cuil' }); // Alias diferente si es necesario
    Asistencia.belongsTo(Inscripto, { foreignKey: 'id_evento', targetKey: 'id_evento' });
    Asistencia.belongsTo(Inscripto, { foreignKey: 'cuil', targetKey: 'cuil' });

    // Asistencia -> DiasEvento (También complejo)
    // Una asistencia pertenece a un día de evento específico (evento + fecha)
    DiasEvento.hasMany(Asistencia, { foreignKey: 'id_evento', sourceKey: 'id_evento', as: 'asistencias_del_dia' });
    DiasEvento.hasMany(Asistencia, { foreignKey: 'fecha', sourceKey: 'fecha', as: 'asistencias_por_fecha' }); // Alias diferente
    Asistencia.belongsTo(DiasEvento, { foreignKey: 'id_evento', targetKey: 'id_evento' });
    Asistencia.belongsTo(DiasEvento, { foreignKey: 'fecha', targetKey: 'fecha' });

    // --- 2. AÑADIR NUEVAS ASOCIACIONES PARA NOTA ---

    // Relación Inscripto <--> Nota (Uno a Uno)
    // Un Inscripto tiene una Nota. La clave foránea está en la tabla de Notas.
    Inscripto.hasOne(Nota, { 
        foreignKey: 'id_evento', 
        sourceKey: 'id_evento',
        as: 'nota_final' // O simplemente 'nota'
    });
    Inscripto.hasOne(Nota, {
        foreignKey: 'cuil',
        sourceKey: 'cuil'
    });

    // Una Nota pertenece a un Inscripto.
    Nota.belongsTo(Inscripto, {
        foreignKey: 'id_evento',
        targetKey: 'id_evento'
    });
    Nota.belongsTo(Inscripto, {
        foreignKey: 'cuil',
        targetKey: 'cuil'
    });
};

export default associateAsistenciaModels;