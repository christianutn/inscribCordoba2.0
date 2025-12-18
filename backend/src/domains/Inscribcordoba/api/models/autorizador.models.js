import { DataTypes } from 'sequelize';
import sequelize from "../../../../config/database.js";

const Autorizador = sequelize.define('autorizadores', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  area: {
    type: DataTypes.STRING(15),
    allowNull: false,
    references: {
      model: 'areas',
      key: 'cod',
    }
  },
  cuil: {
    type: DataTypes.STRING(11),
    allowNull: true,
    // Nota: Si en SQL no definiste FK a personas, Sequelize solo lo usa para documentación interna
  },
  descripcion_cargo: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  fecha_desde: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  // --- CAMPOS FALTANTES QUE ESTÁN EN TU SQL ---
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: true, // DEFAULT NULL en SQL
  },
  apellido: {
    type: DataTypes.STRING(100),
    allowNull: true, // DEFAULT NULL en SQL
  },
  mail: {
    type: DataTypes.STRING(100),
    allowNull: true, // DEFAULT NULL en SQL
  },
  celular: {
    type: DataTypes.STRING(10),
    allowNull: true, // DEFAULT NULL en SQL
  },
}, {
  tableName: 'autorizadores',
  timestamps: false,
  underscored: false, // Para que coincida exactamente con los nombres de tu SQL
  indexes: [
    {
      unique: true,
      fields: ['area', 'cuil', 'fecha_desde'],
      name: 'UQ_Area_Curso_FechaDesde'
    }
  ]
});

export default Autorizador;