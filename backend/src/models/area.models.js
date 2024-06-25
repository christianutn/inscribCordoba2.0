import {DataTypes} from "sequelize"

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

export default areas