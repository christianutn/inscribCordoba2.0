import EstadoCursoBase from '../EstadoCursoBase.js';

/**
 * Estado: No Vigente.
 * Estado de baja. No pertenece a la secuencia principal,
 * por eso no tiene siguiente ni anterior en la cadena normal.
 * Solo el ADM puede llegar a este estado desde cualquier otro.
 */
class EstadoNVIG extends EstadoCursoBase {
    constructor() {
        super('NVIG', null, null);
    }

    /** Desde NVIG no se puede avanzar en secuencia. */
    avanzar(_contexto) {
        throw new Error("Un curso No Vigente no puede avanzar. Debe ser reactivado primero.");
    }

    /** Desde NVIG no se puede retroceder en secuencia. */
    retroceder(_contexto) {
        throw new Error("Un curso No Vigente no puede retroceder. Debe ser reactivado primero.");
    }

    /** Dar de baja un curso ya dado de baja no tiene sentido. */
    darDeBaja(_contexto, _rol) {
        throw new Error("El curso ya se encuentra en estado No Vigente.");
    }

    restaurar(contexto, rol, estadoDestino) {
        if (rol !== 'ADM') {
            throw new Error('Solo un usuario con rol ADM puede restaurar un curso desde el estado NVIG.');
        }
        
        const estadosValidos = ['AUT', 'MAQ', 'CON', 'PVICT', 'EC'];
        if (!estadosValidos.includes(estadoDestino)) {
            throw new Error(`El estado de destino '${estadoDestino}' es inválido para restaurar.`);
        }
        
        contexto.setEstado(estadoDestino);
    }
}

export default EstadoNVIG;
