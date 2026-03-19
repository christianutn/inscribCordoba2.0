import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import CcAsistenciaEventos from './cc_asistencia_eventos.models.js';
import CcAsistenciaParticipantes from './cc_asistencia_participantes.models.js';

const CcAsistenciaInscriptos = sequelize.define('cc_asistencia_inscriptos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    cuil: {
        type: DataTypes.STRING(11),
        allowNull: false,
        references: {
            model: CcAsistenciaParticipantes,
            key: 'cuil'
        }
    },
    evento_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: CcAsistenciaEventos,
            key: 'id'
        }
    },
    nota: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    estado_asistencia: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    }
}, {
    tableName: 'cc_asistencia_inscriptos',
    timestamps: false
});

export default CcAsistenciaInscriptos;
