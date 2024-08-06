import 'dotenv/config';

//Obtener datos de una hoja y rango específico

export const getDataRange = async (googleSheets, auth, sheetName, range) => {

  const data = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEETS_ID,
    range: `${sheetName}!${range}`,
  });
  return data
}