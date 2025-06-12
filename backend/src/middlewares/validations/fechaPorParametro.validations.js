import { param } from "express-validator";
import { DateTime } from "luxon"; // <-- Agrega esta línea

const validarFechaPorParametro = [
    param('fechaCursadaDesde')
        .exists().withMessage("El campo 'fechaInscripcionDesde' es requerido para cada cohorte.")
        .isISO8601().withMessage("El formato de 'fechaInscripcionDesde' es incorrecto (debe ser YYYY-MM-DDTHH:mm:ssZ).")
        .customSanitizer(value => {
            // Convierte a formato YYYY-MM-DD usando Luxon
            const fecha = DateTime.fromISO(value, { zone: 'America/Argentina/Buenos_Aires' });
            return fecha.isValid ? fecha.toISODate() : value;
        }),
];

export default validarFechaPorParametro;