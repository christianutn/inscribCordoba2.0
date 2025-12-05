import { DataTypes } from "sequelize";

import sequelize from "../../../../config/database.js";

const Usuario = sequelize.define("usuarios", {
    cuil: {
        type: DataTypes.STRING(11),
        primaryKey: true,
        allowNull: false,
        validate: {
            len: [11, 11]
        }
    },
    contrasenia: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            len: [1, 100]
        }
    },
    rol: {
        type: DataTypes.STRING(15),
        allowNull: false
    },
    area: {
        type: DataTypes.STRING(15)
    },
    necesitaCbioContrasenia: {
        type: DataTypes.TINYINT(1),
        allowNull: true
    },
    esExcepcionParaFechas: {
        type: DataTypes.TINYINT(1),
        allowNull: true
    },
    activo: {
        type: DataTypes.TINYINT(1),
        allowNull: true,
        defaultValue: 1,
        validate: {
            isIn: [["0", "1"]]
        }
    }
}, {
    timestamps: false,
    tableName: 'usuarios'
});



export default Usuario;