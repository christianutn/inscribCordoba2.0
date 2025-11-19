import { google } from 'googleapis';
import stream from 'stream';
import dotenv from 'dotenv';
dotenv.config();

const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

class GoogleDriveService {
    constructor() {
        this.jwtClient = new google.auth.JWT(
            process.env.GOOGLE_CLIENT_EMAIL,
            null,
            privateKey,
            ['https://www.googleapis.com/auth/drive']
        );
        this.drive = google.drive({ version: 'v3', auth: this.jwtClient });
    }

    /**
     * Sube un archivo a una carpeta específica en Google Drive.
     * @param {object} file - El objeto del archivo a subir (compatible con multer), que incluye `buffer` y `mimetype`.
     * @param {string} area - El nombre de área asociada al archivo, usada para nombrar el archivo.
     * @param {string} coordinador - El apellido del coordinador asociado al archivo, usado para nombrar el archivo.
     * @param {number|string} id - El identificador único para el archivo, usado como prefijo en el nombre.
     * @returns {Promise<object>} Un objeto con el `id` y `webViewLink` del archivo subido en Google Drive.
     */
    async uploadFile(file, area, coordinador, id) {
        try {
            const bufferStream = new stream.PassThrough();
            bufferStream.end(file.buffer);
    
            // Construir el nombre del archivo como id_area_coordinador.pdf
            const fileName = `${id}_${area}_${coordinador}.pdf`;
    
            const { data } = await this.drive.files.create({
                media: {
                    mimeType: file.mimetype,
                    body: bufferStream,
                },
                requestBody: {
                    name: fileName,
                    parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
                },
                fields: 'id, webViewLink',
            });
            
            return data;
        } catch (error) {
            // Opcional: Registrar el error específico del servicio de Drive
            console.error(`[GoogleDriveService] Falló el intento de subir el archivo: ${error.message}`);
            // Volver a lanzar el error para que el llamador (el controlador) pueda manejarlo.
            throw error;
        }
    }
}

export default new GoogleDriveService();
