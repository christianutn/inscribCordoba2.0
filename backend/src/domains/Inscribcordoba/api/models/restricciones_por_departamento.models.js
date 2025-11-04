import { DataTypes } from "sequelize";
import sequelize from "../../../../config/database.js";


const RestriccionesPorDepartamento= sequelize.define('restricciones_por_departamento', {
    curso: {
        type: DataTypes.STRING(15),
        primaryKey: true
    },
    fecha_inicio_curso: {
        type: DataTypes.DATEONLY,
        primaryKey: true
    },
    departamento_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    }
    
}, {
    timestamps: false
});



export default RestriccionesPorDepartamento;