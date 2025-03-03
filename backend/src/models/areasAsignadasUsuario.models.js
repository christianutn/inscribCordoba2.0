import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AreasAsignadasUsuario = sequelize.define('areas_asignadas_usuario', {
    usuario: {
        type: DataTypes.STRING(11),
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'usuarios',
            key: 'cuil'
        }
    },
    area: {
        type: DataTypes.STRING(15),
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'areas',
            key: 'cod'
        }
    },
    comentario: {
        type: DataTypes.STRING(250),
        allowNull: true,
        defaultValue: 'Sin comentarios'
    }
}, {
    timestamps: false
});

export default AreasAsignadasUsuario;
