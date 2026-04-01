import { DataTypes } from "sequelize";
import sequelize from "../../../../config/database.js";

const DatosDesarrollo = sequelize.define("datos_desarrollo", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    mes: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    anio: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    cuil: {
        type: DataTypes.STRING(11),
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'cuil'
        }
    },
    lineas_cod_modificadas: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    lineas_cod_eliminadas: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: false,
    tableName: 'datos_desarrollo'
});

export default DatosDesarrollo;
