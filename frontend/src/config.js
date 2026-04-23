const entornoReact = process.env.REACT_APP_ENTORNO_REACT || 'production';

// ID de la aplicación registrada en CiDi
const cidiAppId = process.env.REACT_APP_CIDI_APP_ID || '704';

// URL del portal CiDi según entorno
const cidiLoginUrl = entornoReact === 'production'
    ? `https://cidi.cba.gov.ar/Cuenta/Login?app=${cidiAppId}`
    : `https://cidi.test.cba.gov.ar/Cuenta/Login?app=${cidiAppId}`;

const config = {
    apiBaseUrl: process.env.REACT_APP_API_BASE_URL,
    entornoReact,
    rolesPermitidosCcAsistencias: entornoReact === 'development'
        ? ['ADM', 'GA', 'REF', 'LOG']
        : ['ADM', 'GA', 'LOG'],

    // CiDi
    cidiLoginUrl,
    cidiAppId,
};

export default config;
