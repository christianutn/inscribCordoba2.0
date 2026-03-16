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
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        // Getter para devolver la fecha en hora argentina (UTC-3)
        get() {
            const rawValue = this.getDataValue('created_at');
            if (!rawValue) return null;
            const date = new Date(rawValue);
            // Ajustar a UTC-3 (Argentina)
            return new Date(date.getTime() - (3 * 60 * 60 * 1000)).toISOString().replace('T', ' ').substring(0, 19);
        }
    }
}, {
    tableName: 'efemerides',
    timestamps: false,
    freezeTableName: true,
});

export default Efemeride;
