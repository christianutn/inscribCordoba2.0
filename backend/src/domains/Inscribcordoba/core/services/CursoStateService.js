import cursoModel from '../../api/models/curso.models.js';
import CursoStateContext from '../states/curso/CursoStateContext.js';
import AppError from '../../../../utils/appError.js';

/**
 * Función privada para manejar la infraestructura de la transición de estados.
 * Busca el curso, inicializa el contexto, ejecuta el callback polimórfico
 * y persiste el nuevo estado.
 */
const _ejecutarTransicion = async (cod, transaction, transitionCallback) => {
    // 1. Buscar el curso en BD
    const curso = await cursoModel.findOne({ 
        where: { cod },
        ...(transaction ? { transaction } : {}) 
    });
    
    if (!curso) {
        throw new AppError(`No se encontró el curso con código '${cod}'.`, 404);
    }

    // 2. Instanciar el contexto
    const contexto = new CursoStateContext(curso.estado);
    const estadoAnterior = contexto.getEstadoActual();

    // 3. Ejecutar la acción específica (Callback polimórfico)
    transitionCallback(contexto);

    // 4. Persistir el nuevo estado
    const estadoNuevo = contexto.getEstadoActual();
    
    if (estadoAnterior !== estadoNuevo) {
        await cursoModel.update(
            { estado: estadoNuevo },
            { where: { cod }, ...(transaction ? { transaction } : {}) }
        );
    }

    return { estadoAnterior, estadoNuevo };
}

// === API PÚBLICA DEL SERVICIO ===

const avanzar = async (cod, transaction = null) => {
    return _ejecutarTransicion(cod, transaction, ctx => ctx.avanzar());
};

const retroceder = async (cod, rol, transaction = null) => {
    if (rol !== 'ADM') throw new AppError('Solo un usuario con rol ADM puede retroceder el estado de un curso.', 403);
    return _ejecutarTransicion(cod, transaction, ctx => ctx.retroceder());
};

const darDeBaja = async (cod, rol, transaction = null) => {
    if (rol !== 'ADM') throw new AppError('Solo un usuario con rol ADM puede dar de baja un curso.', 403);
    return _ejecutarTransicion(cod, transaction, ctx => ctx.darDeBaja(rol));
};

const marcarPendienteCargaEnVictorius = async (cod, transaction = null) => {
    return _ejecutarTransicion(cod, transaction, ctx => ctx.marcarPendienteCargaEnVictorius());
};

const marcarEventoCreadoEnVictorius = async (cod, transaction = null) => {
    return _ejecutarTransicion(cod, transaction, ctx => ctx.marcarEventoCreadoEnVictorius());
};

const restaurar = async (cod, rol, estadoDestino, transaction = null) => {
    if (rol !== 'ADM') throw new AppError('Solo un usuario con rol ADM puede restaurar un curso.', 403);
    return _ejecutarTransicion(cod, transaction, ctx => ctx.restaurar(rol, estadoDestino));
};

const CursoStateService = {
    avanzar,
    retroceder,
    darDeBaja,
    marcarPendienteCargaEnVictorius,
    marcarEventoCreadoEnVictorius,
    restaurar
};

export default CursoStateService;
