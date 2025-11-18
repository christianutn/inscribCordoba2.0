// backend\src\domains\Inscribcordoba\api\models\estado_nota_autorizacion.models.js

import { DataTypes } from 'sequelize';
import  sequelize  from '../../../../config/database.js'; // Ajusta la ruta si es necesario

const EstadoNotaAutorizacion = sequelize.define('estados_notas_autorizacion', {
  cod: {
    type: DataTypes.STRING(15),
    primaryKey: true,
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING(45),
    allowNull: false,
    unique: true, // Esto refleja la UNIQUE KEY `UQ_Nombre`
  },
}, {
  tableName: 'estados_notas_autorizacion',
  timestamps: false, // Asumo que no tienes campos `createdAt` y `updatedAt`
  indexes: [
    {
      unique: true,
      fields: ['nombre'],
      name: 'UQ_Nombre'
    }
  ]
});

export default EstadoNotaAutorizacion;