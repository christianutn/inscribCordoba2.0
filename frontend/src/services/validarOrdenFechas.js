

export const validarOrdenFechas = (listaFechasEnOrden) => {

    let mantieneOrden = true;

    for (let i = 0; i < listaFechasEnOrden.length - 1; i++) {
        if (listaFechasEnOrden[i] > listaFechasEnOrden[i + 1]) {
            mantieneOrden = false;
            break;
        }
    }
    return mantieneOrden
}