import { DataTypes } from "sequelize";
import sequelize from "../../../../config/database.js";

const Aviso = sequelize.define('avisos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      titulo: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      contenido: {
        type: DataTypes.TEXT('medium'),
        allowNull: false,
      },
      icono: {
        type: DataTypes.STRING(5),
        allowNull: false,
        charset: 'utf8mb4', // Asegúrate de que sea utf8mb4
      },
      visible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      }
}, {
    tableName: 'avisos', // Nombre explícito de la tabla
    timestamps: false, // Desactiva createdAt y updatedAt si no los necesitas
    freezeTableName: true // Evita que Sequelize pluralice automáticamente el nombre de la tabla
});

export default Aviso;