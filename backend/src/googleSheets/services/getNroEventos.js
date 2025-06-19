/*
import { getDataRange } from "../utils/getDataRange.js"; // Importa una función para obtener datos de un rango de Google Sheets.
import authorize from "../utils/getAuth.js"; // Importa una función para autenticar con Google Sheets.
import { google } from 'googleapis'; 

export const getNroEventos = async (aplicaRestricciones) => {
    try {
        const auth = authorize;
        const googleSheets = google.sheets({ version: 'v4', auth });
        const data = await getDataRange(googleSheets, auth, "Nro Eventos", "A:D");

        const [headers, ...rows] = data;

        const keyValueArray = rows.map(row =>
            headers.reduce((acc, header, index) => ({
                ...acc,
                [header]: row[index]
            }), {})
        );

        if (keyValueArray.length === 0) {
            throw new Error("No existen eventos en la hoja de cálculo")
        }
        console.log("keyValueArray", keyValueArray)

        return keyValueArray

    } catch (error) {
        console.error("Error en getNroEventos:", error.message)
        throw new Error("Error al obtener los eventos: " + error.message)
    }
}

*/