import { DataTypes } from "sequelize"
import Ministerio from "./ministerio.models.js";

import sequelize from "../config/database.js"

const areas = sequelize.define('areas', {
  cod: {
    type: DataTypes.STRING(15),
    primaryKey: true
  },
  nombre: DataTypes.STRING(100),
  ministerio: {
    type: DataTypes.STRING(15)
  }
},

  {
    timestamps: false
  });

areas.belongsTo(Ministerio, { foreignKey: 'ministerio', as: 'detalle_ministerio' });

export default areas