import { DataTypes } from "sequelize";

import sequelize from "../config/database.js";

const tipoCapacitacion = sequelize.define("tipos_capacitacion", {
    cod: {
        type: DataTypes.STRING(15),
        primaryKey: true
    },
    nombre: DataTypes.STRING(100)
}, {
    timestamps: false,
    tableName: 'tipos_capacitacion' // Nombre personalizado para la tabla
});

export default tipoCapacitacion