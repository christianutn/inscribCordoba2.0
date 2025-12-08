import { DataTypes } from "sequelize";
import sequelize from "../../../../config/database.js";

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
        allowNull: true,
    },
    celular: {
        type: DataTypes.STRING(10),  // Asumiendo una longitud máxima de 10 caracteres para el celular
        allowNull: true, // El número de celular es opcional
    },
    // Remueve la validación de longitud para campos opcionales, ya que un valor nulo no la cumpliría
}, {
    tableName: "personas",  // Nombre explícito de la tabla
    timestamps: false
});

export default Personas;
