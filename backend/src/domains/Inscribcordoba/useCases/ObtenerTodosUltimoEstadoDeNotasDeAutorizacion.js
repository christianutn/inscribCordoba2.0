class ObtenerTodosUltimoEstadoDeNotasDeAutorizacion {

    constructor({ repositorioCambioEstadoNotaDeAutorizacion }) {
        this.repositorioCambioEstadoNotaDeAutorizacion = repositorioCambioEstadoNotaDeAutorizacion;
    }

    async ejecutar() {

        const todosLosCambiosEstados = await this.repositorioCambioEstadoNotaDeAutorizacion.getTodosLosCambiosEstados();

        // filtramos y dejamos sólo los últimos, son aquellos que tiene fecha_hasta igual a null
        const ultimosCambiosEstados = todosLosCambiosEstados.filter(cambio =>
            cambio.fecha_hasta === null || cambio.estado_nota_autorizacion_cod == "AUT"
        );
        return ultimosCambiosEstados;
    }

}



export default ObtenerTodosUltimoEstadoDeNotasDeAutorizacion;