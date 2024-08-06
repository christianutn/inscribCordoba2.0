import { google } from 'googleapis';
import 'dotenv/config';



const authorize = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'), // Ajustar el formato de la clave privada
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Función para probar la autenticación y obtener datos de la hoja de cálculo
/* async function testAuthentication() {
  try {
    const auth = await authorize.getClient();
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = '149Ft5e-y8VUpvjkCtFIVBkYNVjclOhiqH39SkI27rnU'; // Reemplaza con tu ID de hoja de cálculo
    const range = 'principal!A1:D1'; // Reemplaza con el rango que deseas obtener

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    console.log('Datos de la hoja:', response.data.values);
  } catch (error) {
    console.error('Error al autenticar o acceder a la hoja de cálculo:', error);
    
  }
}

testAuthentication();
 */

export default authorize