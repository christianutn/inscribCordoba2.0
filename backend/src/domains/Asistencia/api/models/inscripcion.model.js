// src/modules/asistencia/models/inscripto.model.js
import { DataTypes } from "sequelize";
import sequelize from "../../../../config/database.js"; 


const Inscripcion = sequelize.define('asistencia_inscripciones', {
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
    cuil: {
        type: DataTypes.STRING(11),
        allowNull: false
    }
}, {
    tableName: 'asistencia_inscripciones',
    timestamps: false,
    indexes: [ // Para la clave única compuesta
        {
            unique: true,
            fields: ['id_evento', 'cuil']
        }
    ]
});

export default Inscripcion;