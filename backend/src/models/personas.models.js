import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Personas = sequelize.define("personas", {
    cuil: {
        type: DataTypes.STRING(11),  // Asumiendo que el CUIL tiene una longitud fija de 11 caracteres
        primaryKey: true,
        allowNull: false,
        validate: {
            len: [11, 11]  // Validación de longitud exacta
        }
    },
    nombre: {
        type: DataTypes.STRING(100),  // Asumiendo una longitud máxima de 50 caracteres para el nombre
        allowNull: false,
        validate: {
            len: [1, 100]  // Validación de longitud
        }
    },
    apellido: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            len: [1, 100]
        }
    },
    mail: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            isEmail: true,  // Validación de formato de correo electrónico
            len: [1, 100]
        }
    },
    celular: {
        type: DataTypes.STRING(10),  // Asumiendo una longitud máxima de 15 caracteres para el celular
        allowNull: true,
        validate: {
            len: [10, 10]  // Validación de longitud
        }
    }
}, {
    tableName: "personas",  // Nombre explícito de la tabla
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['mail']
        }
    ]
});

export default Personas;
