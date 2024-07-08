import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";


const TutoresXInstancia = sequelize.define("tutores_x_instancia", {
  cuil: {
    type: DataTypes.STRING(11),
    allowNull: false,
    primaryKey: true,
    validate: {
      len: [11, 11]
    }
  },
  curso: {
    type: DataTypes.STRING(15),
    allowNull: false,
    primaryKey: true
  },
  fecha_inicio_curso: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    primaryKey: true
  }
}, 
{
  timestamps: false,
  tableName: 'tutores_x_instancia'
});



export default TutoresXInstancia;
