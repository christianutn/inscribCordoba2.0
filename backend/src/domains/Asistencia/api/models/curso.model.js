import { DataTypes } from "sequelize";
import sequelize from "../../../../config/database.js"; 


const CursoAsistencia = sequelize.define('asistencia_cursos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
}, {
    tableName: 'asistencia_cursos',
    timestamps: false
});

export default CursoAsistencia;