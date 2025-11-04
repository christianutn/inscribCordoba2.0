import { DataTypes } from "sequelize";

import sequelize from "../../../../config/database.js";

const tutor = sequelize.define("tutores", {
    cuil: {
        type: DataTypes.STRING(11),
        primaryKey: true
    },
    area: {
        type: DataTypes.STRING(15)
    },
    esReferente: {
        type: DataTypes.CHAR(1),
        allowNull: true
    }
},
{
    timestamps: false,
    tableName: 'tutores' // Nombre personalizado para la tabla
});

export default tutor