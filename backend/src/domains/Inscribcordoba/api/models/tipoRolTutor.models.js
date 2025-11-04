import { DataTypes } from "sequelize";

import sequelize from "../../../../config/database.js";

const rol = sequelize.define("tipos_rol_tutor", {
    cod: {
        type: DataTypes.STRING(15),
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING(100)
    }
},
{
    timestamps: false,
    tableName: 'tipos_rol_tutor' // Nombre personalizado para la tabla
});

export default rol