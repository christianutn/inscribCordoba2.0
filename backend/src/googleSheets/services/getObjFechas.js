import { getDataRange } from "../utils/getDataRange.js"; // Importa una función para obtener datos de un rango de Google Sheets.
import authorize from "../utils/getAuth.js"; // Importa una función para autenticar con Google Sheets.
import { google } from 'googleapis'; // Importa la biblioteca de Google APIs para interactuar con Google Sheets.
import ControlDataFechaInicioCursada from "../../models/controlDataFechaInicioCursada.models.js"; // Importa el modelo Sequelize para la configuración de control de datos.



export const getObjFechas = async (aplicaRestricciones) => {
    try {

        // Busca en la base de datos la configuración de control de datos.
        const controlData = await ControlDataFechaInicioCursada.findOne({ where: { id: 1 } });
        if (!controlData) throw new Error('No se encontró la configuración de control de datos'); // Lanza un error si no se encuentra.FF

        // Autenticación para usar Google Sheets API.
        const auth = authorize;
        const googleSheets = google.sheets({ version: 'v4', auth });


        // Crea un objeto vacío para almacenar fechas con información acumulada.
        const fechasObj = {};
        fechasObj.totalCursosComenzados = 0;
        fechasObj.listaFechasFin = [];
        fechasObj.listaFechasInicio = [];

        

        // Obtiene los datos de la hoja "principal" desde la columna B a la X.
        const data = await getDataRange(googleSheets, auth, "principal", "B:X");



        if (data && data.length > 0) {
            // Divide la primera fila como cabecera y el resto como filas de datos.
            const [headers, ...rows] = data;

            // Crea un array de objetos clave-valor de cada fila, usando la cabecera como clave.
            const keyValueArray = rows.map(row =>
                headers.reduce((acc, header, index) => ({
                    ...acc,
                    [header]: row[index]
                }), {})
            );

           

            // Recorre cada fila de datos y actualiza el objeto `fechasObj` con cupos y cursos.
            keyValueArray.forEach(row => {
                const fechaInicioCursada = new Date(row['Fecha inicio del curso']); // Convierte la fecha de inicio a un objeto Date.
                const fechaFinCursada = new Date(row['Fecha fin del curso']); // Convierte la fecha de fin a un objeto Date.

                const cupo = parseInt(row["Cupo"], 10) || 0; // Convierte el cupo a entero, o usa 0 si es inválido.
                const estado = row["Estado"]; // Obtiene el estado del curso.

                // Ignora las fechas si el estado es "SUSPENDIDO" o "CANCELADO".
                if (estado !== "SUSPENDIDO" && estado !== "CANCELADO") {
                    // Convierte la fecha a un formato clave 'YYYY-MM-DD'.
                    const fechaClave = fechaInicioCursada.toISOString().split('T')[0];
                    const fechaClaveFinCurso = fechaFinCursada.toISOString().split('T')[0];

                    const claveMesAnio = `${fechaClave.split('-')[0]}-${fechaClave.split('-')[1]}`;

                    // Inicializa el objeto si la fecha aún no existe en `fechasObj`.
                    if (!fechasObj[claveMesAnio]) {
                        fechasObj[claveMesAnio] = {
                            cantidadCupoMensual: 0,
                            cantidadCursosMensual: 0,
                            invalidarMesAnio: false,
                        };
                    }

                    // Verifica si el objeto `fechaClave` ya existe dentro de `fechasObj[claveMesAnio]`.
                    // Si no, inicialízalo con los valores necesarios.
                    if (!fechasObj[claveMesAnio][fechaClave]) {
                        fechasObj[claveMesAnio][fechaClave] = {
                            cantidadCupoDiario: 0,
                            cantidadCursosDiario: 0,
                            cantidadCursosConCierre: 0,
                            invalidarDia: false
                        };
                    }

                    

                  

                    // En el forEach donde se procesa cada fecha:
                    if (aplicaRestricciones) {
                        // Convertimos el mes de '01' a 1, '02' a 2, etc.
                        const mesActual = parseInt(claveMesAnio.split('-')[1], 10);

                        fechasObj[claveMesAnio].cantidadCupoMensual += cupo;
                        fechasObj[claveMesAnio].cantidadCursosMensual += 1;
                        fechasObj[claveMesAnio].invalidarMesAnio = superaLimiteMensual(
                            fechasObj[claveMesAnio].cantidadCupoMensual,
                            fechasObj[claveMesAnio].cantidadCursosMensual,
                            controlData,
                            mesActual
                        );
                        fechasObj[claveMesAnio][fechaClave].cantidadCupoDiario += cupo;
                        fechasObj[claveMesAnio][fechaClave].cantidadCursosDiario += 1;
                    
                        
                        fechasObj[claveMesAnio][fechaClave].invalidarDia = superaLimiteDiario(
                            fechasObj[claveMesAnio][fechaClave].cantidadCupoDiario,
                            fechasObj[claveMesAnio][fechaClave].cantidadCursosDiario,
                            controlData
                        );

                        // Acumulamos en el objeto `fechasObj` la cantidad total de cursos comenzados.
                        fechasObj.totalCursosComenzados += 1;

                        // Modificar de forma dinámica la lista de fechas fin de curso a través de la función `insertarFechaDeFormaOrdenada`.
                        insertarFechaDeFormaOrdenada(fechasObj.listaFechasFin, fechaFinCursada);
                        insertarFechaDeFormaOrdenada(fechasObj.listaFechasInicio, fechaInicioCursada);
                        
                        

                        
                    }

                    // 

                }
            });
        }

        fechasObj.listaFechasFin = acumularCantidad(fechasObj.listaFechasFin); // modifica la listaFechasFin agregandole un atributo acumulado que es la suma de las cantidades acumuladas desde el índice 0 hasta el final
        fechasObj.listaFechasInicio = acumularCantidad(fechasObj.listaFechasInicio); // modifica la listaFechasInicio agregandole un atributo acumulado que es la suma de las cantidades acumuladas desde el índice 0 hasta el final
        
        return fechasObj;
    } catch (error) {
        // Lanza el error para que sea manejado por la función que llama.
        throw error;
    }
}


const superaLimiteMensual = (cantidadCupoMensual, cantidadCursosMensual, controlData, mesActual) => {
    // Verifica si el mes está bloqueado
    if (controlData.mesBloqueado && controlData.mesBloqueado === mesActual) {
        return true;
    }

    // Verifica los límites de cupos y cursos
    return cantidadCursosMensual >= controlData.maximoCursosXMes ||
        cantidadCupoMensual >= controlData.maximoCuposXMes;
}

const superaLimiteDiario = (cantidadCupoDiario, cantidadCursosDiario, controlData) => {

    if (cantidadCursosDiario >= controlData.maximoCursosXDia || cantidadCupoDiario >= controlData.maximoCuposXDia) {
        return true;
    }
    return false;
}
const insertarFechaDeFormaOrdenada = (listaFechas, fecha) => {
    let inicio = 0;
    let fin = listaFechas.length;
    const fechaClaveFinCurso = fecha.toISOString().split('T')[0]; // Date to ISO string

    while (inicio < fin) {
        const medio = Math.floor((inicio + fin) / 2);

         if (!listaFechas[medio] || !listaFechas[medio].fecha) {
            // Store fechaClaveFinCurso when no record is found.
            listaFechas[medio] = { fecha: fechaClaveFinCurso, cantidad: 1 };
             }


       let existingDate = listaFechas[medio].fecha;
            // Parse existingDate as Date, if not a Date object already.
      let fechaListaDate = (existingDate instanceof Date) ? existingDate : new Date(Date.UTC(
                String(existingDate).split('-')[0] ,
                Number(String(existingDate).split('-')[1]) -1,
                String(existingDate).split('-')[2],
                 ));


        if (fechaListaDate.getTime() === fecha.getTime()) {
            listaFechas[medio].cantidad += 1;
            return listaFechas;
        } else if (fechaListaDate < fecha) {
            inicio = medio + 1;
        } else {
            fin = medio;
        }
    }

    listaFechas.splice(inicio, 0, { fecha: fechaClaveFinCurso, cantidad: 1 });
    return listaFechas;
};

// Función que toma la lista de insertarFechaDeFormaOrdenada y a cada elemento le agrega un atributo acumulado que es la suma de las cantidades acumuladas desde el índice 0 hasta el final
export const acumularCantidad = (listaFechasFin) => {
    let acumulado = 0;
  
    listaFechasFin.forEach((fecha) => {
      acumulado += fecha.cantidad;
      fecha.acumulado = acumulado; // Modify the object directly
    });
  
    return listaFechasFin; // Return the modified array for fluent interface
  };



export const verificarCursosActivos = (fechasObj, limiteCursosActivos) => {
    Object.keys(fechasObj).forEach(claveMesAnio => {
        Object.keys(fechasObj[claveMesAnio]).forEach(fechaClave => {
            let posicion = buscarPosicionFecha(fechaClave, fechasObj.listaFechasFin);
            let cursosActivos = fechasObj.totalCursosComenzados - fechasObj.listaFechasFin[posicion].acumulado;
            if (cursosActivos >= limiteCursosActivos) {
                fechasObj[claveMesAnio][fechaClave].invalidarDia = true;
            }
        });        
    });
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

    return resultado === -1 ? 0: resultado // Si no hay coincidencias, retornamos 0. Si no, retornamos la última que fue menor (o la primera)
};            



const insertarFecha = (listaFechasFin, fechaFin) => {
    let inicio = 0;
    let fin = listaFechasFin.length;
    const fechaClaveFinCurso = fechaFin.toISOString().split('T')[0]; // Date to ISO string

    while (inicio < fin) {
        const medio = Math.floor((inicio + fin) / 2);

         if (!listaFechasFin[medio] || !listaFechasFin[medio].fecha) {
            // Store fechaClaveFinCurso when no record is found.
            listaFechasFin[medio] = { fecha: fechaClaveFinCurso, cantidad: 1 };
             }


       let existingDate = listaFechasFin[medio].fecha;
            // Parse existingDate as Date, if not a Date object already.
      let fechaListaDate = (existingDate instanceof Date) ? existingDate : new Date(Date.UTC(
                String(existingDate).split('-')[0] ,
                Number(String(existingDate).split('-')[1]) -1,
                String(existingDate).split('-')[2],
                 ));


        if (fechaListaDate.getTime() === fechaFin.getTime()) {
            listaFechasFin[medio].cantidad += 1;
            return listaFechasFin;
        } else if (fechaListaDate < fechaFin) {
            inicio = medio + 1;
        } else {
            fin = medio;
        }
    }

    listaFechasFin.splice(inicio, 0, { fecha: fechaClaveFinCurso, cantidad: 1 });
    return listaFechasFin;
};