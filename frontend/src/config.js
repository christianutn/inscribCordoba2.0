const entornoReact = process.env.REACT_APP_ENTORNO_REACT || 'production';

const config = {
    apiBaseUrl: process.env.REACT_APP_API_BASE_URL,
    entornoReact,
    rolesPermitidosCcAsistencias: entornoReact === 'development'
        ? ['ADM', 'GA', 'REF']
        : ['ADM', 'GA']
};

export default config;