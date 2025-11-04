import { DataTypes } from "sequelize";
import sequelize from "../../../../config/database.js";

const Estado_instancia = sequelize.define("estados_instancias", {
    cod: {
        type: DataTypes.STRING(15),
        primaryKey: true
    },
    descripcion: DataTypes.STRING(45)
}, {
    timestamps: false
});



export default Estado_instancia