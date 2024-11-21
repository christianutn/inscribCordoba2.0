import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const CategoriaChatbot = sequelize.define('categoria_chatbot', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
}, {
    tableName: 'categoria_chatbot', // Nombre explícito de la tabla
    timestamps: false, // Desactiva createdAt y updatedAt si no los necesitas
    freezeTableName: true // Evita que Sequelize pluralice automáticamente el nombre de la tabla
});

export default CategoriaChatbot;
