import { check, body } from 'express-validator';
import AppError from '../../utils/appError.js'; // Ajusta la ruta a tu clase AppError

// Importa todos tus modelos aquí (ajusta las rutas según tu estructura de carpetas)

import MedioInscripcion from '../../models/medioInscripcion.models.js';
import PlataformaDictado from '../../models/plataformaDictado.models.js';
import TipoCapacitacion from '../../models/tipoCapacitacion.models.js';
import Curso from '../../models/curso.models.js';
import Instancia from '../../models/instancia.models.js';
import Tutor from '../../models/tutor.models.js';
import { DateTime } from 'luxon';

// Middleware de validación para una ruta de creación/actualización de Curso/Evento
const validarDatosCursoConCohortes = [

    check('medio_inscripcion')
        .exists().withMessage("El código de medio de inscripción es requerido.")
        .isString().withMessage("El código de medio de inscripción debe ser una cadena de texto.")
        .isLength({ max: 15 }).withMessage("El código de medio de inscripción no debe exceder los 15 caracteres.")
        .custom(async (value) => {
            const medio_inscripcion = await MedioInscripcion.findOne({ where: { cod: value } });
            if (!medio_inscripcion) {
                throw new AppError(`No se encontró un medio de inscripción con el código ${value}.`, 404);
            }
            if (!medio_inscripcion.esVigente) { // Validación de negocio: ¿está vigente?
                throw new AppError(`El medio de inscripción con código ${value} no está vigente.`, 400);
            }
        }),

    check('plataforma_dictado')
        .exists().withMessage("El código de plataforma de dictado es requerido.")
        .isString().withMessage("El código de plataforma de dictado debe ser una cadena de texto.")
        .isLength({ max: 15 }).withMessage("El código de plataforma de dictado no debe exceder los 15 caracteres.")
        .custom(async (value) => {
            const plataforma_dictado = await PlataformaDictado.findOne({ where: { cod: value } });
            if (!plataforma_dictado) {
                throw new AppError(`No se encontró una plataforma de dictado con el código ${value}.`, 404);
            }
            if (!plataforma_dictado.esVigente) { // Validación de negocio: ¿está vigente?
                throw new AppError(`La plataforma de dictado con código ${value} no está vigente.`, 400);
            }
        }),

    check('tipo_capacitacion')
        .exists().withMessage("El código de tipo de capacitación es requerido.")
        .isString().withMessage("El código de tipo de capacitación debe ser una cadena de texto.")
        .isLength({ max: 15 }).withMessage("El código de tipo de capacitación no debe exceder los 15 caracteres.")
        .custom(async (value) => {
            const tipo_capacitacion = await TipoCapacitacion.findOne({ where: { cod: value } });
            if (!tipo_capacitacion) {
                throw new AppError(`No se encontró un tipo de capacitación con el código ${value}.`, 404);
            }
            if (!tipo_capacitacion.esVigente) { // Validación de negocio: ¿está vigente?
                throw new AppError(`El tipo de capacitación con código ${value} no está vigente.`, 400);
            }
        }),

    // 2. Validaciones para cupo y cantidad_horas (deben ser enteros y mayor a cero)
    // El nombre del campo es 'cupo' y 'horas' en tu frontend, pero 'cantidad_horas' en tu backend (updateCurso).
    // Asegúrate de usar el nombre correcto del campo que llega en req.body.
    check('cupo')
        .exists().withMessage("El cupo es requerido.")
        .isInt({ min: 1 }).withMessage("El cupo debe ser un número entero mayor a cero."), // Cambiado de min: 0 a min: 1

    check('cantidad_horas') // Si el campo en el body se llama 'horas', cámbialo a 'horas'
        .exists().withMessage("La cantidad de horas es requerida.")
        .isInt({ min: 1 }).withMessage("La cantidad de horas debe ser un número entero mayor a cero."), // Cambiado de min: 0 a min: 1

    // 3. Validación para el campo 'curso' (asumiendo que es el código del curso principal)
    check('curso') // Si el campo en el body es 'cod' (del curso), cámbialo a 'cod'
        .exists().withMessage("El código de curso es requerido.")
        .isString().withMessage("El código de curso debe ser una cadena de texto.")
        .isLength({ max: 15 }).withMessage("El código de curso no debe exceder los 15 caracteres.")
        .custom(async (value) => {
            const curso = await Curso.findOne({ where: { cod: value } });
            if (!curso) {
                throw new AppError(`No se encontró un curso con el código ${value}.`, 404);
            }

            if (!curso.esVigente) { // Validación de negocio: ¿está vigente?
                throw new AppError(`El curso con código ${value} no está vigente.`, 400);
            }

            if (!curso.tiene_evento_creado) { // Validación de negocio: ¿tiene evento creado?
                throw new AppError(`El curso con código ${value} no tiene evento creado.`, 400);
            }
        }),

    check('opciones')
        .exists().withMessage("Las opciones son requeridas.")
        .custom((value) => {
            const requiredProps = ['autogestionado', 'correlatividad', 'departamento', 'edad', 'publicaPCC'];
            for (const prop of requiredProps) {
                if (!Object.prototype.hasOwnProperty.call(value, prop)) {
                    throw new AppError(`El campo '${prop}' en opciones es requerido.`, 400);
                }
                // Permite booleanos o 0/1 como válidos
                if (
                    typeof value[prop] !== 'boolean' &&
                    value[prop] !== 0 &&
                    value[prop] !== 1
                ) {
                    throw new AppError(`El campo '${prop}' en opciones debe ser booleano o 0/1.`, 400);
                }
            }
            return true;
        }),



    // 4. Validaciones para el array de 'cohortes' y sus elementos
    body('cohortes')
        .isArray({ min: 1 }).withMessage("Se requiere un array de cohortes con al menos una cohorte."),

    // Validar cada elemento dentro del array de cohortes utilizando '.*.'
    body('cohortes.*.fechaInscripcionDesde')
        .exists().withMessage("El campo 'fechaInscripcionDesde' es requerido para cada cohorte.")
        .isISO8601().withMessage("El formato de 'fechaInscripcionDesde' es incorrecto (debe ser YYYY-MM-DDTHH:mm:ssZ).")
        .customSanitizer(value => {
            // Convierte a formato YYYY-MM-DD usando Luxon
            const fecha = DateTime.fromISO(value, { zone: 'America/Argentina/Buenos_Aires' });
            return fecha.isValid ? fecha.toISODate() : value;
        }),

    body('cohortes.*.fechaInscripcionHasta')
        .exists().withMessage("El campo 'fechaInscripcionHasta' es requerido para cada cohorte.")
        .isISO8601().withMessage("El formato de 'fechaInscripcionHasta' es incorrecto (debe ser YYYY-MM-DDTHH:mm:ssZ).")
        .customSanitizer(value => {
            // Convierte a formato YYYY-MM-DD usando Luxon
            const fecha = DateTime.fromISO(value, { zone: 'America/Argentina/Buenos_Aires' });
            return fecha.isValid ? fecha.toISODate() : value;
        }),

    body('cohortes.*.fechaCursadaDesde')
        .exists().withMessage("El campo 'fechaCursadaDesde' es requerido para cada cohorte.")
        .isISO8601().withMessage("El formato de 'fechaCursadaDesde' es incorrecto (debe ser YYYY-MM-DDTHH:mm:ssZ).")
        .customSanitizer(value => {
            // Convierte a formato YYYY-MM-DD usando Luxon
            const fecha = DateTime.fromISO(value, { zone: 'America/Argentina/Buenos_Aires' });
            return fecha.isValid ? fecha.toISODate() : value;
        }),
    body('cohortes.*.fechaCursadaHasta')
        .exists().withMessage("El campo 'fechaCursadaHasta' es requerido para cada cohorte.")
        .isISO8601().withMessage("El formato de 'fechaCursadaHasta' es incorrecto (debe ser YYYY-MM-DDTHH:mm:ssZ).")
        .customSanitizer(value => {
            // Convierte a formato YYYY-MM-DD usando Luxon
            const fecha = DateTime.fromISO(value, { zone: 'America/Argentina/Buenos_Aires' });
            return fecha.isValid ? fecha.toISODate() : value;
        }),


    // 5. Validación personalizada: Lógica de orden de fechas dentro de cada cohorte
    //    Esta validación se ejecuta *después* de que las fechas ya fueron convertidas a objetos Date por .toDate().
    body('cohortes').custom(async (cohortes, { req }) => {
        // Si 'cohortes' no es un array (por una validación anterior), salimos.
        if (!Array.isArray(cohortes)) {
            return true;
        }


        const { esExcepcionParaFechas } = req.user.user;
        // Devolver error si esExcepcionParaFechas no existe o es distinto a bolean
        if (esExcepcionParaFechas != 0 && esExcepcionParaFechas != 1) {
            throw new AppError(`El campo 'esExcepcionParaFechas' debe ser un cero ó uno`, 400);
        }



        for (let i = 0; i < cohortes.length; i++) {
            const cohorte = cohortes[i];
            const { fechaInscripcionDesde, fechaInscripcionHasta, fechaCursadaDesde, fechaCursadaHasta } = cohorte;

            //Validamos que la instancia no exista

            const cod_curso = req.body.curso;

            const instancia = await Instancia.findOne({
                where: {
                    curso: cod_curso,
                    fecha_inicio_curso: fechaCursadaDesde
                }
            });

            if (instancia) {
                throw new AppError(`Ya existe una instancia con el mismo curso y fecha de cursada.`, 400);
            }

            // Verificaciones defensivas: Asegurar que las fechas son objetos Date válidos antes de comparar.
            // Validar con Luxon si las fechas son válidas
            const fiDesde = DateTime.fromISO(fechaInscripcionDesde, { zone: 'America/Argentina/Buenos_Aires' });
            const fiHasta = DateTime.fromISO(fechaInscripcionHasta, { zone: 'America/Argentina/Buenos_Aires' });
            const fcDesde = DateTime.fromISO(fechaCursadaDesde, { zone: 'America/Argentina/Buenos_Aires' });
            const fcHasta = DateTime.fromISO(fechaCursadaHasta, { zone: 'America/Argentina/Buenos_Aires' });

            if (!fiDesde.isValid || !fiHasta.isValid || !fcDesde.isValid || !fcHasta.isValid) {
                throw new AppError(`Error de formato de fecha en la cohorte ${i + 1}. Asegúrate que todas las fechas son válidas.`, 400);
            }

            // Regla 1: fechaInscripcionDesde debe ser estrictamente anterior a fechaInscripcionHasta
            if (fiDesde>= fiHasta) {
                throw new AppError(`La 'fechaInscripcionDesde' debe ser estrictamente anterior a 'fechaInscripcionHasta' para la cohorte ${i + 1}.`, 400);
            }



            // Regla 3: fechaCursadaDesde debe ser estrictamente anterior a fechaCursadaHasta
            if (fcDesde >= fcHasta) {
                throw new AppError(`La 'fechaCursadaDesde' debe ser estrictamente anterior a 'fechaCursadaHasta' para la cohorte ${i + 1}.`, 400);
            }


            // Reglas de validación

            //Total cursos acumulados
            const fechaCursadaDesdeString = fcDesde.toFormat('yyyy-MM-dd');
            if (esExcepcionParaFechas == "0" && await Instancia.supera_cupo_mes(fechaCursadaDesdeString)) {
                throw new AppError(`La cantidad de cupos mensual superan el límite establecido.`, 400);
            }

            //Total cursos mes
            if (esExcepcionParaFechas == "0" && await Instancia.supera_cupo_dia(fechaCursadaDesdeString)) throw new AppError(`La cantidad de cupos en el dia supera el límite establecido.`, 400);

            // Calcular cupo del mes
            if (esExcepcionParaFechas == "0" && await Instancia.supera_cantidad_cursos_acumulado(fechaCursadaDesdeString)) throw new AppError(`La cantidad de cursos acumulado supera el límite establecido`, 400);

            // Calcular cantidad de cursos que comienzan en el día
            if (esExcepcionParaFechas == "0" && await Instancia.supera_cantidad_cursos_mes(fechaCursadaDesdeString)) throw new AppError(`La cantidad de cursos en el mes supera el límite establecido`, 400);

            // Calcular la cantidad de cupo por dia
            if (esExcepcionParaFechas == "0" && await Instancia.supera_cantidad_cursos_dia(fechaCursadaDesdeString)) throw new AppError(`La cantidad de cursos en el dia supera el límite establecido`, 400);


        }


        return true; // Si todas las cohortes pasan las validaciones de orden
    }),


    check('tutores')
        .exists().withMessage("El campo 'tutores' es requerido.")
        .isArray({ min: 1 }).withMessage("El campo 'tutores' debe ser un array con al menos un tutor.")
        .custom(async (tutores, { req }) => {
            for (const tutor of tutores) {
                const { cuil } = tutor;
                const existeTutor = await Tutor.findOne({ where: { cuil } });
                if (!existeTutor) {
                    throw new AppError(`El tutor con cuil ${cuil} no existe.`, 400);
                }
            }
            return true;
        }),

]

export default validarDatosCursoConCohortes