import { DataTypes } from "sequelize";
import sequelize from "../../../../config/database.js";

/**
 * @typedef {import('sequelize').Model} DatosDesarrolloModel
 */

/**
 * Define el modelo 'DatosDesarrollo' que mapea a la tabla 'datos_desarrollo'.
 * Representa los datos de desarrollo (líneas modificadas, eliminadas) por un usuario en un mes y año específico.
 * @type {DatosDesarrolloModel}
 */
const DatosDesarrollo = sequelize.define("datos_desarrollo", {
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
    lineas_cod_modificadas: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
    },
    lineas_cod_eliminadas: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
    }
}, {
    tableName: 'datos_desarrollo',
    timestamps: false,
    freezeTableName: true,
});

export default DatosDesarrollo;
