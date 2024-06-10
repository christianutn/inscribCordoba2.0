import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import MedioInscripcion from "./medioInscripcion.models.js";
import TipoCapacitacion from "./tipoCapacitacion.models.js";
import PlataformaDictado from "./plataformaDictado.models.js";

const Curso = sequelize.define("cursos", {
    cod: {
        type: DataTypes.STRING(15),
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    cupo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    cantidad_horas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
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
    }
}, {
    timestamps: false,
    tableName: 'cursos'
});

Curso.belongsTo(MedioInscripcion, { foreignKey: 'medio_inscripcion', as: 'detalle_medioInscripcion' });
Curso.belongsTo(TipoCapacitacion, { foreignKey: 'tipo_capacitacion', as: 'detalle_tipoCapacitacion' });
Curso.belongsTo(PlataformaDictado, { foreignKey: 'plataforma_dictado', as: 'detalle_plataformaDictado' });

export default Curso;
