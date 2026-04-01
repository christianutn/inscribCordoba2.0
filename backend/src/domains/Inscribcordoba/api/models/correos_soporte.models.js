import { DataTypes } from "sequelize";
import sequelize from "../../../../config/database.js";

/**
 * @typedef {import('sequelize').Model} CorreosSoporteModel
 */

/**
 * Define el modelo 'CorreosSoporte' que mapea a la tabla 'correos_soporte'.
 * Representa la cantidad de correos de soporte respondidos por un usuario en un mes y año específico.
 * @type {CorreosSoporteModel}
 */
const CorreosSoporte = sequelize.define("correos_soporte", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    mes: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    anio: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    cuil: {
        type: DataTypes.STRING(11),
        allowNull: false,
    },
    cantidad_respondida: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
    }
}, {
    tableName: 'correos_soporte',
    timestamps: false,
    freezeTableName: true,
});

export default CorreosSoporte;
