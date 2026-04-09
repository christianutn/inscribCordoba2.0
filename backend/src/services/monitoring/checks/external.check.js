/**
 * Check genérico para endpoints externos.
 * 
 * Recibe una lista de endpoints configurables y los testea uno por uno.
 * Para cada endpoint verifica:
 *  - Que responda dentro del timeout
 *  - Que devuelva el status HTTP esperado (por defecto 200)
 * 
 * Los endpoints se configuran via variable de entorno MONITORING_EXTERNAL_ENDPOINTS
 * con formato JSON: [{"name":"Google","url":"https://google.com","timeout":5000,"expectedStatus":200}]
 * 
 * @returns {Object} { success: boolean, message: string, results: Array }
 */

// Endpoints por defecto si no se configuran en .env
const DEFAULT_ENDPOINTS = [
    {
        name: 'Frontend Test',
        url: process.env.URL_TEST_FRONTEND || 'https://inscribcordoba.test.cba.gov.ar',
        timeout: 10000,
        expectedStatus: 200
    }
];

/**
 * Testea un endpoint individual
 * @param {Object} endpoint - { name, url, timeout, expectedStatus }
 * @returns {Object} - { name, url, success, message, responseTime }
 */
const testEndpoint = async (endpoint) => {
    const { name, url, timeout = 10000, expectedStatus = 200 } = endpoint;
    const startTime = Date.now();

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
            method: 'GET',
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        if (response.status === expectedStatus) {
            return {
                name,
                url,
                success: true,
                message: `Respuesta OK (${response.status}) en ${responseTime}ms`,
                responseTime
            };
        }

        return {
            name,
            url,
            success: false,
            message: `Status inesperado: ${response.status} (esperado: ${expectedStatus})`,
            responseTime
        };
    } catch (error) {
        const responseTime = Date.now() - startTime;

        if (error.name === 'AbortError') {
            return {
                name,
                url,
                success: false,
                message: `Timeout después de ${timeout}ms`,
                responseTime
            };
        }

        return {
            name,
            url,
            success: false,
            message: `Error de conexión: ${error.message}`,
            responseTime
        };
    }
};

/**
 * Ejecuta el check de todos los endpoints externos configurados
 */
const checkExternal = async () => {
    // Intentar leer endpoints personalizados desde .env
    let endpoints = DEFAULT_ENDPOINTS;

    if (process.env.MONITORING_EXTERNAL_ENDPOINTS) {
        try {
            endpoints = JSON.parse(process.env.MONITORING_EXTERNAL_ENDPOINTS);
        } catch {
            // Si el JSON es inválido, usar los defaults
            console.warn('[MONITORING] [EXTERNAL] JSON inválido en MONITORING_EXTERNAL_ENDPOINTS, usando defaults');
        }
    }

    if (endpoints.length === 0) {
        return {
            success: true,
            message: 'No hay endpoints externos configurados para verificar',
            results: []
        };
    }

    // Ejecutar todos los checks en paralelo
    const results = await Promise.all(endpoints.map(testEndpoint));

    // Determinar si hubo algún fallo
    const failures = results.filter(r => !r.success);
    const allOk = failures.length === 0;

    return {
        success: allOk,
        message: allOk
            ? `Todos los endpoints externos respondieron correctamente (${results.length}/${results.length})`
            : `${failures.length}/${results.length} endpoint(s) fallaron`,
        results
    };
};

export default checkExternal;
