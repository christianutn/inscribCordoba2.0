import checkSmtp from './checks/smtp.check.js';
import checkCidi from './checks/cidi.check.js';
import checkExternal from './checks/external.check.js';
import sendEmailAlert from './alerts/email.alert.js';
import logger from '../../utils/logger.js';

/**
 * Servicio principal de monitoreo.
 * 
 * Orquesta la ejecución de todos los checks de salud y dispara alertas
 * si alguno falla. Cada check se ejecuta de forma independiente:
 * si uno falla, los demás siguen ejecutándose.
 * 
 * Flujo:
 *  1. Ejecuta SMTP check, CiDi check y External checks en paralelo
 *  2. Loguea resultado de cada check (éxito o error)
 *  3. Si hay fallas, envía alerta por email con el detalle
 *  4. Retorna resumen completo de la ejecución
 */

/**
 * Ejecuta un check individual envuelto en try/catch
 * para que un check roto no impida ejecutar los demás
 * 
 * @param {string} serviceName - Nombre del servicio
 * @param {Function} checkFn - Función async que ejecuta el check
 * @returns {Object} - { service, success, message, details? }
 */
const safeRunCheck = async (serviceName, checkFn) => {
    try {
        const result = await checkFn();
        return { service: serviceName, ...result };
    } catch (error) {
        return {
            service: serviceName,
            success: false,
            message: `Error inesperado al ejecutar check`,
            details: error.message
        };
    }
};

/**
 * Loguea el resultado de un check con formato estandarizado
 */
const logCheckResult = (result) => {
    const status = result.success ? '✅ OK' : '❌ FALLO';
    const detail = result.details ? ` - ${result.details}` : '';
    const logMessage = `[MONITORING] [${result.service}] ${status} - ${result.message}${detail}`;

    if (result.success) {
        logger.info(logMessage);
        console.log(logMessage);
    } else {
        logger.error(logMessage);
        console.error(logMessage);
    }
};

/**
 * Ejecuta todos los checks de monitoreo y envía alertas si hay fallas.
 * 
 * Esta función está diseñada para ser invocada desde el CRON diario.
 * Maneja sus propios errores internamente: nunca lanza excepciones.
 * 
 * @returns {Object} Resumen de la ejecución
 */
const runMonitoring = async () => {
    const startTime = Date.now();
    const timestamp = new Date().toLocaleString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        dateStyle: 'short',
        timeStyle: 'medium'
    });

    console.log(`[MONITORING] ========================================`);
    console.log(`[MONITORING] Iniciando monitoreo diario - ${timestamp}`);
    console.log(`[MONITORING] ========================================`);
    logger.info(`[MONITORING] Iniciando monitoreo diario - ${timestamp}`);

    // Ejecutar todos los checks en paralelo
    const results = await Promise.all([
        safeRunCheck('SMTP', checkSmtp),
        safeRunCheck('CiDi', checkCidi),
        safeRunCheck('EXTERNAL', checkExternal)
    ]);

    // Loguear cada resultado
    results.forEach(logCheckResult);

    // Si el check externo tiene sub-resultados, loguearlos también
    const externalResult = results.find(r => r.service === 'EXTERNAL');
    if (externalResult?.results) {
        externalResult.results.forEach(subResult => {
            const status = subResult.success ? '✅ OK' : '❌ FALLO';
            const msg = `[MONITORING] [EXTERNAL] [${subResult.name}] ${status} - ${subResult.message}`;
            if (subResult.success) {
                logger.info(msg);
                console.log(msg);
            } else {
                logger.error(msg);
                console.error(msg);
            }
        });
    }

    // Recolectar fallas
    const failures = results.filter(r => !r.success);

    // Enviar alerta si hay fallas
    let alertResult = { sent: false, message: 'No hubo fallas' };
    if (failures.length > 0) {
        console.log(`[MONITORING] ⚠️ Se detectaron ${failures.length} falla(s). Enviando alerta...`);
        logger.error(`[MONITORING] ${failures.length} servicio(s) con fallas detectadas`);

        alertResult = await sendEmailAlert(failures);

        const alertLog = alertResult.sent
            ? `[MONITORING] [ALERTA] ✅ Alerta enviada correctamente`
            : `[MONITORING] [ALERTA] ❌ No se pudo enviar alerta: ${alertResult.message}`;

        if (alertResult.sent) {
            logger.info(alertLog);
            console.log(alertLog);
        } else {
            logger.error(alertLog);
            console.error(alertLog);
        }
    }

    const duration = Date.now() - startTime;
    const summary = {
        timestamp,
        duration: `${duration}ms`,
        checks: results.length,
        passed: results.filter(r => r.success).length,
        failed: failures.length,
        alertSent: alertResult.sent,
        results
    };

    console.log(`[MONITORING] ========================================`);
    console.log(`[MONITORING] Monitoreo completado en ${duration}ms - ${summary.passed}/${summary.checks} OK`);
    console.log(`[MONITORING] ========================================`);
    logger.info(`[MONITORING] Monitoreo completado en ${duration}ms - ${summary.passed}/${summary.checks} checks OK`);

    return summary;
};

export default runMonitoring;
