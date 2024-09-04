export const validarOrdenFechas = (listaFechasEnOrden) => {
    const listMensaje = [
        "- Fecha inscripción desde -",
        "- Fecha inscripción hasta -",
        "- Fecha cursada desde -",
        "- Fecha cursada hasta -"
    ];

    for (let i = 0; i < listaFechasEnOrden.length - 1; i++) {
        if (listaFechasEnOrden[i] > listaFechasEnOrden[i + 1]) {
            throw new Error(`La ${listMensaje[i]} (${listaFechasEnOrden[i]}) no puede ser posterior a ${listMensaje[i + 1]} (${listaFechasEnOrden[i + 1]})`);
        }
    }

    return true;
};



/* let mantieneOrden = true;

  for (let i = 0; i < listaFechasEnOrden.length - 1; i++) {
      if (listaFechasEnOrden[i] > listaFechasEnOrden[i + 1]) {
          mantieneOrden = false;
          break;
      }
  }
  return mantieneOrden */