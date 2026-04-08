import EstadoCursoBase from '../EstadoCursoBase.js';

/** Estado: Maquetado. */
class EstadoMAQ extends EstadoCursoBase {
    constructor() {
        super('MAQ', 'CON', 'AUT');
    }
}

export default EstadoMAQ;
