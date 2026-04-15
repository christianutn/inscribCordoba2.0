import EstadoCursoBase from '../EstadoCursoBase.js';

/** Estado: Pre-Victima (próximo a dictarse). */
class EstadoPVICT extends EstadoCursoBase {
    constructor() {
        super('PVICT', 'EC', 'CON');
    }

    marcarEventoCreadoEnVictorius(contexto) {
        this.avanzar(contexto);
    }
}

export default EstadoPVICT;
