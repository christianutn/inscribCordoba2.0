import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Curso from '../domains/Inscribcordoba/api/models/curso.models.js';

const CcAsistenciaEventos = sequelize.define('cc_asistencia_eventos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    curso_cod: {
        type: DataTypes.STRING(15),
        allowNull: false,
        references: {
            model: Curso,
            key: 'cod'
        }
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    horario: {
        type: DataTypes.STRING(45),
        allowNull: false
    },
    ubicacion: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    cupo: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    docente: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    tableName: 'cc_asistencia_eventos',
    timestamps: false
});

export default CcAsistenciaEventos;
