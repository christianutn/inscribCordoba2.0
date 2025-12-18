import { DataTypes } from 'sequelize';
import sequelize from '../../../../config/database.js'; // Ajusta la ruta si es necesario

const fechas_inhabilitadas = sequelize.define('fechas_inhabilitadas', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    motivo: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    timestamps: false,
    tableName: 'fechas_inhabilitadas'
});

export default fechas_inhabilitadas;
