import { DataTypes } from "sequelize";

import sequelize from "../data/database.js";
import Curso from "./curso.models.js";
import Persona from "./personas.models.js";

const Autorizador = sequelize.define("autorizadores", {
    curso: {
        type: DataTypes.STRING(15),
        primaryKey: true,
        allowNull: false
    },
    fecha_desde: {
        type: DataTypes.DATEONLY,
        primaryKey: true,
        allowNull: false
    },
    descripcion_cargo: {
        type: DataTypes.STRING(255),
    },
    cuil: {
        type: DataTypes.STRING(11),
        allowNull: false,
        validate: {
            len: [11, 11]
        }
    }
},{
    timestamps: false,
    tableName: 'autorizadores'
});

Autorizador.belongsTo(Curso, { foreignKey: 'cod', as: 'detalle_curso' });
Autorizador.belongsTo(Persona, { foreignKey: 'cuil', as: 'detalle_persona' });