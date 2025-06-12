/*
import { getDataRange } from "../utils/getDataRange.js";
import authorize from "../utils/getAuth.js";
import { google } from 'googleapis';

export const esInstanciaExistente = async (codCursoAValidar, fechaInicioCursadaAValidar) => {
    try {

        // Obtiene autorización
        const auth = authorize;
        const googleSheets = google.sheets({ version: 'v4', auth });

        let esExistente = false;

        const data = await getDataRange(googleSheets, auth, "principal", "B:X");

        if (data && data.length > 0) {
            const headers = data[0]; // Suponiendo que la primera fila contiene los encabezados
            const keyValueArray = data.slice(1).map((row) => {
                let rowObject = {};
                headers.forEach((header, index) => {
                    rowObject[header] = row[index];
                });
                return rowObject;
            });

            esExistente = keyValueArray.some((row) => {
                let fechaInicioCursada = row['Fecha inicio del curso'];
                let estado = row["Estado"];
                let cod = row["Código del curso"];
            
                return estado !== "SUSPENDIDO" && estado !== "CANCELADO" && cod === codCursoAValidar && fechaInicioCursada === fechaInicioCursadaAValidar;
            });
        }

        return esExistente;

    } catch (error) {
        throw error;
    }
}
*/