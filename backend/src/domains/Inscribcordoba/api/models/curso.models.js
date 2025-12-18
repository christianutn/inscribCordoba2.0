import { DataTypes } from "sequelize";
import sequelize from "../../../../config/database.js";


const Curso = sequelize.define("cursos", {
    cod: {
        type: DataTypes.STRING(15),
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING(250),
        allowNull: false
    },
    cupo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        },
        defaultValue: 1
    },
    cantidad_horas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        },
        defaultValue: 1
    },
    medio_inscripcion: {
        type: DataTypes.STRING(15),
        allowNull: false
    },
    plataforma_dictado: {
        type: DataTypes.STRING(15),
        allowNull: false
    },
    tipo_capacitacion: {
        type: DataTypes.STRING(15),
        allowNull: false
    },
    area: {
        type: DataTypes.STRING(15),
        allowNull: false
    },
    esVigente: {
        type: DataTypes.TINYINT(1), // Cambiado a TINYINT(1) para coincidir con MySQL
        allowNull: true
    },
    tiene_evento_creado: {
        type: DataTypes.TINYINT(1), // Cambiado a TINYINT(1) para coincidir con MySQL
        allowNull: true
    },
    es_autogestionado: {
        type: DataTypes.TINYINT(1), // Cambiado a TINYINT(1) para coincidir con MySQL
        allowNull: true
    },
    tiene_restriccion_edad: {
        type: DataTypes.TINYINT(1), // Cambiado a TINYINT(1) para coincidir con MySQL
        allowNull: true
    },
    tiene_restriccion_departamento: {
        type: DataTypes.TINYINT(1), // Cambiado a TINYINT(1) para coincidir con MySQL
        allowNull: true
    },
    publica_pcc: {
        type: DataTypes.TINYINT(1), // Cambiado a TINYINT(1) para coincidir con MySQL
        allowNull: true
    },
    tiene_correlatividad: {
        type: DataTypes.TINYINT(1), // Cambiado a TINYINT(1) para coincidir con MySQL
        allowNull: true
    },
    numero_evento: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    esta_maquetado: {
        type: DataTypes.TINYINT(1), // Cambiado a TINYINT(1) para coincidir con MySQL
        allowNull: true
    },
    esta_configurado: {
        type: DataTypes.TINYINT(1), // Cambiado a TINYINT(1) para coincidir con MySQL
        allowNull: true
    },
    esta_configurado: {
        type: DataTypes.TINYINT(1), // Cambiado a TINYINT(1) para coincidir con MySQL
        allowNull: true
    },
    aplica_sincronizacion_certificados: {
        type: DataTypes.TINYINT(1), // Cambiado a TINYINT(1) para coincidir con MySQL
        allowNull: true
    },
    url_curso: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    esta_autorizado: {
        type: DataTypes.TINYINT(0),
        allowNull: true
    }
}, {
    timestamps: false,
    tableName: 'cursos'
});



export default Curso;
