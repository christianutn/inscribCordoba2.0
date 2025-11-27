import { DataTypes } from 'sequelize';
import sequelize from '../../../../config/database.js';

const Coordinadores = sequelize.define('coordinadores', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    cuil: {
        type: DataTypes.STRING(11),
        allowNull: false,
        references: {
            model: 'personas',
            key: 'cuil'
        }
    },
    nota_autorizacion_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'notas_autorizacion',
            key: 'id'
        }
    }
}, {
    tableName: 'coordinadores',
    timestamps: false,
    uniqueKeys: {
        UQ_Persona_NotaAutorizacion: {
            fields: ['cuil', 'nota_autorizacion_id']
        }
    }
});

export default Coordinadores;
