import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const DiccionarioChatbot = sequelize.define('diccionario_chatboot', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    pregunta: {
        type: DataTypes.STRING(450),
        allowNull: false
    },
    respuesta: {
        type: DataTypes.STRING(450),
        allowNull: false
    },
    imagen: {
        type: DataTypes.BLOB('long'),
        allowNull: true
    },
    idCategoria: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
}, {
    tableName: 'diccionario_chatboot', // Asegura que el nombre de la tabla sea consistente
    timestamps: false, // Evita los campos createdAt y updatedAt si no los necesitas
    freezeTableName: true // Evita que Sequelize pluralice automáticamente los nombres de las tablas
});

export default DiccionarioChatbot;
