import { getDataRange } from "../utils/getDataRange.js";
import authorize from "../utils/getAuth.js";
import { google } from 'googleapis';

const esPosibleLaFecha = async (fecha) => {
    try {

        //Obtiene autorización
        const auth = authorize
        const googleSheets = google.sheets({ version: 'v4', auth });

        const data = await getDataRange(googleSheets, auth, "principal", "B:X");

        const matrizFechas = Array.from({ length: 12 }, () =>
            Array.from({ length: 31 }, () => ({ cantCupo: 0, cantCursos: 0 }))
        );


        if (data && data.length > 0) {
            const headers = data[0]; // Suponiendo que la primera fila contiene los encabezados
            const keyValueArray = data.slice(1).map((row) => {
                let rowObject = {};
                headers.forEach((header, index) => {
                    rowObject[header] = row[index];
                });
                return rowObject;
            });

            keyValueArray.forEach((row) => {



                let fechaInicioCursada = row['Fecha inicio del curso'];
                fechaInicioCursada = new Date(fechaInicioCursada);

                let cupo = row["Cupo"];

                let estado = row["Estado"];

                // Usar métodos UTC para evitar problemas de zona horaria
                let mesUTC = fechaInicioCursada.getUTCMonth() + 1; // Sumar 1 porque los meses están indexados desde 0
                let diaUTC = fechaInicioCursada.getUTCDate();

                //console.log(fechaInicioCursada, mesUTC, diaUTC);

                if (estado != "Cerrado" && estado != "SUSPENDIDO" && estado != "CANCELADO") {
                    // Ahora, accede a la matriz utilizando los valores UTC
                    matrizFechas[mesUTC - 1][diaUTC - 1].cantCupo += parseInt(cupo, 10) || 0;
                    matrizFechas[mesUTC - 1][diaUTC - 1].cantCursos += 1;
                }



            });


        }

        //console.log(matrizFechas)

        //Contar la cantidad de cursos por mes de matriz

        const fechaAValidar = new Date(fecha);

        const mesAValidar = fechaAValidar.getUTCMonth();

        let totalCursosMensual = 0;
        let totalCuposMensual = 0;

        for (let i = 0; i < 31; i++) {

            totalCursosMensual += matrizFechas[mesAValidar][i].cantCursos;

            totalCuposMensual += matrizFechas[mesAValidar][i].cantCupo;
            //console.log(matrizFechas[mesAValidar][i].cantCupo);
        }
        //console.log("MEs a validar: ", mesAValidar)
        //console.log("totalCursosMensual:", totalCursosMensual, "totalCuposMensual:", totalCuposMensual);

        /* 1. Número de Capacitaciones Mensuales
        Regla 1.1: El sistema debe permitir la creación y gestión de hasta 45 cursos mensuales.*/

        if (totalCursosMensual > 45) {
            console.log("totalCursosMensual:", totalCursosMensual, "Super el cupo mensual de 45");
            return false
        }

        /*   2. Capacidad Total de Cupos
  Regla 2.1: El sistema debe gestionar un total de hasta 60,000 cupos disponibles para todos los cursos combinados en el mes.
  Regla 2.2: La asignación de cupos debe actualizarse en tiempo real para reflejar la disponibilidad actual.
  */

        if (totalCuposMensual > 60000) {
            console.log("Supera el cupo mensual de 60000: ", totalCuposMensual);
            return false
        }

        //Calculamos los cupos por día
        //  Regla 2.3: El sistema debe gestionar un total de hasta 10,000 cupos disponibles para todos los cursos combinados en el día.
        const diaAValidar = fechaAValidar.getUTCDate();
        if (matrizFechas[mesAValidar][diaAValidar - 1].cantCupo > 10000) {
            return false
        }
       /*  3. Número de Cursos por Día
Regla 3.1: El sistema debe permitir la programación de hasta 6 cursos por día.
Regla 3.2: Los cursos programados deben ser visibles en una vista de calendario diario para facilitar la planificación.
Regla 3.3: El sistema debe permitir la programación de cursos los días martes, miércoles y jueves. */

        if (matrizFechas[mesAValidar][diaAValidar - 1].cantCursos > 6) {
            console.log("SUpera la cnatidad de cursos por dia de 6: ", matrizFechas[mesAValidar][diaAValidar - 1].cantCursos);
            return false
        }

        return true
        
    } catch (error) {
        throw error
    }
}

const res = await esPosibleLaFecha('2024-8-01')

console.log(res)

