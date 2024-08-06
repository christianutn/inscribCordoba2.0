import { getDataRange } from "../utils/getDataRange.js";
import authorize from "../utils/getAuth.js";
import { google } from 'googleapis';
export const getCronograma = async (areaAFiltrar) => {



    try {

        //Obtiene autorización
        const auth = authorize
        const googleSheets = google.sheets({ version: 'v4', auth });

        const data = await getDataRange(googleSheets, auth, "principal", "B:X");

        if (areaAFiltrar === "todos") {
            return data
        }

        const dataFiltrada = data.filter((fila, indice) => {
            // Excluir la primera fila que contiene los encabezados
            if (indice === 0) return true;

            // Comparar el nombre del área (segunda columna)
            return fila[1] === areaAFiltrar;
        });
        return dataFiltrada
    } catch (error) {
        throw error
    }
}

