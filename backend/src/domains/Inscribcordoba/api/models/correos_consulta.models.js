import { DataTypes } from "sequelize";
import sequelize from "../../../../config/database.js";

/**
 * @typedef {import('sequelize').Model} CorreosConsultaModel
 */

/**
 * Define el modelo 'CorreosConsulta' que mapea a la tabla 'correos_consulta'.
 * Representa la cantidad de correos de consulta respondidos por un usuario en un mes y año específico.
 * @type {CorreosConsultaModel}
 */
const CorreosConsulta = sequelize.define("correos_consulta", {
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
    tableName: 'correos_consulta',
    timestamps: false,
    freezeTableName: true,
});

export default CorreosConsulta;
