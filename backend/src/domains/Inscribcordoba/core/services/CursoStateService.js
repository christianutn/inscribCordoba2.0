import cursoModel from '../../api/models/curso.models.js';
import EventoModel from '../../api/models/evento.models.js';
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

    const resultado = await _ejecutarTransicion(cod, transaction, ctx => ctx.retroceder());

    // Si el curso retrocedió desde PVICT → CON, debe eliminarse el evento asociado (si existe)
    if (resultado.estadoAnterior === 'PVICT' && resultado.estadoNuevo === 'CON') {
        const eventoExistente = await EventoModel.findOne({
            where: { curso: cod },
            ...(transaction ? { transaction } : {})
        });

        if (eventoExistente) {
            await eventoExistente.destroy({ ...(transaction ? { transaction } : {}) });

            // También limpiar el flag del curso
            await cursoModel.update(
                { tiene_formulario_evento_creado: 0 },
                { where: { cod }, ...(transaction ? { transaction } : {}) }
            );
        }
    }

    return resultado;
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

const autorizar = async (cod, transaction = null) => {
    const estadoInicial = CursoStateContext.getEstadoInicial(); // 'AUT'
    await cursoModel.update(
        { esta_autorizado: 1, estado: estadoInicial },
        { where: { cod }, ...(transaction ? { transaction } : {}) }
    );
};

const autorizarDesdeNota = async (cod, transaction = null) => {
    // 1. Obtener el curso
    const curso = await cursoModel.findOne({
        where: { cod },
        ...(transaction ? { transaction } : {})
    });

    if (!curso) {
        throw new AppError(`No se encontró el curso con código '${cod}'.`, 404);
    }

    // 2. Verificar que el estado actual sea NVIG
    if (curso.estado !== 'NVIG') {
        throw new AppError(`El curso '${cod}' no se puede autorizar porque su estado actual es '${curso.estado}', se esperaba 'NVIG'.`, 400);
    }

    // 3. Verificar si tiene un evento cargado
    const eventoAsociado = await EventoModel.findOne({
        where: { curso: cod },
        ...(transaction ? { transaction } : {})
    });

    // 4. Determinar el nuevo estado
    const nuevoEstado = eventoAsociado ? 'EC' : 'AUT';

    // 5. Actualizar el curso
    await cursoModel.update(
        { esta_autorizado: 1, estado: nuevoEstado },
        { where: { cod }, ...(transaction ? { transaction } : {}) }
    );
};

const CursoStateService = {
    avanzar,
    retroceder,
    darDeBaja,
    marcarPendienteCargaEnVictorius,
    marcarEventoCreadoEnVictorius,
    restaurar,
    autorizar,
    autorizarDesdeNota
};

export default CursoStateService;
