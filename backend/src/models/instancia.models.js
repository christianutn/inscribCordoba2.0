import { DataTypes } from "sequelize";

import sequelize from "../config/database.js";


const Instancia = sequelize.define("instancias", {
    curso: {
        type: DataTypes.STRING(15),
        primaryKey: true
    },
    fecha_inicio_curso: {
        type: DataTypes.DATEONLY,
        primaryKey: true
    },
    fecha_fin_curso: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    fecha_inicio_inscripcion: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    fecha_fin_inscripcion: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    estado: {
        type: DataTypes.STRING(15),
        allowNull: false
    },
    es_publicada_portal_cc: {
        type: DataTypes.BOOLEAN
    }
},{
    timestamps: false
});



export default Instancia