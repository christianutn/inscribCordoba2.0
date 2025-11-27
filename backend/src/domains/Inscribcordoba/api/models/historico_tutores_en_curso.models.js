// backend\src\domains\Inscribcordoba\api\models\historico_tutores_en_curso.models.js

import { DataTypes } from 'sequelize';
import sequelize from '../../../../config/database.js'; // Importación corregida

const historico_tutores_en_curso = sequelize.define('historico_tutores_en_curso', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  curso_cod: {
    type: DataTypes.STRING(15),
    allowNull: false,
    references: {
      model: 'cursos', // Referencia a la tabla `cursos`
      key: 'cod',
    },
  },
  tutor_cuil: {
    type: DataTypes.STRING(11),
    allowNull: false,
    references: {
      model: 'tutores', // Referencia a la tabla `tutores`
      key: 'cuil',
    },
  },
  rol_tutor_cod: {
    type: DataTypes.STRING(15),
    allowNull: false,
    references: {
      model: 'roles_tutor', // Referencia a la tabla `roles_tutor`
      key: 'cod',
    },
  },
  fecha_desde: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  fecha_hasta: {
    type: DataTypes.DATE,
    allowNull: true, // DEFAULT NULL en tu tabla
  },
  nota_de_autorizacion_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'notas_autorizacion', // Referencia a la tabla `notas_autorizacion`
      key: 'id',
    },
  },
}, {
  tableName: 'historico_tutores_en_curso',
  timestamps: false, // Asumo que no tienes campos `createdAt` y `updatedAt`
  indexes: [
    {
      unique: true,
      fields: ['tutor_cuil', 'curso_cod', 'fecha_desde'],
      name: 'UQ_Curso_Tutor_FechaDesde'
    }
  ]
});

export default historico_tutores_en_curso;