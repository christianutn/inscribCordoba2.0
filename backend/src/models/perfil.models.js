import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";


const Perfil = sequelize.define('perfiles', {
    cod: {
        type: DataTypes.STRING(15),
        primaryKey: true
    },
    descripcion: DataTypes.STRING(250),
    
}, {
    timestamps: false
});



export default Perfil;