// backend\src\domains\Inscribcordoba\api\models\cambios_estados_notas_autorizacion.models.js

import { DataTypes } from 'sequelize';
import sequelize from '../../../../config/database.js'; // Ajusta la ruta si es necesario

const Cambios_estados_notas_autorizacion = sequelize.define('cambios_estados_notas_autorizacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  estado_nota_autorizacion_cod: {
    type: DataTypes.STRING(15),
    allowNull: false,
    references: {
      model: 'estados_notas_autorizacion', // Referencia a la tabla `estados_notas_autorizacion`
      key: 'cod',
    },
  },
  nota_autorizacion_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'notas_autorizacion', // Referencia a la tabla `notas_autorizacion`
      key: 'id',
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
}, {
  tableName: 'cambios_estados_notas_autorizacion',
  timestamps: false, // Asumo que no tienes campos `createdAt` y `updatedAt`
});

export default Cambios_estados_notas_autorizacion;