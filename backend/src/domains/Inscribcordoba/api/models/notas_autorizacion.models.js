import { DataTypes } from 'sequelize';
// Ajusta la cantidad de '../' según donde esté tu archivo de conexión db.js
// Asumiendo que está en backend/src/config/db.js
import sequelize from '../../../../config/database.js'; 

const NotaAutorizacion = sequelize.define('notas_autorizacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  autorizador_cuil: {
    type: DataTypes.STRING(11),
    allowNull: false,
    validate: {
      len: [11, 11] // Validación extra para asegurar que sean 11 caracteres
    }
  },
  fecha_desde: {
    type: DataTypes.DATEONLY, // Mapea al tipo DATE de MySQL (sin hora)
    allowNull: false
  },
  ruta_archivo_local: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: "Ruta relativa en el servidor, ej: uploads/notas_autorizacion_pdf/archivo.pdf"
  }
}, {
  tableName: 'notas_autorizacion',
  timestamps: false, 
  freezeTableName: true 
});

export default NotaAutorizacion;