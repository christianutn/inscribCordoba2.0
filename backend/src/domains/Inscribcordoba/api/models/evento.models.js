import { DataTypes } from "sequelize";

import sequelize from "../../../../config/database.js";

/**
 * @typedef {import('sequelize').Model} EventoModel
 */

/**
 * Define el modelo 'Evento' que mapea a la tabla 'eventos'.
 * Se corrigen 'allowNull' para 'fecha_desde' y 'usuario' y se usa 'BOOLEAN' para los campos TINYINT.
 * @type {EventoModel}
 */
const Evento = sequelize.define("eventos", {
    // Clave primaria, se referencia a 'cursos.cod'
    curso: {
        type: DataTypes.STRING(15),
        primaryKey: true,
        allowNull: false // Ya que es PRIMARY KEY
    },
    // Llave foránea a 'perfiles'
    perfil: {
        type: DataTypes.STRING(15),
        allowNull: false,
    },
    // Llave foránea a 'areas_tematicas'
    area_tematica: {
        type: DataTypes.STRING(15),
        allowNull: false,
    },
    // Llave foránea a 'tipos_certificacion'
    tipo_certificacion: {
        type: DataTypes.STRING(15),
        allowNull: false,
    },
    presentacion: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    objetivos: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    // Se mantiene NOT NULL según la tabla SQL
    ejes_tematicos: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    // Se mantiene NOT NULL según la tabla SQL
    requisitos_aprobacion: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    // TINYINT NOT NULL DEFAULT '1' -> Mapeado a BOOLEAN para tipado correcto.
    certifica_en_cc: {
        type: DataTypes.BOOLEAN, // Más idiomático para TINYINT(1)
        allowNull: false,
        defaultValue: 1
    },
    // TINYINT NOT NULL DEFAULT '1' -> Mapeado a BOOLEAN para tipado correcto.
    disenio_a_cargo_cc: {
        type: DataTypes.BOOLEAN, // Más idiomático para TINYINT(1)
        allowNull: false,
        defaultValue: 1
    },

    fecha_desde: {
        type: DataTypes.DATE,
        allowNull: false
    },

    usuario: {
        type: DataTypes.STRING(11),
        allowNull: false
    }

}, {
    // Deshabilita los campos 'createdAt' y 'updatedAt'
    timestamps: false,
    // Define el nombre de la tabla explícitamente (aunque ya lo estaba haciendo)
    tableName: 'eventos'
});


export default Evento;