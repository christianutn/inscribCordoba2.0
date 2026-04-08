import EstadoCursoBase from '../EstadoCursoBase.js';

/** Estado: Configurado. */
class EstadoCON extends EstadoCursoBase {
    constructor() {
        super('CON', 'PVICT', 'MAQ');
    }

    marcarPendienteCargaEnVictorius(contexto) {
        this.avanzar(contexto);
    }
}

export default EstadoCON;
