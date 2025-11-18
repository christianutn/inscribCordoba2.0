import { DataTypes } from "sequelize";
import sequelize from "../../../../config/database.js";

const NotasAutorizacion = sequelize.define('notas_autorizacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  autorizador_cuil: {
    type: DataTypes.STRING(11),
    allowNull: true, // Según tu CREATE TABLE, es DEFAULT NULL
    references: {
      model: 'autorizadores', // Referencia a la tabla 'autorizadores'
      key: 'cuil',
    }
  },
  fecha_desde: {
    type: DataTypes.DATEONLY, // Usar DATEONLY para `date` SQL
    allowNull: true, // Según tu CREATE TABLE, es DEFAULT NULL
  },
}, {
  tableName: 'notas_autorizacion',
  timestamps: false, // Asumo que no tienes campos `createdAt` y `updatedAt`
});

export default NotasAutorizacion;