// backend\src\domains\Inscribcordoba\api\models\roles_tutor.models.js

import { DataTypes } from 'sequelize';
import sequelize from '../../../../config/database.js'; // ¡Importación corregida!

const roles_tutor = sequelize.define('roles_tutor', {
  cod: {
    type: DataTypes.STRING(15),
    primaryKey: true,
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: true, // DEFAULT NULL en tu tabla
    unique: true, // Refleja la KEY `UQ_Nombre`
  },
}, {
  tableName: 'roles_tutor',
  timestamps: false, // Asumo que no tienes campos `createdAt` y `updatedAt`
  indexes: [
    {
      unique: true,
      fields: ['nombre'],
      name: 'UQ_Nombre' // Aunque no es UNIQUE KEY en el script, Sequelize puede crearlo si `unique: true`
    }
  ]
});

export default roles_tutor;