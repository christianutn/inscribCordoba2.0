import { DataTypes } from "sequelize";

import sequelize from "../config/database.js";


const Autorizador = sequelize.define("autorizadores", {
    curso: {
        type: DataTypes.STRING(15),
        primaryKey: true,
        allowNull: false
    },
    fecha_desde: {
        type: DataTypes.DATEONLY,
        primaryKey: true,
        allowNull: false
    },
    descripcion_cargo: {
        type: DataTypes.STRING(255),
    },
    cuil: {
        type: DataTypes.STRING(11),
        allowNull: false,
        validate: {
            len: [11, 11]
        }
    }
},{
    timestamps: false,
    tableName: 'autorizadores'
});


export default Autorizador