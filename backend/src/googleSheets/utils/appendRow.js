import 'dotenv/config';
export const appendRows = async (googleSheets, sheetName, startColumn, endColumn, fileNew) => {
    try {
        const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEETS_ID;
        const nuevaFila = fileNew;

        // Obtener la última fila ocupada en la columna específica
        const response = await googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!${startColumn}:${endColumn}`,
        });

        const lastRow = response.data.values ? response.data.values.length + 1 : 2;
        // console.log("LastRow: ", lastRow)
        // console.log("Datos Array", response.data.values)

        const range = `${sheetName}!${startColumn}${lastRow}:${endColumn}`;

        // Agregar la nueva fila en el rango calculado
        const appendResponse = await googleSheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: [nuevaFila],
            },
        });

        // Verificar si la operación fue exitosa
        if (appendResponse.status === 200) {
            return appendResponse.data;
        } else {
            throw new Error(`Error al agregar la nueva fila. Respuesta: ${appendResponse.status} ${appendResponse.statusText}`);
        }
    } catch (error) {
        // Asegurarse de que el mensaje de error sea una cadena
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido al agregar la nueva fila';
        throw new Error(`Error al agregar la nueva fila: ${errorMessage}`);
    }
};
