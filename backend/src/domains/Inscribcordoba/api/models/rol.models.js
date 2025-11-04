import { DataTypes } from "sequelize";
import sequelize from "../../../../config/database.js";

const roles = sequelize.define("roles", {
    cod: {
        type: DataTypes.STRING(15),
        primaryKey: true,
        allowNull: false,
        validate: {
            len: [0, 5]
        }
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            len: [1, 100]
        }
    }
}, {
    timestamps: false,
    tableName: 'roles'
});



export default roles