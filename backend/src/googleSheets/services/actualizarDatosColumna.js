/*
import { google } from 'googleapis';
import authorize from '../utils/getAuth.js';
export const actualizarDatosColumna = async (nombreColumna, valorActual, valorNuevo) => {
    try {
        const auth = authorize;
        const googleSheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEETS_ID;
        const nombreHoja = process.env.GOOGLE_SHEETS_NOMBRE_HOJA;

        const healthCheck = await googleSheets.spreadsheets.get({ spreadsheetId });
        if (!healthCheck || healthCheck.status !== 200) {
            throw new Error("No se pudo conectar con Google Sheets. Verifica la configuración de autorización.");
        }

        const { data } = await googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range: nombreHoja,
        });

        const rows = data.values;
        if (!rows || rows.length === 0) {
            throw new Error("No se encontraron datos en el Excel del Cronograma.");
        }

        const headerRow = rows[0];
        const columnaIndex = headerRow.indexOf(nombreColumna);
        if (columnaIndex === -1) {
            throw new Error(`La columna "${nombreColumna}" no existe en la hoja del Excel del Cronograma.`);
        }

        const updates = rows.map((row, index) => {
            if (index === 0) return row;
            if (row[columnaIndex] === valorActual) {
                row[columnaIndex] = valorNuevo;
            }
            return row;
        });

        await googleSheets.spreadsheets.values.update({
            spreadsheetId,
            range: nombreHoja,
            valueInputOption: 'RAW',
            requestBody: { values: updates },
        });

        return { success: true, message: "Columna actualizada correctamente." };
    } catch (error) {
        
        throw error;
    }
};
*/