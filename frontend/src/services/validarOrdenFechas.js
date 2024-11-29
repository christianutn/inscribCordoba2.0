export const validarOrdenFechas = (listaFechasEnOrden, esAutogestionado) => {
    const mensajes = [
        "- Fecha inscripción desde -",
        "- Fecha inscripción hasta -",
        "- Fecha cursada desde -",
        "- Fecha cursada hasta -"
    ];

    // Función para convertir fecha de AAAA-MM-DD a DD-MM-AAAA
    const formatoFecha = (fecha) => fecha.split('-').reverse().join('-');

    const throwError = (i, j) => {
        throw new Error(`La ${mensajes[i]} (${formatoFecha(listaFechasEnOrden[i])}) no puede ser posterior a ${mensajes[j]} (${formatoFecha(listaFechasEnOrden[j])})`);
    };

    if (!esAutogestionado) {
        // Validar orden cronológico general
        for (let i = 0; i < listaFechasEnOrden.length - 1; i++) {
            if (listaFechasEnOrden[i] > listaFechasEnOrden[i + 1]) {
                throwError(i, i + 1);
            }
        }

        // Validar que la fecha de inscripción hasta sea anterior a la fecha de cursada desde
        if (listaFechasEnOrden[1] >= listaFechasEnOrden[2]) {
            throwError(1, 2);
        }
    } else {
        // Validar límites para autogestión
        const [inscripcionDesde, inscripcionHasta, cursadaDesde, cursadaHasta] = listaFechasEnOrden;

        if (inscripcionDesde > cursadaHasta) {
            throwError(0, 3);
        }

        if (inscripcionHasta < inscripcionDesde || inscripcionHasta > cursadaHasta) {
            throw new Error(`La ${mensajes[1]} (${formatoFecha(inscripcionHasta)}) debe estar entre ${mensajes[0]} (${formatoFecha(inscripcionDesde)}) y ${mensajes[3]} (${formatoFecha(cursadaHasta)})`);
        }

        if (cursadaDesde < inscripcionDesde || cursadaDesde > cursadaHasta) {
            throw new Error(`La ${mensajes[2]} (${formatoFecha(cursadaDesde)}) debe estar entre ${mensajes[0]} (${formatoFecha(inscripcionDesde)}) y ${mensajes[3]} (${formatoFecha(cursadaHasta)})`);
        }
    }

    return true;
};

