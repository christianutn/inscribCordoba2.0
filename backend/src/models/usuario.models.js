import { DataTypes } from "sequelize";

import sequelize from "../config/database.js";
import Rol from "./rol.models.js";
import Persona from "./persona.models.js";

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
    }
},{
    timestamps: false,
    tableName: 'usuarios'
});



export default Usuario;