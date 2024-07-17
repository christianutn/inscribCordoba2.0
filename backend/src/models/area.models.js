import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";


const Area = sequelize.define('areas', {
    cod: {
        type: DataTypes.STRING(15),
        primaryKey: true
    },
    nombre: DataTypes.STRING(250),
    ministerio: {
        type: DataTypes.STRING(15)
    }
}, {
    timestamps: false
});



export default Area;
