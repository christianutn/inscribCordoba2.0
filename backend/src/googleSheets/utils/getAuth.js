import { google } from 'googleapis';
import 'dotenv/config';



const authorize = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Ajustar el formato de la clave privada
    
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export default authorize