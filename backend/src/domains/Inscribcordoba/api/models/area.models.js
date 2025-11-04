import { DataTypes } from "sequelize";
import sequelize from "../../../../config/database.js";


const Area = sequelize.define('areas', {
    cod: {
        type: DataTypes.STRING(15),
        primaryKey: true
    },
    nombre: DataTypes.STRING(250),
    ministerio: {
        type: DataTypes.STRING(15)
    },
    esVigente: {
        type: DataTypes.TINYINT(1), // Cambiado a TINYINT(1) para coincidir con MySQL
        allowNull: true
    }
}, {
    timestamps: false
});



export default Area;
