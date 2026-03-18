import { DataTypes } from "sequelize";
import sequelize from "../../../../config/database.js";

/**
 * @typedef {import('sequelize').Model} EfemerideModel
 */

/**
 * Define el modelo 'Efemeride' que mapea a la tabla 'efemerides'.
 * Representa fechas conmemorativas asociadas a cursos.
 * @type {EfemerideModel}
 */
const Efemeride = sequelize.define("efemerides", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    usuario: {
        type: DataTypes.STRING(11),
        allowNull: false,
    },
    curso: {
        type: DataTypes.STRING(15),
        allowNull: false,
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    observacion: {
        type: DataTypes.STRING(250),
        allowNull: true,
        defaultValue: null,
    },
    url_disenio: {
        type: DataTypes.STRING(250),
        allowNull: true,
        defaultValue: null,
    },
    // En efemeride.models.js
    created_at: {
        type: DataTypes.DATE, // Sequelize mapeará esto a DATETIME en MySQL
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
}, {
    tableName: 'efemerides',
    timestamps: false,
    freezeTableName: true,
});

export default Efemeride;
