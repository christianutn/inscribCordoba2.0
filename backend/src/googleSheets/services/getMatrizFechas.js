/*
import { getDataRange } from "../utils/getDataRange.js"; // Importa una función para obtener datos de un rango de Google Sheets.
import authorize from "../utils/getAuth.js"; // Importa una función para autenticar con Google Sheets.
import { google } from 'googleapis'; // Importa la biblioteca de Google APIs para interactuar con Google Sheets.
import ControlDataFechaInicioCursada from "../../models/controlDataFechaInicioCursada.models.js"; // Importa el modelo Sequelize para la configuración de control de datos.

// Función principal que genera un objeto de fechas con sus respectivas características.
export const getMatrizFechas = async (aplicaRestricciones) => {
    try {
        // Autenticación para usar Google Sheets API.
        const auth = authorize;
        const googleSheets = google.sheets({ version: 'v4', auth });

        // Busca en la base de datos la configuración de control de datos.
        const controlData = await ControlDataFechaInicioCursada.findOne({ where: { id: 1 } });
        if (!controlData) throw new Error('No se encontró la configuración de control de datos'); // Lanza un error si no se encuentra.

        // Obtiene los datos de la hoja "principal" desde la columna B a la X.
        const data = await getDataRange(googleSheets, auth, "principal", "B:X");

        // Crea un objeto vacío para almacenar fechas con información acumulada.
        const fechasObj = {};

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

                    // Inicializa el objeto si la fecha aún no existe en `fechasObj`.
                    if (!fechasObj[fechaClave]) {
                        fechasObj[fechaClave] = { cantCupo: 0, cantCursos: 0, esPosible: true };
                    }

                    // Acumula cupos y cursos para esa fecha.
                    fechasObj[fechaClave].cantCupo += cupo;
                    fechasObj[fechaClave].cantCursos += 1;
                }
            });
        }

        // Obtiene la fecha actual en formato clave 'YYYY-MM-DD'.
        const hoy = new Date();
        const fechaHoyClave = hoy.toISOString().split('T')[0];

        // Marca fechas anteriores a la fecha actual como no posibles.
        marcarNoPosibles(fechasObj, fechaHoyClave);

        // Verifica los límites y bloqueos si `aplicaRestricciones` es `true`.
        if (aplicaRestricciones) {
            verificarLimites(fechasObj, controlData);
        }

        // Retorna el objeto con las fechas y sus características.
        return fechasObj;

    } catch (error) {
        // Lanza el error para que sea manejado por la función que llama.
        throw error;
    }
}

// Función que marca fechas anteriores a la fecha de hoy como no posibles.
function marcarNoPosibles(fechasObj, fechaHoyClave) {
    const hoy = new Date(fechaHoyClave); // Convierte la fecha clave a un objeto Date.
    for (const fecha in fechasObj) {
        if (new Date(fecha) < hoy) { // Compara si la fecha es anterior a hoy.
            fechasObj[fecha].esPosible = false; // Marca la fecha como no posible.
        }
    }
}

// Función que verifica límites de cupos y cursos y marca fechas no posibles si se exceden.
function verificarLimites(fechasObj, controlData) {
    let totalCursosMensual = 0;
    let totalCuposMensual = 0;
    let mesActual = null;

    // Recorre cada fecha en `fechasObj` ordenadamente.
    for (const fecha in fechasObj) {
        const [year, month] = fecha.split('-'); // Divide la fecha en año y mes.
        if (mesActual !== `${year}-${month}`) { // Si el mes cambia, reinicia los totales.
            mesActual = `${year}-${month}`;
            totalCursosMensual = 0;
            totalCuposMensual = 0;
        }

        const dataDia = fechasObj[fecha]; // Obtiene los datos del día.
        totalCursosMensual += dataDia.cantCursos; // Suma los cursos del día al total mensual.
        totalCuposMensual += dataDia.cantCupo; // Suma los cupos del día al total mensual.

        // Marca todo el mes como no posible si se exceden los límites mensuales o si está bloqueado.
        if (totalCursosMensual >= controlData.maximoCursosXMes ||
            totalCuposMensual >= controlData.maximoCuposXMes ||
            controlData.mesBloqueado == parseInt(month)) {
            // Marca todo el mes como no posible.
            Object.keys(fechasObj).forEach(key => {
                if (key.startsWith(`${year}-${month}`)) {
                    fechasObj[key].esPosible = false;
                }
            });
        }

        // Marca la fecha específica como no posible si se exceden los límites diarios.
        if (dataDia.cantCupo >= controlData.maximoCuposXDia ||
            dataDia.cantCursos >= controlData.maximoCursosXDia) {
            dataDia.esPosible = false;
        }
    }
}
*/
