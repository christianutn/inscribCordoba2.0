import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CcAsistenciaParticipantes = sequelize.define('cc_asistencia_participantes', {
    cuil: {
        type: DataTypes.STRING(11),
        primaryKey: true,
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    apellido: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    correo: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    es_empleado: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    reparticion: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    tableName: 'cc_asistencia_participantes',
    timestamps: false
});

export default CcAsistenciaParticipantes;
