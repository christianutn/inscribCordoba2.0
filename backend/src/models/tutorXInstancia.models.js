import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Persona from "./personas.models.js";
import Instancia from "./instancia.models.js";

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

TutoresXInstancia.belongsTo(Persona, { foreignKey: 'cuil', as: 'detalle_tutor' });

// Define las relaciones con alias únicos
TutoresXInstancia.belongsTo(Instancia, { foreignKey: 'curso', targetKey: 'curso', as: 'detalle_curso' });
TutoresXInstancia.belongsTo(Instancia, { foreignKey: 'fecha_inicio_curso', targetKey: 'fecha_inicio_curso', as: 'detalle_instancia' });

export default TutoresXInstancia;
