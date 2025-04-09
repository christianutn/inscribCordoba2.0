import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";


const TipoCertificacion = sequelize.define('tipos_certificacion', {
    cod: {
        type: DataTypes.STRING(15),
        primaryKey: true
    },
    descripcion: DataTypes.STRING(250),
    
}, {
    timestamps: false
});



export default TipoCertificacion;