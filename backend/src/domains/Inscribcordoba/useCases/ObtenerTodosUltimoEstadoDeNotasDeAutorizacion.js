class ObtenerTodosUltimoEstadoDeNotasDeAutorizacion {

    constructor({ repositorioCambioEstadoNotaDeAutorizacion }) {
        this.repositorioCambioEstadoNotaDeAutorizacion = repositorioCambioEstadoNotaDeAutorizacion;
    }

    async ejecutar(areaReferente = null) {

        let todosLosCambiosEstados = await this.repositorioCambioEstadoNotaDeAutorizacion.getTodosLosCambiosEstados();

        if (areaReferente) {
            todosLosCambiosEstados = todosLosCambiosEstados.filter(cambio =>
                cambio.NotaAutorizacion.detalle_usuario.area === areaReferente
            );
        }

        // filtramos y dejamos sólo los últimos, son aquellos que tiene fecha_hasta igual a null
        const ultimosCambiosEstados = todosLosCambiosEstados.filter(cambio =>
            cambio.fecha_hasta === null || cambio.estado_nota_autorizacion_cod == "AUT"
        );
        return ultimosCambiosEstados;
    }

}



export default ObtenerTodosUltimoEstadoDeNotasDeAutorizacion;