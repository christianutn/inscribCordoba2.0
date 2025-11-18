// backend\src\domains\Inscribcordoba\api\models\detalles_tutor_en_nota_autorizacion.models.js

import { DataTypes } from 'sequelize';
import sequelize from '../../../../config/database.js'; // Importación corregida

const Detalles_tutor_en_nota_autorizacion = sequelize.define('detalles_tutor_en_nota_autorizacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    // autoIncrement: true, // Tu script no lo incluye, si lo necesitas añade esta línea
  },
  nota_autorizacion_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // DEFAULT NULL
    references: {
      model: 'notas_autorizacion',
      key: 'id',
    },
  },
  tutor_cuil: {
    type: DataTypes.STRING(11),
    allowNull: true, // DEFAULT NULL
    references: {
      model: 'tutores', // Referencia a la tabla `tutores`
      key: 'cuil',
    },
  },
  curso_cod: {
    type: DataTypes.STRING(15),
    allowNull: true, // DEFAULT NULL
    references: {
      model: 'cursos', // Referencia a la tabla `cursos`
      key: 'cod',
    },
  },
  rol_tutor_cod: {
    type: DataTypes.STRING(15),
    allowNull: true, // DEFAULT NULL
    references: {
      model: 'roles_tutor', // Referencia a la tabla `roles_tutor`
      key: 'cod',
    },
  },
}, {
  tableName: 'detalles_tutor_en_nota_autorizacion',
  timestamps: false, // Asumo que no tienes campos `createdAt` y `updatedAt`
  indexes: [
    {
      unique: true,
      fields: ['nota_autorizacion_id', 'tutor_cuil', 'curso_cod'],
      name: 'UQ_Detalle_Curso_Tutor_Nota'
    }
  ]
});

export default Detalles_tutor_en_nota_autorizacion;