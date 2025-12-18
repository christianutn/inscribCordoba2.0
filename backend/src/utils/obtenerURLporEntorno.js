

export const obtenerURLporEntornoFrontend = () => {
    const entorno = process.env.NODE_ENV || 'development';
    const URL_PROD = process.env.URL_PROD_FRONTEND;
    const URL_TEST = process.env.URL_TEST_FRONTEND;
    const URL_LOCAL_SIN_PORT = process.env.URL_LOCAL_SIN_PORT_FRONTEND;

    if (entorno === 'development') {
        return URL_LOCAL_SIN_PORT;
    } else if (entorno === 'production') {
        return URL_PROD;
    } else if (entorno === 'test') {
        return URL_TEST;
    }

    throw new Error('Entorno no válido');

}