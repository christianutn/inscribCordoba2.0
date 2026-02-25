import { DataTypes } from 'sequelize';
import sequelize from '../../../../config/database.js'; // Ajusta la ruta si es necesario

const fechas_inhabilitadas_fin = sequelize.define('fechas_inhabilitadas_fin', {
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
        type: DataTypes.STRING(250),
        allowNull: true
    }
}, {
    timestamps: false,
    tableName: 'fechas_inhabilitadas_fin'
});

export default fechas_inhabilitadas_fin;
