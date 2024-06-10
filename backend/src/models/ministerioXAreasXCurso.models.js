import { DataTypes } from "sequelize";

import sequelize from "../config/database.js";
import Curso from "./curso.models.js";
import Area from "./area.models.js";
import Ministerio from "./ministerio.models.js";

const MinisterioXAreasXCurso = sequelize.define("ministerio_x_area_x_curso", {
    ministerio: {
        type: DataTypes.STRING(15),
        primaryKey: true
    },
    area: {
        type: DataTypes.STRING(15),
        primaryKey: true
    },
    curso: {
        type: DataTypes.STRING(15),
        primaryKey: true
    }

}, {
    timestamps: false,
    tableName: 'ministerio_x_area_x_curso'
})


MinisterioXAreasXCurso.belongsTo(Ministerio, { foreignKey: 'ministerio', as: 'detalle_ministerio' });
MinisterioXAreasXCurso.belongsTo(Area, { foreignKey: 'area', as: 'detalle_area' });
MinisterioXAreasXCurso.belongsTo(Curso, { foreignKey: 'curso', as: 'detalle_curso' });




export default MinisterioXAreasXCurso
