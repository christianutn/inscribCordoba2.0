// src/modules/asistencia/models/estadoAsistencia.model.js
import { DataTypes } from "sequelize";
import sequelize from "../../../../config/database.js"; 


const EstadoAsistencia = sequelize.define('asistencia_estados_asistencia', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.STRING(100), // Asumiendo que 'descripcion' debe ser un string
        allowNull: false
    }
}, {
    tableName: 'asistencia_estados_asistencia',
    timestamps: false
});

export default EstadoAsistencia;