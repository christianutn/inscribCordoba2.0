const autorizar = (listaDeRolesAceptados) => {
    return (req, res, next) => {
        try {
            // Verifica que req.user exista y tenga un rol
           
            if (!req.user || !req.user.user.rol) {
                const error = new Error("Usuario no autenticado o rol no definido");
                error.statusCode = 401;
                throw error;
            }
            

            // Verifica si el rol del usuario está en la lista de roles aceptados
            const esAutorizado = listaDeRolesAceptados.includes(req.user.user.rol);

            if (!esAutorizado) {
                const error = new Error("Usuario no autorizado");
                error.statusCode = 403; // 403 Forbidden es más apropiado para autorización
                throw error;
            }

            // Si está autorizado, pasa al siguiente middleware
            next();
        } catch (error) {
            // Asegura que el error tenga un statusCode
            if (!error.statusCode) {
                error.statusCode = 500; // 500 Internal Server Error por defecto
            }
            next(error); // Pasa el error al siguiente middleware de manejo de errores
        }
    };
};

export default autorizar;