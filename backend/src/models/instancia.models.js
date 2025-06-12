// src/models/instancia.models.js

import { DataTypes } from "sequelize";
import { Op } from 'sequelize'; // Importa el objeto Op de Sequelize
import sequelize from "../config/database.js"; // Asegúrate de que la ruta a tu instancia de Sequelize sea correcta
import ControlDataFechaInicioCursado from './controlDataFechaInicioCursada.models.js'; // Asegúrate de la ruta correcta
import { DateTime } from 'luxon'; // <-- Importa DateTime de Luxon

// Definición del modelo Instancia
const Instancia = sequelize.define("instancias", {
    curso: {
        type: DataTypes.STRING(15),
        primaryKey: true,
    },
    fecha_inicio_curso: {
        type: DataTypes.DATEONLY,
        primaryKey: true,
    },
    fecha_fin_curso: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    fecha_inicio_inscripcion: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    fecha_fin_inscripcion: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    estado_instancia: { // Esta es la propiedad del modelo JS
        type: DataTypes.STRING(15),
        allowNull: false
    },
    es_publicada_portal_cc: {
        type: DataTypes.BOOLEAN
    },
    cupo: {
        type: DataTypes.INTEGER
    },
    cantidad_horas: {
        type: DataTypes.INTEGER
    },
    es_autogestionado: {
        type: DataTypes.TINYINT(1),
        allowNull: true
    },
    tiene_restriccion_edad: {
        type: DataTypes.TINYINT(1)
    },
    tiene_restriccion_departamento: {
        type: DataTypes.TINYINT(1),
        allowNull: true
    },
    tiene_correlatividad: {
        type: DataTypes.TINYINT(1),
        allowNull: true
    },
    datos_solictud: { // Verifica si el nombre de la columna en DB es 'datos_solictud' o 'datos_solicitud'
        type: DataTypes.STRING(150)
    }
    // ... Otras columnas si las tienes, asegúrate de añadir 'field' si son snake_case
}, {
    tableName: 'instancias', // Asegura que el nombre de la tabla en la DB es 'instancias'
    timestamps: false, // Indica que no hay columnas 'createdAt' y 'updatedAt'
    // Se recomienda añadir 'underscored: true' en las opciones del modelo si todas
    // tus columnas en la DB son snake_case y tus propiedades JS son camelCase.
    // Si tus propiedades JS son snake_case como en este modelo, y tu DB es snake_case,
    // los 'field' mappings son técnicamente redundantes pero no hacen daño.
    // Si tu DB usa camelCase y tus propiedades JS usan snake_case, ¡eso sí sería un problema!
});

// *** AGREGAR MÉTODOS DE CLASE (STATIC) AL MODELO INSTANCIA - ADAPTADOS A LUXON ***
Object.assign(Instancia, {

    /**
     * Calcula la cantidad de cursos acumulados (no cupos) hasta una fecha dada,
     * y cuya fecha_fin_curso sea mayor a la fecha de inicio de cursada de la cohorte.
     * Originalmente usaba .count() pero se leía como 'cupos'.
     * @param {Date} cohorteFechaCursadaDesde - La fecha de inicio de cursada de la cohorte (Date object).
     * @returns {Promise<number>} La cantidad total de cursos acumulados.
     */
    async getTotalCursosAcumulados(cohorteFechaCursadaDesde) {
        // Convertimos el Date nativo a Luxon DateTime
        const cohorteDateTime = DateTime.fromJSDate(cohorteFechaCursadaDesde);

        return await Instancia.count({ // <--- Mantiene .count() según tu último código
            where: {
                // `fecha_inicio_curso` sea MENOR O IGUAL que `cohorteFechaCursadaDesde`
                fecha_inicio_curso: {
                    [Op.lte]: cohorteDateTime.toJSDate() // <-- Convertimos a JS Date para Sequelize
                },
                // `fecha_fin_curso` sea MAYOR que `cohorteFechaCursadaDesde` (tu lógica original)
                fecha_fin_curso: {
                    [Op.gt]: cohorteDateTime.toJSDate() // <-- Convertimos a JS Date para Sequelize
                },
                estado_instancia: {
                    [Op.notIn]: ['CANC', 'REPR']
                }
            }
        });
    },

    /**
     * Calcula la cantidad total de cursos con fecha de inicio en un mes y año dados.
     * @param {Date} dateObj - Un objeto Date del cual extraer el mes y el año.
     * @returns {Promise<number>} La cantidad total de cursos.
     */
    async getTotalCursosMes(dateObj) {
        const dateTime = DateTime.fromJSDate(dateObj); // Convertimos a Luxon DateTime

        const startDate = dateTime.startOf('month').toJSDate(); // Inicio del mes con Luxon, convertido a JS Date
        const endDate = dateTime.startOf('month').plus({ months: 1 }).toJSDate(); // Inicio del mes siguiente con Luxon, convertido a JS Date

        return await Instancia.count({
            where: {
                fecha_inicio_curso: {
                    [Op.gte]: startDate,
                    [Op.lt]: endDate
                },
                estado_instancia: {
                    [Op.notIn]: ['CANC', 'REPR']
                }
            }
        });
    },

    /**
     * Calcula la suma de cupos para cursos con fecha de inicio en un mes y año dados.
     * @param {Date} dateObj - Un objeto Date del cual extraer el mes y el año.
     * @returns {Promise<number>} La suma total de cupos.
     */
    async getCantidadCupoMes(dateObj) {
        const dateTime = DateTime.fromJSDate(dateObj); // Convertimos a Luxon DateTime

        const startDate = dateTime.startOf('month').toJSDate(); // Inicio del mes con Luxon, convertido a JS Date
        const endDate = dateTime.startOf('month').plus({ months: 1 }).toJSDate(); // Inicio del mes siguiente con Luxon, convertido a JS Date

        return await Instancia.sum('cupo', {
            where: {
                fecha_inicio_curso: {
                    [Op.gte]: startDate,
                    [Op.lt]: endDate
                },
                estado_instancia: {
                    [Op.notIn]: ['CANC', 'REPR']
                }
            }
        });
    },

    /**
     * Calcula la cantidad de cursos que comienzan en un día específico.
     * @param {Date} dateObj - Un objeto Date del día específico.
     * @returns {Promise<number>} La cantidad total de cursos.
     */
    async getCantidadCursosDia(dateObj) {
        const dateTime = DateTime.fromJSDate(dateObj); // Convertimos a Luxon DateTime

        const startOfDay = dateTime.startOf('day').toJSDate(); // Inicio del día con Luxon, convertido a JS Date
        const endOfDay = dateTime.startOf('day').plus({ days: 1 }).toJSDate(); // Inicio del día siguiente con Luxon, convertido a JS Date

        return await Instancia.count({
            where: {
                fecha_inicio_curso: {
                    [Op.gte]: startOfDay,
                    [Op.lt]: endOfDay
                },
                estado_instancia: {
                    [Op.notIn]: ['CANC', 'REPR']
                }
            }
        });
    },

    /**
     * Calcula la suma de cupos para cursos que comienzan en un día específico.
     * @param {Date} dateObj - Un objeto Date del día específico.
     * @returns {Promise<number>} La suma total de cupos.
     */
    async getCantidadCupoDia(dateObj) {
        const dateTime = DateTime.fromJSDate(dateObj); // Convertimos a Luxon DateTime

        const startOfDay = dateTime.startOf('day').toJSDate(); // Inicio del día con Luxon, convertido a JS Date
        const endOfDay = dateTime.startOf('day').plus({ days: 1 }).toJSDate(); // Inicio del día siguiente con Luxon, convertido a JS Date

        return await Instancia.sum('cupo', {
            where: {
                fecha_inicio_curso: {
                    [Op.gte]: startOfDay,
                    [Op.lt]: endOfDay
                },
                estado_instancia: {
                    [Op.notIn]: ['CANC', 'REPR']
                }
            }
        });
    },

    // --- Métodos de validación de límite de cupo/cursos ---
    // Estos métodos usan 'this' para llamar a los métodos estáticos definidos arriba.

    async supera_cupo_mes(dateObj) {
        const limiteData = await ControlDataFechaInicioCursado.findByPk(1);
        if (!limiteData) {
            throw new Error("Límites de control de cupo/cursos por mes no encontrados.");
        }
        // dateObj se pasa directamente, ya que getCantidadCupoMes lo convertirá a Luxon.
        const total_cupos_mes = await this.getCantidadCupoMes(dateObj);
        return total_cupos_mes >= limiteData.maximoCuposXMes;
    },

    async supera_cupo_dia(dateObj) {
        const limiteData = await ControlDataFechaInicioCursado.findByPk(1);
        if (!limiteData) {
            throw new Error("Límites de control de cupo/cursos por día no encontrados.");
        }
        // dateObj se pasa directamente.
        const total_cupos_dia = await this.getCantidadCupoDia(dateObj);
        return total_cupos_dia >= limiteData.maximoCuposXDia;
    },

    async supera_cantidad_cursos_acumulado(dateObj) {
        const limiteData = await ControlDataFechaInicioCursado.findByPk(1);
        if (!limiteData) {
            throw new Error("Límites de control de cursos acumulados no encontrados.");
        }
        // dateObj se pasa directamente.
        // Recordatorio: getTotalCursosAcumulados cuenta cursos, no suma cupos,
        // pero el nombre de la variable 'maximoAcumulado' podría sugerir cupos.
        const total_cursos_acumulados = await this.getTotalCursosAcumulados(dateObj);
        return total_cursos_acumulados >= limiteData.maximoAcumulado;
    },

    async supera_cantidad_cursos_mes(dateObj) {
        const limiteData = await ControlDataFechaInicioCursado.findByPk(1);
        if (!limiteData) {
            throw new Error("Límites de control de cursos por mes no encontrados.");
        }
        // dateObj se pasa directamente.
        const total_cursos_mes = await this.getTotalCursosMes(dateObj);
        return total_cursos_mes >= limiteData.maximoCursosXMes;
    },

    async supera_cantidad_cursos_dia(dateObj) {
        const limiteData = await ControlDataFechaInicioCursado.findByPk(1);
        if (!limiteData) {
            throw new Error("Límites de control de cursos por día no encontrados.");
        }
        // dateObj se pasa directamente.
        const total_cursos_dia = await this.getCantidadCursosDia(dateObj);
        return total_cursos_dia >= limiteData.maximoCursosXDia;
    }
});

export default Instancia;