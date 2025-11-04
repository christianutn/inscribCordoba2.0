import { DataTypes } from "sequelize";
import sequelize from "../../../../config/database.js";

const CambioEstadoCurso = sequelize.define("cambios_estados_cursos", {
    curso: {
        type: DataTypes.STRING(15),
        primaryKey: true
    },
    fecha_inicio: {
        type: DataTypes.DATEONLY,
        primaryKey: true
    },
    estado_curso: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    comentario: {
        type: DataTypes.STRING(250),
        allowNull: true
    }
}, {
    timestamps: false
});



export default CambioEstadoCurso