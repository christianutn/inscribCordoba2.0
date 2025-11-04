import { DataTypes } from "sequelize";
import sequelize from "../../../../config/database.js";

const ControlData = sequelize.define("control_data_fecha_inicio_cursada", {
  id: {
    type: DataTypes.TINYINT,
    allowNull: false,
    primaryKey: true,
    defaultValue: 1, // Valor constante
  },
  maximoCursosXMes: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  maximoCuposXMes: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  maximoCuposXDia: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  maximoCursosXDia: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  mesBloqueado: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  maximoAcumulado: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: "control_data_fecha_inicio_cursada", // Nombre de la tabla en la base de datos
  timestamps: false, // Desactiva los timestamps si no necesitas createdAt/updatedAt
});

export default ControlData;
