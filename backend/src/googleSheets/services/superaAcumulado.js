import ControlDataFechaInicioCursada from "../../models/controlDataFechaInicioCursada.models.js"; // Importa el modelo Sequelize para la configuración de control de datos.


export const superaAcumulado = async (objFechas, fechaClave) => {
    try {
        const { listaFechasFin, listaFechasInicio } = objFechas;

        if (!listaFechasFin || !listaFechasInicio) {
            const error = new Error("Error en cálculo de acumulado");
            error.statusCode = 404;
            throw error;
        }




        const posInicio = buscarPosicionFecha(fechaClave, listaFechasInicio);
        const posFin = buscarPosicionFecha(fechaClave, listaFechasFin);

        const acumulado = listaFechasInicio[posInicio].acumulado - listaFechasFin[posFin].acumulado;

        const controlDataFecha = await ControlDataFechaInicioCursada.findOne({ where: { id: 1 } });
        
        if (!controlDataFecha) {
            const error = new Error("Error controlDataFecha es nulo");
            error.statusCode = 404;
            throw error;
        }

        if (acumulado >= controlDataFecha.maximoAcumulado) {
            return true;
        }

        return false;

    } catch (error) {
        throw error;
    }

}


const buscarPosicionFecha = (fecha, ListaFechas) => {
    let inicio = 0;
    let fin = ListaFechas.length;
    const fechaBuscada = new Date(Date.UTC(
        Number(fecha.split('-')[0]),
        Number(fecha.split('-')[1]) - 1,
        Number(fecha.split('-')[2])
    ));
    let resultado = -1; // Inicializamos con -1 por si no hay coincidencias

    while (inicio < fin) {
        const medio = Math.floor((inicio + fin) / 2);
        const fechaLista = ListaFechas[medio].fecha;
        const fechaListaDate = new Date(Date.UTC(
            Number(fechaLista.split('-')[0]),
            Number(fechaLista.split('-')[1]) - 1,
            Number(fechaLista.split('-')[2])
        ));


        if (fechaListaDate.getTime() === fechaBuscada.getTime()) {
            return medio; // Coincidencia exacta encontrada
        } else if (fechaListaDate < fechaBuscada) {
            resultado = medio; // Almacenamos el índice del último menor
            inicio = medio + 1; // Buscamos en la mitad superior
        } else {
            fin = medio; // Buscamos en la mitad inferior
        }
    }

    return resultado === -1 ? 0 : resultado // Si no hay coincidencias, retornamos 0. Si no, retornamos la última que fue menor (o la primera)
};            
