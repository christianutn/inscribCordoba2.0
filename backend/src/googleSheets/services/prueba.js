import { getDataRange } from "../utils/getDataRange.js";
import authorize from "../utils/getAuth.js";
import { google } from 'googleapis';

const getMatrizFechas = async (fecha) => {
    try {

        //Obtiene autorización
        const auth = authorize
        const googleSheets = google.sheets({ version: 'v4', auth });

        const data = await getDataRange(googleSheets, auth, "principal", "B:X");

        const matrizFechas = Array.from({ length: 12 }, () =>
            Array.from({ length: 31 }, () => ({ cantCupo: 0, cantCursos: 0, esPosible: true, cantCursosMensual: 0, cantCupoMensual: 0, mes: null, dia: null })));


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




        for (let i = 0; i < 12; i++) {
            let totalCursosMensual = 0;
            let totalCuposMensual = 0;
            let esMesInvalido = false;
            for (let j = 0; j < 31; j++) {
                totalCursosMensual += matrizFechas[i][j].cantCursos;

                totalCuposMensual += matrizFechas[i][j].cantCupo;

                matrizFechas[i][j].cantCursosMensual += totalCursosMensual;
                matrizFechas[i][j].cantCupoMensual += totalCuposMensual;
                matrizFechas[i][j].mes = i + 1;
                matrizFechas[i][j].dia = j + 1;

                if ((totalCursosMensual > 45 || totalCuposMensual > 60000) && !esMesInvalido) {

                    for (let m = 0; m < 31; m++) {
                        esMesInvalido = true;
                        matrizFechas[i][m].esPosible = false;
                    }
                } else if (!esMesInvalido) {
                    if (matrizFechas[i][j].cantCupo > 10000) {
                        matrizFechas[i][j].esPosible = false;
                    }
    
                    if (matrizFechas[i][j].cantCursos > 6) {
    
                        matrizFechas[i][j].esPosible = false;
                    }
                }





            }

            



        }

        console.log(matrizFechas)



    } catch (error) {
        throw error
    }
}

const res = await getMatrizFechas()

console.log(res)