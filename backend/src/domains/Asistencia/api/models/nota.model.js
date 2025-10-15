import { DataTypes } from "sequelize";
import sequelize from "../../../../config/database.js"; // Ajusta la ruta a tu config de DB

const Nota = sequelize.define('asistencia_notas', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    id_evento: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'asistencia_inscriptos', // Nombre de la tabla referenciada
            key: 'id_evento'
        }
    },
    cuil: {
        type: DataTypes.STRING(11),
        allowNull: false,
        references: {
            model: 'asistencia_inscriptos', // Nombre de la tabla referenciada
            key: 'cuil'
        }
    },
    nota: {
        type: DataTypes.DECIMAL(5, 2), // Precisión de 5 dígitos, 2 de ellos decimales (ej. 100.00, 99.50)
        allowNull: true // Permite valores nulos, tal como `DEFAULT NULL`
    }
}, {
    tableName: 'asistencia_notas',
    timestamps: false,
    indexes: [
        // Sequelize creará automáticamente un índice para la clave foránea,
        // pero definimos explícitamente el índice único compuesto.
        {
            unique: true,
            fields: ['id_evento', 'cuil']
        }
    ]
});

export default Nota;