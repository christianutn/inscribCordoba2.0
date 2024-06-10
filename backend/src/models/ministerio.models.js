import {DataTypes} from "sequelize"
import sequelize from "../config/database.js"

const ministerio = sequelize.define('ministerios', {
    cod: {
        type: DataTypes.STRING(15),
        primaryKey: true
    },
    nombre: DataTypes.STRING(100)
}, {
    timestamps: false
})

export default ministerio