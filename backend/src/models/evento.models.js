import { DataTypes } from "sequelize";

import sequelize from "../config/database.js";



const Evento = sequelize.define("eventos", {
    curso: {
        type: DataTypes.STRING(15),
        primaryKey: true
    },
    perfil: {
        type: DataTypes.STRING(15),
        allowNull: false,
    },
    area_tematica: {
        type: DataTypes.STRING(15),
        allowNull: false,
    },
    tipo_certificacion: {
        type: DataTypes.STRING(15),
        allowNull: false,
    },
    presentacion: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    objetivos: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    requisitos_aprobacion: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    ejes_tematicos: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    certifica_en_cc: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1
    },
    disenio_a_cargo_cc: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1
    },

},{
    timestamps: false
});



export default Evento;