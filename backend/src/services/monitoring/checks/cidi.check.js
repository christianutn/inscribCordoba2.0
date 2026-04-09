/**
 * Check de salud para la API CiDi (Ciudadano Digital).
 * 
 * Hace un request liviano al endpoint de CiDi para verificar:
 *  - Que haya conectividad con el servidor
 *  - Que responda con status 200
 *  - Que no haya errores de autenticación
 * 
 * Se usa un CUIL de prueba (el del propio operador) para no afectar datos reales.
 * 
 * @returns {Object} { success: boolean, message: string, details?: string }
 */

import crypto from 'crypto';

/**
 * Genera un timestamp en formato CiDi (AAAAMMDDHHMMSSmmm)
 */
const getTimeStamp = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');
    const milliseconds = d.getMilliseconds().toString().padStart(3, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
};

/**
 * Genera el token de autenticación para CiDi
 */
const generateTokenValue = (timeStamp, keyApp) => {
    const dataToHash = timeStamp + keyApp.replace(/-/g, '');
    const hash = crypto.createHash('sha1');
    hash.update(dataToHash, 'utf8');
    return hash.digest('hex').toUpperCase();
};

const checkCidi = async () => {
    const urlApi = process.env.URL_API_PROD;
    const cuilOperador = process.env.CUIL_OPERADOR_PROD;
    const hashCookie = process.env.HASH_COOKIE_OPERADOR_PROD;
    const idApp = process.env.ID_APLICATION_PROD;
    const contrasenia = process.env.CONTRASENIA_PROD;
    const keyApp = process.env.KEY_APP_PROD;

    // Validar que las credenciales existan
    if (!urlApi || !cuilOperador || !keyApp) {
        return {
            success: false,
            message: 'Credenciales CiDi no configuradas',
            details: 'Faltan variables de entorno: URL_API_PROD, CUIL_OPERADOR_PROD o KEY_APP_PROD'
        };
    }

    try {
        const timeStamp = getTimeStamp();
        const tokenValue = generateTokenValue(timeStamp, keyApp);

        // Request liviano usando el CUIL del operador como prueba
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const response = await fetch(urlApi, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                TimeStamp: timeStamp,
                TokenValue: tokenValue,
                CUIL_OPERADOR: cuilOperador,
                HASH_COOKIE_OPERADOR: hashCookie,
                IdAplicacion: idApp,
                Contrasenia: contrasenia,
                CUIL: cuilOperador // Usamos el CUIL del operador como consulta de prueba
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Verificar respuesta HTTP
        if (!response.ok) {
            return {
                success: false,
                message: `API CiDi respondió con status ${response.status}`,
                details: `HTTP ${response.status} - La API no está respondiendo correctamente`
            };
        }

        // Intentar parsear la respuesta para verificar que es válida
        const data = await response.json();

        // Si llega datos, la API está funcionando
        if (data) {
            return {
                success: true,
                message: 'API CiDi respondió correctamente (status 200)'
            };
        }

        return {
            success: false,
            message: 'API CiDi respondió pero sin datos válidos',
            details: 'La respuesta no contiene datos esperados'
        };
    } catch (error) {
        // Distinguir entre timeout y otros errores
        if (error.name === 'AbortError') {
            return {
                success: false,
                message: 'Timeout al conectar con API CiDi',
                details: 'La API no respondió en 15 segundos'
            };
        }

        return {
            success: false,
            message: 'Error al conectar con API CiDi',
            details: error.message
        };
    }
};

export default checkCidi;
