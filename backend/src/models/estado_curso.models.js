import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Estado_curso = sequelize.define("estados_cursos", {
    cod: {
        type: DataTypes.STRING(10),
        primaryKey: true
    },
    descripcion: DataTypes.STRING(45)
}, {
    timestamps: false
});



export default Estado_curso