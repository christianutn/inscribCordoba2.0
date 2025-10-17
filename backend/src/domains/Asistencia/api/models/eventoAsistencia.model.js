// src/modules/asistencia/models/evento.model.js
import { DataTypes } from "sequelize";
import sequelize from "../../../../config/database.js"; 


const Evento = sequelize.define('asistencia_eventos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    id_curso: {
        type: DataTypes.INTEGER,
        allowNull: false
        // La foreign key se define en las asociaciones
    },
    fecha_desde: {
        type: DataTypes.DATEONLY, // Usar DATEONLY para campos DATE de SQL
        allowNull: true
    },
    fecha_hasta: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    comentario_horario: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    sala: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    nombre_apellido_docente: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    capacidad: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'asistencia_eventos',
    timestamps: false
});

export default Evento;