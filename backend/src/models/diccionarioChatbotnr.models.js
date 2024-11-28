import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const DiccionarioChatbotnr = sequelize.define('diccionario_chatbot_no_registrado', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    pregunta: {
        type: DataTypes.STRING(450),
        allowNull: false
    },
    incidencia: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    pocesada: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    }
}, {
    tableName: 'diccionario_chatbot_no_registrado', // Asegura que el nombre de la tabla sea consistente
    timestamps: false, // Evita los campos createdAt y updatedAt si no los necesitas
    freezeTableName: true // Evita que Sequelize pluralice automáticamente los nombres de las tablas
});

export default DiccionarioChatbotnr;