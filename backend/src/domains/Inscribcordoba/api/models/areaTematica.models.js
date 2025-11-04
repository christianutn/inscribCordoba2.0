import { DataTypes } from "sequelize";
import sequelize from "../../../../config/database.js";


const AreaTematica = sequelize.define('areas_tematicas', {
    cod: {
        type: DataTypes.STRING(15),
        primaryKey: true
    },
    descripcion: DataTypes.STRING(250),
    
}, {
    timestamps: false
});



export default AreaTematica;