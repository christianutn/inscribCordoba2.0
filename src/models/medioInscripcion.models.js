import { DataTypes } from "sequelize";

import sequelize from "../config/database.js";

const medioInscripcion = sequelize.define("medios_inscripcion", {
    cod: {
        type: DataTypes.STRING(15),
        primaryKey: true
    },
    nombre: DataTypes.STRING(100)
}, {
    timestamps: false,
    tableName: 'medios_inscripcion' // Nombre personalizado para la tabla
});

export default medioInscripcion