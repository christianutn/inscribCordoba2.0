import { DataTypes } from "sequelize";
import sequelize from "../../../../config/database.js";

const departamentos = sequelize.define("departamentos", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING(45),
        allowNull: false,
    }

}, {
    timestamps: false
});



export default departamentos