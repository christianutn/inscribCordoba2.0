import { DataTypes } from 'sequelize';
import sequelize from "../../../../config/database.js";

const Autorizador = sequelize.define('autorizadores', {
  area: {
    type: DataTypes.STRING(15),
    allowNull: false,
    references: {
      model: 'areas', // Referencia a la tabla 'areas'
      key: 'cod',
    }
  },
  cuil: {
    type: DataTypes.STRING(11),
    allowNull: false,
    primaryKey: true, 
    references: {
      model: 'personas', 
      key: 'cuil',
    }
  },
  descripcion_cargo: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  fecha_desde: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
}, {
  tableName: 'autorizadores',
  timestamps: false, 
  indexes: [
    {
      unique: true,
      fields: ['area', 'cuil', 'fecha_desde'],
      name: 'UQ_Area_Curso_FechaDesde'
    }
  ]
});

export default Autorizador;