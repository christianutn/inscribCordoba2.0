import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";


const Ministerio = sequelize.define('ministerios', {
    cod: {
        type: DataTypes.STRING(15),
        primaryKey: true
    },
    nombre: DataTypes.STRING(100)
}, {
    timestamps: false
});



//Ministerio.hasMany(Area, { foreignKey: 'ministerio', as: 'areas' }); // Establece la relación de uno a muchos

export default Ministerio;
