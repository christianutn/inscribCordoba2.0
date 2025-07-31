import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";


const RestriccionesPorCorrelatividad = sequelize.define('restricciones_por_correlatividad', {
    curso: {
        type: DataTypes.STRING(15),
        primaryKey: true
    },
    fecha_inicio_curso: {
        type: DataTypes.DATEONLY,
        primaryKey: true
    },
    curso_correlativo: {
        type: DataTypes.STRING(15),
        primaryKey: true
    }
    
}, {
    timestamps: false
});



export default RestriccionesPorCorrelatividad;