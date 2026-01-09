import 'dotenv/config';

/**
 * Configuración centralizada de variables de entorno
 * Este archivo proporciona acceso centralizado y tipado a todas las variables de entorno
 * según el entorno de ejecución (development, test, production)
 */

const ENV = process.env.NODE_ENV || 'development';

const config = {
    // Entorno actual
    env: ENV,
    isDevelopment: ENV === 'development',
    isTest: ENV === 'test',
    isProduction: ENV === 'production',

    // Puerto del servidor
    port: process.env.PORT || 4000,

    // Base de datos
    database: {
        name: ENV === 'production'
            ? process.env.DB_NAME_PROD
            : ENV === 'test'
                ? process.env.DB_NAME_TEST
                : process.env.DB_NAME_DEV,
        user: ENV === 'production'
            ? process.env.DB_USER_PROD
            : ENV === 'test'
                ? process.env.DB_USER_TEST
                : process.env.DB_USER_DEV,
        password: ENV === 'production'
            ? process.env.DB_PASSWORD_PROD
            : ENV === 'test'
                ? process.env.DB_PASSWORD_TEST
                : process.env.DB_PASSWORD_DEV,
        host: ENV === 'production'
            ? process.env.DB_HOST_PROD
            : ENV === 'test'
                ? process.env.DB_HOST_TEST
                : process.env.DB_HOST_DEV,
        port: ENV === 'production'
            ? process.env.DB_PORT_PROD
            : ENV === 'test'
                ? process.env.DB_PORT_TEST
                : process.env.DB_PORT_DEV,
    },

    // URLs Frontend
    frontend: {
        url: ENV === 'production'
            ? process.env.URL_PROD_FRONTEND
            : ENV === 'development'
                ? process.env.URL_TEST_FRONTEND
                : process.env.URL_LOCAL_SIN_PORT_FRONTEND || 'http://localhost:3000',
    },

    // Email (SMTP)
    email: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        supportEmail: 'soportecampuscordoba@cba.gov.ar',
    },

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: '12h',
    },

    // Bcrypt
    bcrypt: {
        salt: parseInt(process.env.SALT) || 10,
    },

    // Google Drive
    googleDrive: {
        privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
        folderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
    },

    // CIDI (Sistema de autenticación)
    cidi: {
        cuilOperador: process.env.CUIL_OPERADOR_PROD,
        hashCookieOperador: process.env.HASH_COOKIE_OPERADOR_PROD,
        idApplication: process.env.ID_APLICATION_PROD,
        contrasenia: process.env.CONTRASENIA_PROD,
        keyApp: process.env.KEY_APP_PROD,
        urlApi: process.env.URL_API_PROD,
    },
};

/**
 * Valida que las variables de entorno requeridas estén configuradas
 * @throws {Error} Si falta alguna variable requerida
 */
export const validateEnvConfig = () => {
    const requiredVars = [
        { key: 'JWT_SECRET', value: config.jwt.secret, env: 'all' },
        { key: 'EMAIL_USER', value: config.email.user, env: 'all' },
        { key: 'EMAIL_PASS', value: config.email.pass, env: 'all' },
    ];

    const missing = requiredVars
        .filter(v => v.env === 'all' || v.env === ENV)
        .filter(v => !v.value)
        .map(v => v.key);

    if (missing.length > 0) {
        throw new Error(`Faltan variables de entorno requeridas: ${missing.join(', ')}`);
    }
};

export default config;
