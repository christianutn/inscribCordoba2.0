import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const plataformasDictado = sequelize.define("plataformas_dictado", {
    cod: {
        type: DataTypes.STRING(15),
        primaryKey: true
    },
    nombre: DataTypes.STRING(100)
}, {
    timestamps: false,
    tableName: 'plataformas_dictado'
});

export default plataformasDictado