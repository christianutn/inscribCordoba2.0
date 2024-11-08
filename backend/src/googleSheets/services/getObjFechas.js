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
                const cupo = parseInt(row["Cupo"], 10) || 0; // Convierte el cupo a entero, o usa 0 si es inválido.
                const estado = row["Estado"]; // Obtiene el estado del curso.

                // Ignora las fechas si el estado es "SUSPENDIDO" o "CANCELADO".
                if (estado !== "SUSPENDIDO" && estado !== "CANCELADO") {
                    // Convierte la fecha a un formato clave 'YYYY-MM-DD'.
                    const fechaClave = fechaInicioCursada.toISOString().split('T')[0];
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
                    }

                }
            });
        }


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
