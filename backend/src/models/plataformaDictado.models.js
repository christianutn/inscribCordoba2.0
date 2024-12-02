import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const plataformasDictado = sequelize.define("plataformas_dictado", {
    cod: {
        type: DataTypes.STRING(15),
        primaryKey: true
    },
    nombre: DataTypes.STRING(100),
    esVigente: {
        type: DataTypes.TINYINT(1), // Cambiado a TINYINT(1) para coincidir con MySQL
        allowNull: true
    }
}, {
    timestamps: false,
    tableName: 'plataformas_dictado'
});

export default plataformasDictado