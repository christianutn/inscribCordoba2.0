import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import MedioInscripcion from "./medioInscripcion.models.js";
import TipoCapacitacion from "./tipoCapacitacion.models.js";
import PlataformaDictado from "./plataformaDictado.models.js";
import Area from "./area.models.js";

const Curso = sequelize.define("cursos", {
    cod: {
        type: DataTypes.STRING(15),
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING(250),
        allowNull: false
    },
    cupo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        },
        defaultValue: 1
    },
    cantidad_horas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        },
        defaultValue: 1
    },
    medio_inscripcion: {
        type: DataTypes.STRING(15),
        allowNull: false
    },
    plataforma_dictado: {
        type: DataTypes.STRING(15),
        allowNull: false
    },
    tipo_capacitacion: {
        type: DataTypes.STRING(15),
        allowNull: false
    },
    area: {
        type: DataTypes.STRING(15)
    }
}, {
    timestamps: false,
    tableName: 'cursos'
});



export default Curso;
