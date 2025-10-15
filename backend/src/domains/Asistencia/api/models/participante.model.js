// src/modules/asistencia/models/participante.model.js
import { DataTypes } from "sequelize";
import sequelize from "../../../../config/database.js"; 

const Participante = sequelize.define('asistencia_participantes', {
    cuil: {
        type: DataTypes.STRING(11),
        primaryKey: true,
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    apellido: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    correo_electronico: {
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
    tableName: 'asistencia_participantes',
    timestamps: false
});

export default Participante;