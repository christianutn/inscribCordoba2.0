// src/modules/asistencia/models/diasEvento.model.js
import { DataTypes } from "sequelize";
import sequelize from "../../../../config/database.js"; 


const DiasEvento = sequelize.define('asistencia_dias_evento', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    id_evento: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }
}, {
    tableName: 'asistencia_dias_evento',
    timestamps: false,
    indexes: [ // Para la clave única compuesta
        {
            unique: true,
            fields: ['id_evento', 'fecha']
        }
    ]
});

export default DiasEvento;