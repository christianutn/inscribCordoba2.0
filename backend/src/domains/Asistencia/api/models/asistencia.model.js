// src/modules/asistencia/models/asistencia.model.js
import { DataTypes } from "sequelize";
import sequelize from "../../../../config/database.js"; 


const Asistencia = sequelize.define('asistencia_asistencias', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    cuil: {
        type: DataTypes.STRING(11),
        allowNull: false
    },
    id_evento: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    estado_asistencia: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'asistencia_asistencias',
    timestamps: false,
    indexes: [ // Para la clave única compuesta
        {
            unique: true,
            fields: ['id_evento', 'cuil', 'fecha']
        }
    ]
});

export default Asistencia;